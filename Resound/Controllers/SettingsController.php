<?php

namespace YonisSavary\Resound\Controllers;

use YonisSavary\Sharp\Classes\Env\Configuration;
use YonisSavary\Sharp\Classes\Env\Drivers\FTPDriver;
use YonisSavary\Sharp\Classes\Http\Request;
use YonisSavary\Sharp\Classes\Http\Response;
use YonisSavary\Sharp\Classes\Web\Controller;
use YonisSavary\Sharp\Classes\Web\Route;
use YonisSavary\Sharp\Classes\Web\Router;
use YonisSavary\Sharp\Core\Autoloader;
use Throwable;
use YonisSavary\Resound\Middlewares\IsLogged;
use YonisSavary\Resound\Models\Artist;
use YonisSavary\Resound\Models\TagAnomaly;

class SettingsController
{
    use Controller;

    public static function declareRoutes(Router $router)
    {
        $router->addGroup(
            ["path" => "api", "middlewares" => IsLogged::class],

            Route::get ("/settings/ftp-test",                   [self::class, "testFtpConnection"]),
            Route::get ("/settings/ftp-get-configuration",      [self::class, "getPublicFTPConfig"]),
            Route::post("/settings/ftp-register-configuration", [self::class, "replaceFtpConfig"]),

            Route::post("/settings/local-register-configuration", [self::class, "registerLocalPath"]),
            Route::get ("/settings/local-get-configuration",      [self::class, "getLocalDiskConfig"]),

            Route::get("/settings/to-discover",   [self::class, "toDiscover"]),
            Route::get("/settings/discover",      [self::class, "discover"]),
            Route::get("/settings/parse-tags",      [self::class, "parseTags"]),
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
        set_time_limit(600);
        TagController::extractLibraryTags();

        return "OK";
    }

    public static function parseTags()
    {
        set_time_limit(600);
        $original = getcwd();

        chdir(Autoloader::projectRoot());

        ob_start();

        if (str_starts_with(PHP_OS, "WIN"))
            shell_exec("START /B php do extract-all-tags");
        else
            shell_exec("php do extract-all-tags &");

        ob_clean();

        chdir($original);

        return "OK";
    }

    public static function resetLibrary()
    {
        Artist::delete()->fetch();
        TagAnomaly::delete()->fetch();

        return "OK";
    }




    public static function getLocalDiskConfig()
    {

        $config = Configuration::getInstance()->get("library", []);
        if ($config["driver"] === "local")
            return $config;
        return ["path" => null];
    }

    public static function registerLocalPath(Request $request)
    {
        $path = $request->params("path");

        if (!is_dir($path))
            return Response::json("This directory does not exists", 200);

        $config = Configuration::getInstance();
        $config->set("library", [
            "driver" => "local",
            "path" => $path
        ]);

        $config->save();
        return true;
    }

    public static function getPublicFTPConfig()
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