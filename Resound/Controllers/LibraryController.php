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

            Route::get("/album-cover/{uuid:albumUUID}", [self::class, "getAlbumCover"])
        );

        $router->addGroup(
            ["path" => "api/library", "middlewares" => IsLogged::class],

            Route::get("/last-additions", [self::class, "getLastAdditions"]),
            Route::get("/most-listened", [self::class, "getMostListened"]),
            Route::get("/random-all", [self::class, "getRandomTrackList"]),
            Route::get("/genres-list", [self::class, "getGenreHTML"])
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
}