<?php

namespace Resound\Controllers;

use YonisSavary\Sharp\Classes\Data\Database;
use YonisSavary\Sharp\Classes\Data\ObjectArray;
use YonisSavary\Sharp\Classes\Env\Cache;
use YonisSavary\Sharp\Classes\Env\Configuration;
use YonisSavary\Sharp\Classes\Env\Drivers\FTPDriver;
use YonisSavary\Sharp\Classes\Env\Storage;
use YonisSavary\Sharp\Classes\Extras\Autobahn;
use YonisSavary\Sharp\Classes\Http\Request;
use YonisSavary\Sharp\Classes\Http\Response;
use YonisSavary\Sharp\Classes\Web\Controller;
use YonisSavary\Sharp\Classes\Web\Route;
use YonisSavary\Sharp\Classes\Web\Router;
use Resound\Classes\Straws\UserID;
use Resound\Middlewares\IsLogged;
use Resound\Models\Album;
use Resound\Models\Artist;
use Resound\Models\TagAnomaly;
use Resound\Models\Track;
use ZipArchive;

class LibraryController
{
    use Controller;

    protected static ?Cache $stateCache = null;

    public static function declareRoutes(Router $router)
    {
        # Making getAlbumCover public makes it accessible to mediaSession softwares/extensions
        $router->addGroup(
            ["path" => "api/library"],
            Route::get("/album-cover/{int:albumID}", [self::class, "getAlbumCover"]),
        );

        $router->addGroup(
            ["path" => "api/library", "middlewares" => IsLogged::class],

            Route::get("/last-additions", [self::class, "getLastAdditions"]),
            Route::get("/most-listened",  [self::class, "getMostListened"]),
            Route::get("/instant-playlists", [self::class, "getInstantPlayslists"]),
            Route::get("/random-all",     [self::class, "getRandomTrackList"]),
            Route::get("/shuffle-genre/{genre}",     [self::class, "getRandomTrackListFromGenre"]),
            Route::get("/genres-list",    [self::class, "getGenreHTML"]),
            Route::get("/years-list",     [self::class, "getYearsHTML"]),

            Route::post("/play-list-register", [self::class, "registerPlayList"]),
            Route::get ("/play-list-get",       [self::class, "getPlayList"]),

            Route::post("/player-register-state", [self::class, "registerPlayerState"]),
            Route::get ("/player-get-state",       [self::class, "getPlayerState"]),

            Route::get("/artist/{int:id}/tracks", [self::class, "getArtistTracksAndFeaturing"]),
            Route::get("/artist/{int:id}/shuffle", [self::class, "shuffleArtistTracksAndFeaturing"]),

            Route::get("/album/{int:id}/shuffle", [self::class, "shuffleAlbumTracks"]),
            Route::get("/album/{int:id}/download", [self::class, "downloadAlbumZIP"]),
            Route::get("/album/{int:id}/delete-data", [self::class, "deleteAlbumData"]),
            Route::get("/album/{int:id}/delete-files", [self::class, "deleteAlbumFiles"])
        );

        $router->groupCallback(
            ["path" => "api", "middlewares" => IsLogged::class],

            function(Router $router){
                $autobahn = Autobahn::getInstance();

                $router->addRoutes(
                    Route::get("/track-batch/{int:page}", [self::class, "getTrackBatch"]),
                    $autobahn->read(Album::class),
                    $autobahn->update(Album::class),
                    $autobahn->read(Artist::class),
                    $autobahn->read(Track::class),
                    $autobahn->read(TagAnomaly::class),
                );
            }
        );
    }

    public static function isLibraryLocal(): bool
    {
        $libraryConfig = Configuration::getInstance()->get("library", []);
        return ($libraryConfig["driver"] ?? "ftp") === "local";
    }

    public static function getLibraryStorage(): Storage
    {
        $libraryConfig = Configuration::getInstance()->get("library", []);

        $driver = $libraryConfig["driver"] ?? "ftp";

        switch ($driver)
        {
            case "ftp":
                return new Storage(
                    $libraryConfig["path"],
                    new FTPDriver(
                        $libraryConfig["url"],
                        $libraryConfig["username"],
                        $libraryConfig["password"],
                        $libraryConfig["port"] ?? 21,
                    )
                );
            case "local":
                return new Storage($libraryConfig["path"]);
        }

    }

    public static function getLastAdditions()
    {
        return Album::select()
        ->order("album", "id", "desc")
        ->limit(10)
        ->fetch();
    }

