<?php

namespace YonisSavary\Resound\Controllers;

use YonisSavary\Sharp\Classes\Http\Request;
use YonisSavary\Sharp\Classes\Http\Response;
use YonisSavary\Sharp\Classes\Security\Authentication;
use YonisSavary\Sharp\Classes\Web\Controller;
use YonisSavary\Sharp\Classes\Web\Route;
use YonisSavary\Sharp\Classes\Web\Router;
use YonisSavary\Resound\Classes\Straws\UserID;
use YonisSavary\Sharp\Extensions\RemindMe\Components\RemindMe;
use YonisSavary\Sharp\Extensions\RemindMe\Middlewares\RememberUser;

class AuthenticationController
{
    use Controller;

    public static function declareRoutes(Router $router)
    {
        $router->addGroup(
            ["middlewares" => RememberUser::class],
            Route::view("/login", "login"),
        );

        $router->addRoutes(
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

        if ($request->params("remember-me") === "on")
            RemindMe::getInstance()->rememberLoggedUser();

        $user = Authentication::getInstance()->getUser();
        UserID::set($user["data"]["id"]);

        return Response::redirect("/");
    }

    public static function logout()
    {
        UserID::unset();
        RemindMe::getInstance()->forgetLoggedUser();
        Authentication::getInstance()->logout();
        return Response::redirect("/");
    }
}