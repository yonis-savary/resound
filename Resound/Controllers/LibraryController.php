<?php

namespace Resound\Controllers;

use Sharp\Classes\Data\Database;
use Sharp\Classes\Data\ObjectArray;
use Sharp\Classes\Env\Cache;
use Sharp\Classes\Env\Configuration;
use Sharp\Classes\Env\Drivers\FTPDriver;
use Sharp\Classes\Env\Storage;
use Sharp\Classes\Extras\Autobahn;
use Sharp\Classes\Http\Request;
use Sharp\Classes\Http\Response;
use Sharp\Classes\Web\Controller;
use Sharp\Classes\Web\Route;
use Sharp\Classes\Web\Router;
use Resound\Classes\Straws\UserUUID;
use Resound\Middlewares\IsLogged;
use Resound\Models\Album;
use Resound\Models\Artist;
use Resound\Models\TagAnomaly;
use Resound\Models\Track;
use ZipArchive;

class LibraryController
{
    use Controller;

    public static function declareRoutes(Router $router)
    {
        # Making getAlbumCover public makes it accessible to mediaSession softwares/extensions
        $router->addGroup(
            ["path" => "api/library"],

            Route::get("/album-cover/{uuid:albumUUID}", [self::class, "getAlbumCover"]),

            Route::post("/play-list-register", [self::class, "registerPlayList"]),
            Route::get("/play-list-get", [self::class, "getPlayList"]),

            Route::post("/player-register-state", [self::class, "registerPlayerState"]),
            Route::get("/player-get-state", [self::class, "getPlayerState"]),
        );

        $router->addGroup(
            ["path" => "api/library", "middlewares" => IsLogged::class],

            Route::get("/last-additions", [self::class, "getLastAdditions"]),
            Route::get("/most-listened", [self::class, "getMostListened"]),
            Route::get("/random-all", [self::class, "getRandomTrackList"]),
            Route::get("/genres-list", [self::class, "getGenreHTML"]),
            Route::get("/years-list", [self::class, "getYearsHTML"]),
        );

        $router->groupCallback(
            ["path" => "api", "middlewares" => IsLogged::class],

            function(){
                $autobahn = Autobahn::getInstance();

                $autobahn->read(Album::class);
                $autobahn->update(Album::class);
                $autobahn->read(Artist::class);
                $autobahn->read(Track::class);

                $autobahn->read(TagAnomaly::class);
            }
        );
    }

    public static function getLibraryStorage(): Storage
    {
        $libraryConfig = Configuration::getInstance()->get("library", []);

        return new Storage(
            $libraryConfig["path"],
            new FTPDriver(
                $libraryConfig["url"],
                $libraryConfig["username"],
                $libraryConfig["password"],
                $libraryConfig["post"] ?? 21,
            )
        );
    }

