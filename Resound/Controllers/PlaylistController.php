<?php

namespace YonisSavary\Resound\Controllers;

use YonisSavary\Sharp\Classes\Data\Database;
use YonisSavary\Sharp\Classes\Data\DatabaseQuery;
use YonisSavary\Sharp\Classes\Data\ObjectArray;
use YonisSavary\Sharp\Classes\Extras\Autobahn;
use YonisSavary\Sharp\Classes\Http\Request;
use YonisSavary\Sharp\Classes\Http\Response;
use YonisSavary\Sharp\Classes\Web\Controller;
use YonisSavary\Sharp\Classes\Web\Route;
use YonisSavary\Sharp\Classes\Web\Router;
use YonisSavary\Resound\Classes\Straws\UserID;
use YonisSavary\Resound\Middlewares\IsLogged;
use YonisSavary\Resound\Models\Playlist;
use YonisSavary\Resound\Models\PlaylistTrack;

class PlaylistController
{
    use Controller;

    public static function declareRoutes(Router $router)
    {
        $router->groupCallback(
            ["path" => "api", "middlewares" => IsLogged::class],

            function(){

                // Allow users to edit only their playlists
                Autobahn::getInstance()->all(Playlist::class,
                    [fn(array &$params) => $params["user"] = UserID::get()],
                    [fn(array $object) => $object["user"] === UserID::get()],
                    [],
                    [fn(DatabaseQuery &$query) => $query->where("user", UserID::get()) ],
                    [fn(DatabaseQuery &$query) => $query->where("user", UserID::get()) ]
                );
            }
        );

        $router->addGroup(
            ["path" => "api/playlists", "middlewares" => IsLogged::class],

            Route::post("/{int:playlist}/add-album/{album}",     [self::class, "addAlbum"]),
            Route::post("/{int:playlist}/add-track/{track}",     [self::class, "addTrack"]),
            Route::post("/{int:playlist}/remove-track/{bindId}", [self::class, "removeTrack"]),
            Route::post("/{int:playlist}/reorder",               [self::class, "reOrderTracks"]),
            Route::get ("/{int:playlist}/covers",                [self::class, "getCovers"]),
            Route::get ("/{int:playlist}/content",               [self::class, "getContent"]),

            Route::get ("/popular", [self::class, "getPopularPlaylists"]),
        );
    }

    public static function addAlbum(Request $request, string $playlist, string $album)
    {
        query(
            "INSERT INTO playlist_track (playlist, track)
            SELECT {}, id
            FROM track
            WHERE album = {}
        ", [$playlist, $album]);

        return "OK";
    }

    public static function addTrack(Request $request, string $playlist, string $track)
    {
        PlaylistTrack::insertArray([
            "playlist" => $playlist,
            "track" => $track
        ]);

        return "OK";
    }

    public static function removeTrack(Request $request, string $playlist, int $bindId)
    {
        $exists = Playlist::select()
        ->where("id", $playlist)
        ->where("user", UserID::get())
        ->first();

        if (!$exists)
            return Response::json("Playlist not found", 404);

        PlaylistTrack::delete()
        ->where("playlist", $playlist)
        ->where("id", $bindId)
        ->fetch();

        return "OK";
    }



    public static function getPopularPlaylists()
    {
        $mostListenedPlaylists = query(
            "SELECT playlist as id, COUNT(user_listening.id) as count
            FROM user_listening
            WHERE playlist IS NOT NULL
            ORDER BY COUNT(user_listening.id) DESC
            LIMIT 10
        ");

        if (count($mostListenedPlaylists) === 1 && $mostListenedPlaylists[0]["id"] == null)
            return [];

        foreach ($mostListenedPlaylists as &$playlist)
            $playlist = Playlist::findId($playlist["id"]);

        return $mostListenedPlaylists;
    }

    public static function getContent(Request $request, string $playlist)
    {
        $private = Playlist::select()
        ->where("private", true)
        ->where("id", $playlist)
        ->first();

        if ($private && $private["data"]["user"] !== UserID::get())
            return "Private playlist !";

        return [
            "playlist" => Playlist::findId($playlist),
            "tracks" => PlaylistTrack::select()->where("playlist", $playlist)->fetch()
        ] ;
    }

    /**
     * Get the covers of the 4 dominants albums in a playlist
     */
    public static function getCovers(Request $request, string $playlist)
    {
        return ObjectArray::fromQuery(
            "SELECT album, COUNT(track.id)
            FROM playlist_track
            JOIN track ON track = track.id
            WHERE playlist = {}
            GROUP BY track.album
            ORDER BY COUNT(track.id) DESC
            LIMIT 4
        ", [$playlist])
        ->map(fn($album) => "<img src='/api/library/album-cover/$album'>")
        ->join("");
    }

    public static function reOrderTracks(Request $request, string $playlist)
    {
        $order = $request->params("order");
        $order = json_decode($order, flags: JSON_THROW_ON_ERROR);

        if (!is_array($order))
            return Response::json("order must be an array", $order);

        for ($i=0; $i<count($order); $i++)
            $order[$i] = "WHEN id = ". intval($order[$i])." THEN ". $i+1;

        $order = join("\n", $order);

        Database::getInstance()->query(
            "UPDATE playlist_track
            SET position = CASE
                $order
            END
            WHERE playlist = {}
        ", [$playlist]);

        return "OK";
    }
}