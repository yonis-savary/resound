<?php

namespace Resound\Controllers;

use YonisSavary\Sharp\Classes\Web\Controller;
use YonisSavary\Sharp\Classes\Web\Route;
use YonisSavary\Sharp\Classes\Web\Router;
use Resound\Middlewares\IsLogged;
use YonisSavary\Sharp\Extensions\RemindMe\Middlewares\RememberUser;

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