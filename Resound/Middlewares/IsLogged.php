<?php

namespace Resound\Middlewares;

use Resound\Classes\Straws\UserID;
use YonisSavary\Sharp\Classes\Http\Request;
use YonisSavary\Sharp\Classes\Http\Response;
use YonisSavary\Sharp\Classes\Security\Authentication;
use YonisSavary\Sharp\Classes\Web\MiddlewareInterface;

class IsLogged implements MiddlewareInterface
{
    public static function handle(Request $request): Request|Response
    {
        $authentication = Authentication::getInstance();
        if ($authentication->isLogged())
        {
            if (!UserID::get())
                UserID::set($authentication->getUser()["data"]["id"]);

            return $request;
        }

        return Response::redirect("/login");
    }
}