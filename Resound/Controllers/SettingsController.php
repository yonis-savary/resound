<?php

namespace Resound\Controllers;

use Sharp\Classes\Env\Configuration;
use Sharp\Classes\Env\Drivers\FTPDriver;
use Sharp\Classes\Http\Request;
use Sharp\Classes\Http\Response;
use Sharp\Classes\Web\Controller;
use Sharp\Classes\Web\Route;
use Sharp\Classes\Web\Router;
use Sharp\Core\Autoloader;
use Throwable;
use Resound\Middlewares\IsLogged;
use Resound\Models\Artist;
use Resound\Models\TagAnomaly;

class SettingsController
{
    use Controller;

    public static function declareRoutes(Router $router)
    {
        $router->addGroup(
            ["path" => "api", "middlewares" => IsLogged::class],

            Route::get("/settings/ftp-test", [self::class, "testFtpConnection"]),
            Route::get("/settings/ftp-get-configuration", [self::class, "getFtpConfig"]),
            Route::post("/settings/ftp-register-configuration", [self::class, "replaceFtpConfig"]),

            Route::get("/settings/to-discover", [self::class, "toDiscover"]),
            Route::get("/settings/discover", [self::class, "discover"]),
            Route::get("/settings/reset-library", [self::class, "resetLibrary"])
        );
    }

    public static function toDiscover()
    {
        $queueStorage = TagController::getQueueStorage();
        return Response::json(count($queueStorage->listFiles()));
    }

    public static function discover()
    {
        TagController::extractLibraryTags();

        $original = getcwd();

        chdir(Autoloader::projectRoot());
        shell_exec("php do extract-all-tags >/dev/null 2>/dev/null &");

        chdir($original);

        return "OK";
    }

    public static function resetLibrary()
    {
        Artist::delete()->fetch();
        TagAnomaly::delete()->fetch();

        return "OK";
    }

    public static function getFtpConfig()
    {
        $config = Configuration::getInstance()->get("library", []);
        $config["password"] = null;
        $config["port"] ??= 21;
        return $config;
    }

    public static function testFtpConnection(Request $request)
    {
        $libraryConfig = Configuration::getInstance()->get("library", []);

        foreach (["url", "username", "password"] as $key)
        {
            if (!array_key_exists($key, $libraryConfig))
                return "Incomplete configuration";
        }

        try
        {
            new FTPDriver(
                $libraryConfig["url"],
                $libraryConfig["username"],
                $libraryConfig["password"],
                $libraryConfig["port"] ?? 21,
            );
            return true;
        }
        catch (Throwable $err)
        {
            return $err->getMessage();
        }
    }

    public static function replaceFtpConfig(Request $request)
    {
        list(
            $url,
            $username,
            $password,
            $path,
            $port,
        ) = $request->list("url","username","password","path", "port");

        try
        {
            new FTPDriver(
                $url,
                $username,
                $password,
                $port ?? 21,
            );

            $config = Configuration::getInstance();
            $config->set("library", [
                "url" => $url,
                "username" => $username,
                "password" => $password,
                "path" => $path,
                "port" => $port
            ]);
            $config->save();

            return true;
        }
        catch (Throwable $err)
        {
            return $err->getMessage();
        }
    }

}