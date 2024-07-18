<?php

namespace Resound\Controllers;

use Resound\Classes\App\Caches\ArtistPictureCache;
use Resound\Middlewares\IsLogged;
use Resound\Models\Artist;
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
            Route::get("/clear-picture-cache", [self::class, "clearPictureCache"])
        );
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
            return new Response($data, 200);

        if (!Artist::findId($artistId))
            return "Artist not found !";

        info("Added $artistId to artists to fetch");
        self::pushQueueItem(["id" => $artistId]);
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
        $pictureURL = preg_replace("/\d+x\d+[a-z]{2}(\.[a-z]+)$/", "1024x1024sr$1", $pictureURL);




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