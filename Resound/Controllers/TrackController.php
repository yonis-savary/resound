<?php

namespace Resound\Controllers;

use Sharp\Classes\Env\Storage;
use Sharp\Classes\Http\Request;
use Sharp\Classes\Http\Response;
use Sharp\Classes\Web\Controller;
use Sharp\Classes\Web\Route;
use Sharp\Classes\Web\Router;
use Resound\Classes\Straws\UserID;
use Resound\Middlewares\IsLogged;
use Resound\Models\Track;
use Resound\Models\UserListening;

class TrackController
{
    use Controller;

    public static function declareRoutes(Router $router)
    {
        $router->addGroup(
            ["path" => "api", "middlewares" => IsLogged::class],

            Route::get("/song/read/{id}", [self::class, "read"]),
            Route::get("/song/listen", [self::class, "registerListening"]),
        );
    }

    public static function read(Request $request, string $id)
    {
        if (!$track = Track::findId($id))
            return Response::json("Track not found !");

        $content = LibraryController::getLibraryStorage()->read($track["data"]["path"]);

        return new Response($content, 200, [
            "Content-Type"   => "application/octet-stream",
            "Expires"        => "0",
            "Cache-Control"  => "must-revalidate",
            "Pragma"         => "public",
            "Content-Length" => strlen($content),
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