    public static function getLastAdditions()
    {
        $lastAlbums = Database::getInstance()->query(
            "SELECT DISTINCT album
            FROM track
            ORDER BY edition_date DESC
            LIMIT 10
        ");

        if (!count($lastAlbums))
            return [];

        $lastAlbums = array_map(fn($x) => $x["album"], $lastAlbums);

        return Album::select()->whereSQL("album.uuid IN {}", [$lastAlbums])->fetch();

    }

    public static function getMostListened()
    {
        return ObjectArray::fromArray(query(
            "SELECT DISTINCT album, COUNT(user_listening.id)
            FROM track
            JOIN user_listening ON track = track.uuid AND user = {}
            WHERE user_listening.timestamp > DATE_SUB(NOW(), INTERVAL 1 MONTH)
            GROUP BY track.album
            ORDER BY COUNT(user_listening.id) DESC
            LIMIT 10
        ", [UserUUID::get()])
        )
        ->map(fn($x) => Album::findId($x["album"]))
        ->collect()
        ;
    }

    public static function getAlbumCoverStorage(): Storage
    {
        return Storage::getInstance()->getSubStorage("Resound/Covers");
    }

    public static function getAlbumCover($_, string $albumUUID): Response
    {
        $coverStorage = self::getAlbumCoverStorage();

        $content = "";
        if ($coverStorage->isFile($albumUUID))
            $content = $coverStorage->read($albumUUID);

        return (new Response($content, 200, [
            "access-control-allow-origin" => "*",
            "Content-Type" => "image/png",
            "Content-Length" => strlen($content),
            "Cache-Control" => "max-age=". Cache::DAY*31
        ]));
    }

    public static function getRandomTrackList()
    {
        return ObjectArray::fromArray(Database::getInstance()->query(
            "SELECT uuid
            FROM track
            ORDER BY RAND()
            LIMIT 100
        "))->map(fn($x) => $x["uuid"])->collect();
    }

    public static function getGenreHTML()
    {
        return ObjectArray::fromArray(query("SELECT DISTINCT genre FROM album ORDER BY genre"))
        ->map(fn($x) => $x["genre"])
        ->map(function($genre) {
            return [
                $genre,
                ObjectArray::fromArray(query("SELECT uuid FROM album WHERE genre = {}", [$genre]))
                ->map(fn($x) => $x["uuid"])
                ->map(fn($uuid) => "<img src='/api/library/album-cover/$uuid' class='album-cover small'>")
                ->collect()
            ];
        })
        ->filter(fn($data) => $data[0] !== null)
        ->map(function($data){
            list($genre, $albums) = $data;
            return "
            <section genre='$genre' class='card'>
                <section class='flex-column gap-1'>
                    <section class='flex-row align-center'>
                        <h2 class='h4'>$genre</h2>
                        <small>(".count($albums)." releases)</small>
                    </section>
                    <section class='flex-row align-center gap-1'>".join("", $albums)."</section>
                </section>
            </section>";
        })
        ->join("");
    }


    public static function getYearsHTML()
    {
        return ObjectArray::fromArray(query("SELECT DISTINCT release_year FROM album ORDER BY release_year"))
        ->map(fn($x) => $x["release_year"])
        ->map(function($year) {
            return [
                $year,
                ObjectArray::fromArray(query("SELECT uuid FROM album WHERE release_year = {}", [$year]))
                ->map(fn($x) => $x["uuid"])
                ->map(fn($uuid) => "<img src='/api/library/album-cover/$uuid' class='album-cover small'>")
                ->collect()
            ];
        })
        ->filter(fn($data) => $data[0] !== null)
        ->map(function($data){
            list($year, $albums) = $data;
            return "
            <section year='$year' class='card'>
                <section class='flex-column gap-1'>
                    <section class='flex-row align-center'>
                        <h2 class='h4'>$year</h2>
                        <small>(".count($albums)." releases)</small>
                    </section>
                    <section class='flex-row align-center gap-1'>".join("", $albums)."</section>
                </section>
            </section>";
        })
        ->join("");
    }

    protected static function getUserPlaylistCache(): Cache
    {
        return new Cache(Storage::getInstance()->getSubStorage("Resound/user-playlists"));
    }

    public static function registerPlayList(Request $request)
    {
        $playlist = $request->body();

        if (strlen(json_encode($playlist)) > 1024*1024*512)
            return Response::json("Too much data", 500);

        $storage = self::getUserPlaylistCache();
        $storage->set(UserUUID::get(), $playlist, Cache::PERMANENT);

        return "OK";
    }

    public static function getPlayList()
    {
        $storage = self::getUserPlaylistCache();
        return $storage->get(UserUUID::get()) ?? null;
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
        $storage->set(UserUUID::get(), $player, Cache::PERMANENT);

        return "OK";
    }

    public static function getPlayerState()
    {
        $storage = self::getUserPlayerCache();
        return $storage->get(UserUUID::get()) ?? null;
    }
}