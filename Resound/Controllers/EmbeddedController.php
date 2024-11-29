<?php

namespace Resound\Controllers;

use YonisSavary\Sharp\Classes\Extras\Autobahn;
use YonisSavary\Sharp\Classes\Web\Controller;
use YonisSavary\Sharp\Classes\Web\Router;
use Resound\Middlewares\IsLogged;
use Resound\Models\EmbeddedMedia;

class EmbeddedController
{
    use Controller;

    public static function declareRoutes(Router $router)
    {
        $router->addGroup(
            ["path" => "api", "middlewares" => IsLogged::class],
            ...Autobahn::getInstance()->all(EmbeddedMedia::class)
        );
    }
}