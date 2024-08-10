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

            Route::get("/likes/list", [self::class, "getAllLikesId"]),
            Route::get("/likes/genres", [self::class, "getLikedGenres"]),
        );
    }

    public static function getAllLikesId()
    {
        return ObjectArray::fromQuery("SELECT track FROM user_like WHERE user = {}", [UserID::get()])->join(",");
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
        ", [UserID::get()]);
    }
}