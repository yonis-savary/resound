<?php

namespace Resound\Controllers;

use Sharp\Classes\Http\Request;
use Sharp\Classes\Http\Response;
use Sharp\Classes\Security\Authentication;
use Sharp\Classes\Web\Controller;
use Sharp\Classes\Web\Route;
use Sharp\Classes\Web\Router;
use Resound\Classes\Straws\UserUUID;

class AuthenticationController
{
    use Controller;

    public static function declareRoutes(Router $router)
    {
        $router->addRoutes(
            Route::view("/login", "login"),
            Route::post("/login", [self::class, "handle"]),
            Route::get("/logout", [self::class, "logout"]),
        );
    }

    public static function handle(Request $request)
    {
        if (!Authentication::getInstance()->attempt(
            $request->params("login"),
            $request->params("password")
        )) return Response::redirect("/login");

        $user = Authentication::getInstance()->getUser();
        UserUUID::set($user["data"]["uuid"]);

        return Response::redirect("/");
    }

    public static function logout()
    {
        UserUUID::unset();
        Authentication::getInstance()->logout();
        return Response::redirect("/");
    }
}