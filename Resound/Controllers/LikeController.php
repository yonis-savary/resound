<?php

namespace Resound\Controllers;

use Resound\Classes\Straws\UserID;
use Resound\Middlewares\IsLogged;
use Resound\Models\UserLike;
use Sharp\Classes\Data\DatabaseQuery;
use Sharp\Classes\Data\ObjectArray;
use Sharp\Classes\Extras\Autobahn;
use Sharp\Classes\Http\Request;
use Sharp\Classes\Web\Controller;
use Sharp\Classes\Web\Route;
use Sharp\Classes\Web\Router;

class LikeController
{
    use Controller;

    public static function declareRoutes(Router $router)
    {
        $router->groupCallback(
            ["path" => "api", "middlewares" => IsLogged::class],
            function(Router $router)
            {
                $autobahn = Autobahn::getInstance();

                $autobahn->all(
                    UserLike::class,
                    [fn(&$data) => $data["user"] = UserID::get()],
                    [fn(&$data) => $data["user"] = UserID::get()],
                    [fn(DatabaseQuery $query) => $query->where("user", UserID::get())],
                    [fn(DatabaseQuery $query) => $query->where("user", UserID::get())],
                    [fn(DatabaseQuery $query) => $query->where("user", UserID::get())]
                );
            }
        );


        $router->addGroup(
            ["path" => "api", "middlewares" => IsLogged::class],

            Route::get("/likes/genres", [self::class, "getLikedGenres"]),
            Route::get("/likes/shuffle/genre", [self::class, "shuffleGenre"]),
            Route::get("/likes/shuffle/all", [self::class, "shuffleAll"]),
        );
    }

    public static function getLikedGenres()
    {
        return query(
            "SELECT
                genre,
                COUNT(DISTINCT track.id) as count
            FROM user_like
            JOIN track ON track = track.id
            JOIN album ON album = album.id

            WHERE user_like.user = {}

            GROUP BY genre
            ORDER BY count DESC
            LIMIT 5
        ", [UserID::get()]);
    }

    public static function shuffleGenre(Request $request)
    {
        $genre = $request->params("genre");

        return ObjectArray::fromQuery(
            "SELECT
                track.id
            FROM user_like
            JOIN track ON track = track.id
            JOIN album ON album = album.id

            WHERE user_like.user = {}
            AND album.genre = {}

            ORDER BY RANDOM()
        ", [UserID::get(), $genre])->collect();
    }

    public static function shuffleAll()
    {
        return ObjectArray::fromQuery(
            "SELECT
                track.id
            FROM user_like
            JOIN track ON track = track.id
            JOIN album ON album = album.id

            WHERE user_like.user = {}

            ORDER BY RANDOM()
        ", [UserID::get()])->collect();
    }

}