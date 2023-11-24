<?php

namespace Resound\Middlewares;

use Sharp\Classes\Http\Request;
use Sharp\Classes\Http\Response;
use Sharp\Classes\Security\Authentication;
use Sharp\Classes\Web\MiddlewareInterface;

class IsLogged implements MiddlewareInterface
{
    public static function handle(Request $request): Request|Response
    {
        if (Authentication::getInstance()->isLogged())
            return $request;

        return Response::redirect("/login");
    }
}