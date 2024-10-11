<?php

namespace YonisSavary\Resound\Controllers;

use YonisSavary\Sharp\Classes\Env\Storage;
use YonisSavary\Sharp\Classes\Http\Request;
use YonisSavary\Sharp\Classes\Http\Response;
use YonisSavary\Sharp\Classes\Web\Controller;
use YonisSavary\Sharp\Classes\Web\Route;
use YonisSavary\Sharp\Classes\Web\Router;
use YonisSavary\Resound\Classes\Straws\UserID;
use YonisSavary\Resound\Middlewares\IsLogged;
use YonisSavary\Resound\Models\Track;
use YonisSavary\Resound\Models\UserListening;

class TrackController
{
    use Controller;

    public static function declareRoutes(Router $router)
    {
        $router->addGroup(
            ["path" => "api", "middlewares" => IsLogged::class],

            Route::get("/song/read", [self::class, "read"]),
            Route::get("/song/listen", [self::class, "registerListening"]),
        );
    }

    public static function read(Request $request)
    {
        $id = $request->params("id");

        if (!$track = Track::findId($id))
            return Response::json("Track not found !");

        $content = LibraryController::getLibraryStorage()->read($track["data"]["path"]);

        $size = strlen($content);

        return new Response($content, 200, [
            "Content-Type"   => "audio/mpeg",
            "Expires"        => "0",
            "Cache-Control"  => "must-revalidate",
            "Accept-Ranges"  => "bytes",
            "Content-Range"  => "bytes $size/$size",
            "Pragma"         => "public",
            "Content-Length" => $size,
        ]);
    }

    public static function registerListening(Request $request)
    {
        UserListening::insertArray([
            "user"     => UserID::get(),
            "track"    => $request->params("track"),
            "playlist" => $request->params("playlist")
        ]);
        return "OK";
    }
}