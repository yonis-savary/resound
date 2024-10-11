<?php

namespace YonisSavary\Resound\Controllers;

use YonisSavary\Resound\Middlewares\IsLogged;
use YonisSavary\Sharp\Classes\Data\ObjectArray;
use YonisSavary\Sharp\Classes\Env\Storage;
use YonisSavary\Sharp\Classes\Http\Request;
use YonisSavary\Sharp\Classes\Http\Response;
use YonisSavary\Sharp\Classes\Web\Controller;
use YonisSavary\Sharp\Classes\Web\Route;
use YonisSavary\Sharp\Classes\Web\Router;
use YonisSavary\Sharp\Core\Utils;
use ZipArchive;

class UploadController
{
    use Controller;

    public static function declareRoutes(Router $router)
    {
        $router->addGroup(
            ["path" => "api/upload", "middlewares" => IsLogged::class],

            Route::get("/start-upload", [self::class, "startUpload"]),
            Route::post("/upload-chunk/{token}/{int:chunk}", [self::class, "uploadChunk"]),
            Route::get("/process-upload/{token}", [self::class, "processUpload"]),
            Route::post("/move-upload/{token}", [self::class, "moveUpload"]),

            Route::get("/cancel-upload/{token}", [self::class, "cancelUpload"]),
        );
    }


    public static function getTokenStorage(string $token): Storage
    {
        return Storage::getInstance()->getSubStorage("tmp/resound-upload/$token");
    }

    public static function startUpload()
    {
        return uniqid("upload-");
    }

    public static function uploadChunk(Request $request, string $token, int $chunkNumber)
    {
        $storage = self::getTokenStorage($token);
        $body = $request->body();

        $storage->write($chunkNumber.".part", $body);

        return Response::json(null, 200);
    }

    public static function processUpload(Request $request, string $token)
    {
        $storage = self::getTokenStorage($token);
        $outFile = $storage->path("out.zip");

        $stream = fopen($outFile, "a");
        $parts = $storage->listFiles();
        natsort($parts);
        foreach ($parts as $file)
        {
            if (!str_ends_with($file, ".part"))
                continue;

            fwrite($stream, file_get_contents($file));
            unlink($file);
        }
        fclose($stream);

        $zip = new ZipArchive();
        $zip->open($outFile);

        $zip->extractTo($storage->getRoot());
        $zip->close();
        unlink($outFile);

        $library = LibraryController::getLibraryStorage();

        return ObjectArray::fromArray(
            $storage->exploreDirectory("/", Utils::ONLY_FILES)
        )
        ->map(fn($x) => str_replace($storage->getRoot(), "", $x))
        ->map(fn($x) => [$x, $library->isFile($x)])
        ->collect();
    }

    public static function moveUpload(Request $request, string $token)
    {
        $storage = self::getTokenStorage($token);
        $library = LibraryController::getLibraryStorage();

        foreach ($storage->exploreDirectory("/", Storage::ONLY_FILES) as $file)
        {
            $relFile = str_replace($storage->getRoot(), "", $file);

            $targetFile = $library->path($relFile);
            $targetDirectory = dirname($targetFile);

            $library->makeDirectory($targetDirectory);

            info("Moving [$file] to [$targetFile]");
            rename($file, $targetFile);
        }

        SettingsController::discover();
        SettingsController::parseTags();

        return "OK";
    }

    public static function cancelUpload(Request $request, string $token)
    {
        $storage = self::getTokenStorage($token);

        foreach ($storage->exploreDirectory("/", Utils::ONLY_FILES) as $file)
            $storage->unlink($file);

        foreach (array_reverse($storage->exploreDirectory("/", Utils::ONLY_DIRS)) as $directory)
            rmdir($directory);

        rmdir($storage->getRoot());
        return "OK";
    }


}