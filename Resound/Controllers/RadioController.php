<?php

namespace Resound\Controllers;

use Sharp\Classes\Extras\Autobahn;
use Sharp\Classes\Web\Controller;
use Sharp\Classes\Web\Router;
use Resound\Middlewares\IsLogged;
use Resound\Models\WebRadio;

class RadioController
{
    use Controller;

    public static function declareRoutes(Router $router)
    {
        $router->groupCallback(
            ["path" => "api", "middlewares" => IsLogged::class],

            function() {
                Autobahn::getInstance()->all(WebRadio::class);
            }
        );
    }
}