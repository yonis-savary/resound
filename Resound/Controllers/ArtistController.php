<?php

namespace Resound\Controllers;

use Resound\Classes\App\Caches\ArtistPictureCache;
use Resound\Classes\Straws\UserID;
use Resound\Middlewares\IsLogged;
use Resound\Models\Album;
use Resound\Models\Artist;
use Resound\Models\Track;
use Sharp\Classes\Core\Logger;
use Sharp\Classes\Env\Cache;
use Sharp\Classes\Extras\QueueHandler;
use Sharp\Classes\Http\Request;
use Sharp\Classes\Http\Response;
use Sharp\Classes\Web\Controller;
use Sharp\Classes\Web\Route;
use Sharp\Classes\Web\Router;

class ArtistController
{
    use QueueHandler, Controller;

    public static function declareRoutes(Router $router)
    {
        $router->addGroup(
            ["path" => "api/artist", "middlewares" => IsLogged::class],
            Route::get("{int:id}/picture", [self::class, "getPicture"]),
            Route::get("/clear-picture-cache", [self::class, "clearPictureCache"]),
            Route::get("/generate-mood/{int:songID}", [self::class, "generateMoodPlaylist"])
        );
    }

    public static function generateMoodPlaylist(Request $request, string $baseSongID)
    {
        $song = Track::findId($baseSongID);
        $artistName = $song["album"]["artist"]["data"]["name"];
        $genre = $song["album"]["data"]["genre"];

        $favoriteExpression = $request->params("favoritesOnly") ? 
            buildQuery("AND track.id IN (SELECT track FROM user_like WHERE user = {})", [UserID::get()]):
            "";

        return query (
            "SELECT
                track.id,
                (track.artist LIKE '%{}%') artist_likeness,
                (genre LIKE '%{}%') as genre_likeness
            FROM track
            JOIN album ON album = album.id
            JOIN artist ON album.artist = artist.id
            WHERE track.id <> {}
            $favoriteExpression
            ORDER BY artist_likeness DESC, genre_likeness DESC, RANDOM()
            LIMIT 100
        ", [$artistName, $genre, $baseSongID]);
    }
    public static function clearPictureCache()
    {
        $cache = ArtistPictureCache::get();

        foreach ($cache->getStorage()->listFiles() as $file)
            unlink($file);

        return "OK";
    }

    public static function getPicture(Request $req, int $artistId)
    {
        $cache = ArtistPictureCache::get();

        if ($data = $cache->try($artistId))
            return (new Response($data, 200, [
                "access-control-allow-origin" => "*",
                "Content-Type" => "image/png",
                "Content-Length" => strlen($data),
                "Cache-Control" => "max-age=". Cache::DAY*31
            ]))->removeHeaders(["Pragma"]);

        if (!Artist::findId($artistId))
            return "Artist not found !";

        info("Added $artistId to artists to fetch");
        self::pushQueueItem(["id" => $artistId]);

        if ($album = Album::find("artist", $artistId))
            return LibraryController::getAlbumCover($req, $album["data"]["id"]);

        return "";

    }


    protected static function processQueueItem(array $data): bool
    {
        $artistId = $data["id"];
        $cache = ArtistPictureCache::get();

        if ($cache->has($artistId))
            return false;

        $artist = Artist::findId($artistId);
        $artistName = $artist["data"]["name"];

        info("Fetching '$artistName''s picture !");

        $response = (new Request(
            "GET",
            "https://itunes.apple.com/search",
            get: [
                "term" => $artistName,
                "entity" => "musicArtist",
                "limit" => 1
            ]
        ))->fetch();

        if ($response->getResponseCode() != 200)
        {
            info("Artist not found on itunes", $response->getContent());
            $cache->set($artistId, "", Cache::DAY);
            return false;
        }

        $response = $response->getContent();

        if (is_string($response))
            $response = json_decode($response, true);

        if (!count($response["results"]))
        {
            info("Artist not found on itunes (err:2)");
            $cache->set($artistId, "", Cache::DAY);
            return false;
        }

        $artistPage = (new Request(
            "GET",
            $response["results"][0]["artistLinkUrl"]
        ))->fetch();

        if ($artistPage->getResponseCode() != 200)
        {
            info("Artist page not found on itunes");
            $cache->set($artistId, "", Cache::DAY);
            return true;
        }

        $artistPage = $artistPage->getContent();

        $matches = [];
        if (!preg_match("/og\:image\:secure_url\" content=\"(.+?)\"/", $artistPage, $matches))
        {
            info("Artist picture not found on itunes");
            $cache->set($artistId, "", Cache::DAY);
            return true;
        }

        $pictureURL = $matches[1];
        $pictureURL = preg_replace("/\d+x\d+[a-z]{2}(\.[a-z]+)$/", "512x512sr$1", $pictureURL);

        $pictureResponse = (new Request(
            "GET",
            $pictureURL
        ))->fetch();

        if ($pictureResponse->getResponseCode() != 200)
        {
            info("Error while fetching artist picture");
            $cache->set($artistId, "", Cache::DAY);
            return true;
        }

        $pictureFile = $pictureResponse->getContent();

        info("Successfuly fetched picture !");
        $cache->set($artistId, $pictureFile, Cache::DAY * 31);

        return true;
    }


}