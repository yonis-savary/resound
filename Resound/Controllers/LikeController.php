<?php

namespace Resound\Controllers;

use Resound\Classes\Straws\UserID;
use Resound\Middlewares\IsLogged;
use Resound\Models\UserLike;
use YonisSavary\Sharp\Classes\Data\DatabaseQuery;
use YonisSavary\Sharp\Classes\Data\ModelQuery;
use YonisSavary\Sharp\Classes\Data\ObjectArray;
use YonisSavary\Sharp\Classes\Extras\Autobahn;
use YonisSavary\Sharp\Classes\Http\Request;
use YonisSavary\Sharp\Classes\Web\Controller;
use YonisSavary\Sharp\Classes\Web\Route;
use YonisSavary\Sharp\Classes\Web\Router;

class LikeController
{
    use Controller;

    public static function declareRoutes(Router $router)
    {
        $autobahn = Autobahn::getInstance();
        $router->addGroup(
            ["path" => "api", "middlewares" => IsLogged::class],
            ...$autobahn->all(
                UserLike::class,
                [fn(&$data) => $data["user"] = UserID::get()],
                [fn(&$data) => $data["user"] = UserID::get()],
                [fn(ModelQuery $query) => $query->where("user", UserID::get())],
                [fn(ModelQuery $query) => $query->where("user", UserID::get())],
                [fn(ModelQuery $query) => $query->where("user", UserID::get())]
            )
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