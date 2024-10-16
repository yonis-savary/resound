<?php

namespace YonisSavary\Resound\Controllers;

use YonisSavary\Sharp\Classes\Extras\Autobahn;
use YonisSavary\Sharp\Classes\Web\Controller;
use YonisSavary\Sharp\Classes\Web\Router;
use YonisSavary\Resound\Middlewares\IsLogged;
use YonisSavary\Resound\Models\EmbeddedMedia;

class EmbeddedController
{
    use Controller;

    public static function declareRoutes(Router $router)
    {
        $router->groupCallback(
            ["path" => "api", "middlewares" => IsLogged::class],

            function() {
                Autobahn::getInstance()->all(EmbeddedMedia::class);
            }
        );
    }
}