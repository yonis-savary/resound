<?php

namespace Resound\Controllers;

use Sharp\Classes\Web\Controller;
use Sharp\Classes\Web\Route;
use Sharp\Classes\Web\Router;
use Resound\Middlewares\IsLogged;

class SiteController
{
    use Controller;

    public static function declareRoutes(Router $router)
    {
        $router->addGroup(
            ["middlewares" => IsLogged::class],

            Route::view("/", "app")
        );
    }
}