    public static function getMostListened()
    {
        return ObjectArray::fromQuery(
            "SELECT DISTINCT album, COUNT(user_listening.id) as listening_count
            FROM track
            JOIN user_listening ON track = track.id AND user = {}
            WHERE user_listening.timestamp > DATE_SUB(NOW(), INTERVAL 1 MONTH)
            GROUP BY track.album
            ORDER BY listening_count DESC
            LIMIT 4
        ", [UserID::get()])
        ->map(fn($x) => Album::findId($x))
        ->collect()
        ;
    }


    public static function getInstantPlayslists()
    {
        return ObjectArray::fromQuery(
            "SELECT genre, COUNT(*) counting
            FROM user_listening
            JOIN track ON track = track.id
            JOIN album ON album = album.id
            WHERE user_listening.user = {}
            GROUP BY album.genre
            ORDER BY counting DESC
            LIMIT 4
        ", [UserID::get()])
        ->map(function($genre)
        {
            $favorites = ObjectArray::fromQuery(
                "SELECT track
                FROM user_like
                JOIN track ON track = track.id
                JOIN album ON album = album.id AND album.genre = {}
                WHERE user = {}
                LIMIT 150
            ", [$genre, UserID::get()]);

            $toFetch = $favorites->length() < 25 ? 100 : ceil($favorites->length() * 0.25);

            $otherTitles = ObjectArray::fromQuery(
                "SELECT track.id
                FROM track
                JOIN album ON album = album.id AND genre = {}
                WHERE track.id NOT IN (SELECT track FROM user_like WHERE user = {})
                ORDER BY RAND()
                LIMIT $toFetch
            ", [$genre, UserID::get()]);

            $tracksToPlay = [ ...$favorites->collect(),  ...$otherTitles->collect() ];
            shuffle($tracksToPlay);

            return ["genre" => $genre, "tracks" => $tracksToPlay];
        })
        ->collect();
    }



    public static function getAlbumCoverStorage(): Storage
    {
        return Storage::getInstance()->getSubStorage("Resound/Covers");
    }

    public static function getAlbumCover($_, string $albumId): Response
    {
        $coverStorage = self::getAlbumCoverStorage();

        $content = "";
        if ($coverStorage->isFile($albumId))
            $content = $coverStorage->read($albumId);

        return (new Response($content, 200, [
            "access-control-allow-origin" => "*",
            "Content-Type" => "image/png",
            "Content-Length" => strlen($content),
            "Cache-Control" => "max-age=". Cache::DAY*31
        ]));
    }

    public static function getRandomTrackList(Request $request)
    {
        debug($request->params("favoritesOnly"));
        $favoriteExpression = $request->params("favoritesOnly") ?
            buildQuery("WHERE track.id IN (SELECT track FROM user_like WHERE user = {})", [UserID::get()]):
            "";

        return ObjectArray::fromQuery(
            "SELECT id
            FROM track
            $favoriteExpression
            ORDER BY RAND()
            LIMIT 100
        ")->collect();
    }

    public static function getRandomTrackListFromGenre(Request $request, string $genre)
    {
        $favoriteExpression = $request->params("favoritesOnly") ?
            buildQuery("WHERE track.id IN (SELECT track FROM user_like WHERE user = {})", [UserID::get()]):
            "";

        return ObjectArray::fromQuery(buildQuery(
            "SELECT track.id
            FROM track
            JOIN album ON album = album.id AND album.genre = {}
            $favoriteExpression
            ORDER BY RAND()
            LIMIT 100
        ", [$genre]))->collect();
    }

    public static function getGenreHTML()
    {
        return ObjectArray::fromQuery("SELECT DISTINCT genre FROM album ORDER BY genre")
        ->filter()
        ->map(function($genre) {
            return [
                $genre,
                ObjectArray::fromQuery("SELECT id FROM album WHERE genre = {}", [$genre])
                ->map(fn($id) => "<img loading='lazy' src='/api/library/album-cover/$id' class='album-cover small'>")
                ->collect()
            ];
        })
        ->map(function($data){
            list($genre, $albums) = $data;
            return "
            <section genre='$genre' class='card'>
                <section class='flex-column gap-1'>
                    <section class='flex-row align-center'>
                        <h2 class='h4'>$genre</h2>
                        <small>(".count($albums)." releases)</small>
                    </section>
                    <section class='flex-row scrollable horizontal align-center gap-1'>".join("", $albums)."</section>
                </section>
            </section>";
        })
        ->join("");
    }


    public static function getYearsHTML()
    {
        return ObjectArray::fromQuery("SELECT DISTINCT SUBSTR(release_year, 1, 4) release_year FROM album ORDER BY release_year")
        ->filter()
        ->map(function($year) {
            return [
                $year,
                ObjectArray::fromQuery("SELECT id FROM album WHERE SUBSTR(release_year, 1, 4) = {}", [$year])
                ->map(fn($id) => "<img loading='lazy' src='/api/library/album-cover/$id' class='album-cover small'>")
                ->collect()
            ];
        })
        ->map(function($data){
            list($year, $albums) = $data;
            return "
            <section year='$year' class='card'>
                <section class='flex-column gap-1'>
                    <section class='flex-row align-center'>
                        <h2 class='h4'>$year</h2>
                        <small>(".count($albums)." releases)</small>
                    </section>
                    <section class='flex-row scrollable horizontal align-center gap-1'>".join("", $albums)."</section>
                </section>
            </section>";
        })
        ->join("");
    }

    protected static function getUserPlaylistCache(): Cache
    {
	if (!self::$stateCache)
		self::$stateCache = new Cache(Storage::getInstance()->getSubStorage("Resound/user-playlists"));
	return self::$stateCache;
    }

    public static function registerPlayList(Request $request)
    {
        $playlist = $request->body();

        if (strlen(json_encode($playlist)) > 1024*1024*512)
            return Response::json("Too much data", 500);

        $storage = self::getUserPlaylistCache();
        $storage->set(UserID::get(), $playlist, Cache::PERMANENT);

        return "OK";
    }

    public static function getPlayList()
    {
        $storage = self::getUserPlaylistCache();
        if (! $data = $storage->try(UserID::get()))
            return [
                "songs" => [],
                "playlistId" => null
            ];

        $songs = $data["songs"];
        $songsData = Track::select()->whereSQL("track.id IN {}", [$songs])->fetch();

        return [
            "songs" => $songs,
            "songsData" => $songsData,
            "playlistID" => $data["playlistID"]
        ];



    }




    protected static function getUserPlayerCache(): Cache
    {
        return new Cache(Storage::getInstance()->getSubStorage("Resound/user-player-state"));
    }

    public static function registerPlayerState(Request $request)
    {
        $player = $request->body();

        if (strlen(json_encode($player)) > 1024*1024*512)
            return Response::json("Too much data", 500);

        $storage = self::getUserPlayerCache();
        $storage->set(UserID::get(), $player, Cache::PERMANENT);

        return "OK";
    }

    public static function getPlayerState()
    {
        $storage = self::getUserPlayerCache();
        return $storage->get(UserID::get()) ?? null;
    }


    public static function getArtistTracksAndFeaturing(Request $request, int $artist)
    {
        $artistName = Artist::findId($artist)->name;
        $favoriteExpression = $request->params("favoritesOnly") ?
            buildQuery("AND track.id IN (SELECT track FROM user_like WHERE user = {})", [UserID::get()]):
            "";

        return Track::select()
        ->whereSQL("CONCAT(track.artist, ' ', `track&album&artist`.name) LIKE '%{}%'  $favoriteExpression", [$artistName])
        ->order("track&album", "release_year", "DESC")
        ->order("track&album", "name", "DESC")
        ->order("track", "position", "ASC")
        ->fetch();
    }

    public static function shuffleArtistTracksAndFeaturing(Request $request, int $artist)
    {
        $artistName = Artist::findId($artist)->name;
        $favoriteExpression = $request->params("favoritesOnly") ?
            buildQuery("AND track.id IN (SELECT track FROM user_like WHERE user = {})", [UserID::get()]):
            "";

        return ObjectArray::fromQuery(
            "SELECT track.id
            FROM track
            JOIN album ON album = album.id
            JOIN artist ON album.artist = artist.id
            WHERE CONCAT(track.artist, ' ', artist.name) LIKE '%{}%'
            $favoriteExpression
            ORDER BY RAND()
        ", [$artistName])->collect();
    }


    public static function downloadAlbumZIP(Request $request, int $albumId)
    {
        $album = Album::findId($albumId);
        $albumLabel = $album->artist->name . "-". $album->name;

        $tracks = Track::select()->where("album", $albumId)->fetch();
        $libary = self::getLibraryStorage();

        $tmpStorage = Storage::getInstance()->getSubStorage("tmp/download");
        $zipName = $tmpStorage->path(uniqid($albumLabel . "-") . ".zip");
        $zip = new ZipArchive();

        if (!$zip->open($zipName, ZipArchive::CREATE))
            die("Fatal: could not open archive");

        foreach ($tracks as $track)
        {
            $path = $track->path;
            $entryName = str_replace($libary->getRoot(), "", $path);
            $entryName = preg_replace("/^\\//", "", $entryName);

            $tmpFile = $tmpStorage->path(uniqid("download"));
            file_put_contents($tmpFile, $libary->read($path));

            $zip->addFile($tmpFile, $entryName);
        }

        $zip->close();

        foreach ($tmpStorage->listFiles() as $file)
        {
            if ($file == $zipName)
                continue;
            unlink($file);
        }

        return Response::file($zipName, basename($zipName));
    }

    public static function deleteAlbumData(Request $request, int $albumId)
    {
        Album::delete()->where("id", $albumId)->fetch();
        return "OK";
    }

    public static function deleteAlbumFiles(Request $request, int $albumId)
    {
        $tracks = Track::select()->where("album", $albumId)->fetch();
        $libary = self::getLibraryStorage();

        foreach ($tracks as $track)
        {
            $path = $track->path;
            $libary->unlink($path);
        }

        return self::deleteAlbumData($request, $albumId);
    }

    public static function shuffleAlbumTracks(Request $request, int $id)
    {
        $favoriteExpression = $request->params("favoritesOnly") ?
            buildQuery("AND track.id IN (SELECT track FROM user_like WHERE user = {})", [UserID::get()]):
            "";

        return ObjectArray::fromQuery(
            "SELECT id
            FROM track
            WHERE album = {}
            $favoriteExpression
            ORDER BY RAND()
        ", [$id])->collect();
    }


    public static function getTrackBatch($_, int $page)
    {
        return Track::select()
        ->order("track", "album")
        ->order("track", "disc_number")
        ->order("track", "position")
        ->limit(100, $page*100)
        ->fetch();
    }
}
