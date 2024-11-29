<?php

namespace Resound\Controllers;

use YonisSavary\Sharp\Classes\Data\ObjectArray;
use YonisSavary\Sharp\Classes\Http\Request;
use YonisSavary\Sharp\Classes\Http\Response;
use YonisSavary\Sharp\Classes\Web\Controller;
use YonisSavary\Sharp\Classes\Web\Route;
use YonisSavary\Sharp\Classes\Web\Router;
use Resound\Middlewares\IsLogged;
use Resound\Models\Album;
use Resound\Models\Artist;
use Resound\Models\Track;

class SearchController
{
    use Controller;

    public static function declareRoutes(Router $router)
    {
        $router->addGroup(
            ["path" => "api", "middlewares" => IsLogged::class],

            Route::get("/search", [self::class, "search"])
        );
    }

    public static function search(Request $request)
    {
        if (!$object = $request->params("object"))
            return Response::json("'object' parameter needed", 500);

        $words = ObjectArray::fromExplode(" ", $object);

        $getSearchCondition = function($column) use ($words)
        {
            return $words->map(fn($word) => buildQuery("$column LIKE {}", ["%$word%"]))->join(" AND ");
        };

        return [
            "artists" => Artist::select()->whereSQL($getSearchCondition("artist.name"))->fetch(),
            "albums" => Album::select()->whereSQL($getSearchCondition("album.name"))->fetch(),
            "tracks" => Track::select()->whereSQL($getSearchCondition("CONCAT(track.name, ' ', track.artist)"))->fetch()
        ];
    }
}