<?php

namespace Resound\Controllers;

use Sharp\Classes\Web\Controller;
use Sharp\Classes\Web\Route;
use Sharp\Classes\Web\Router;
use Resound\Middlewares\IsLogged;
use SharpExtensions\RemindMe\Middlewares\RememberUser;

class SiteController
{
    use Controller;

    public static function declareRoutes(Router $router)
    {
        $router->addGroup(
            ["middlewares" => [RememberUser::class, IsLogged::class]],

            Route::view("/", "app")
        );
    }
}