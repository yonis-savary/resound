<?php

namespace Resound\Controllers;

use Resound\Middlewares\IsLogged;
use Resound\Models\Track;
use Sharp\Classes\Web\Controller;
use Sharp\Classes\Web\Route;
use Sharp\Classes\Web\Router;

class MoodController
{
    use Controller;

    public static function declareRoutes(Router $router)
    {
        $router->addGroup(
            ["path" => "api/mood", "middlewares" => IsLogged::class],
            Route::get("/generate/{uuid:songUUID}", [self::class, "generateMoodPlaylist"])
        );
    }

    public static function getGenreSimilarRecord(string $genre, int $releaseYear)
    {

    }

    public static function shuffleArtist(string $artistUUID)
    {

    }

    public static function generateMoodPlaylist($_, string $baseSongUUID)
    {
        $song = Track::findId($baseSongUUID);
        $artistName = $song["album"]["artist"]["data"]["name"];
        $genre = $song["album"]["data"]["genre"];

        debug(buildQuery(
            "SELECT
                track.uuid,
                (track.artist LIKE '%{}%') artist_likeness,
                (genre LIKE '%{}%') as genre_likeness
            FROM track
            JOIN album ON album = album.uuid
            JOIN artist ON album.artist = artist.uuid
            WHERE track.uuid <> {}
            ORDER BY artist_likeness DESC, RAND(), genre_likeness DESC, RAND()
            LIMIT 100
        ", [$artistName, $genre, $baseSongUUID]));

        return query (
            "SELECT
                track.uuid,
                (track.artist LIKE '%{}%') artist_likeness,
                (genre LIKE '%{}%') as genre_likeness
            FROM track
            JOIN album ON album = album.uuid
            JOIN artist ON album.artist = artist.uuid
            WHERE track.uuid <> {}
            ORDER BY artist_likeness DESC, genre_likeness DESC, RAND()
            LIMIT 100
        ", [$artistName, $genre, $baseSongUUID]);
    }
}