<?php

namespace Resound\Middlewares;

use Resound\Classes\Straws\UserID;
use Sharp\Classes\Http\Request;
use Sharp\Classes\Http\Response;
use Sharp\Classes\Security\Authentication;
use Sharp\Classes\Web\MiddlewareInterface;

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