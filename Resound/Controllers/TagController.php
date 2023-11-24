<?php

namespace Resound\Controllers;

use getID3;
use Sharp\Classes\Core\Logger;
use Sharp\Classes\Data\Database;
use Sharp\Classes\Data\ObjectArray;
use Sharp\Classes\Env\Storage;
use Sharp\Classes\Extras\QueueHandler;
use Sharp\Classes\Web\Controller;
use Sharp\Core\Utils;
use Throwable;
use Resound\Models\Album;
use Resound\Models\Artist;
use Resound\Models\TagAnomaly;

class TagController
{
    use Controller, QueueHandler;

    protected static array $lastMetadata = [];

    protected static Logger $logger;

    public static function getTagLogger(): Logger
    {
        self::$logger ??= new Logger("tags.csv");
        return self::$logger;
    }


    public static function getQueueProcessCapacity(): int
    {
        return 30;
    }

    public static function extractLibraryTags()
    {
        $logger = self::getTagLogger();
        $logger->info("Making queue of missing files from library");

        $library = LibraryController::getLibraryStorage();
        $libraryPath = $library->getRoot();

        foreach ($library->listDirectories() as $artist)
        {
            $files = $library->exploreDirectory($artist, Utils::ONLY_FILES);

            $logger->info("Listing files in " . basename($artist));

            $files = ObjectArray::fromArray($files)
            ->map(fn($x) => str_replace($libraryPath, "", $x))
            ->collect();

            if (!count($files))
            {
                $logger->info("No file found in directory");
                continue;
            }

            $registered = ObjectArray::fromArray(query("SELECT path FROM track WHERE path IN {}", [$files]))
            ->map(fn($x) => $x["path"])
            ->collect();

            $missing = array_diff($files, $registered);

            if (!count($missing))
                continue;

            self::pushQueueItem(["files" => $missing]);

            $logger->info("Added item of ".count($missing)." files");
        }
    }

    protected static function processQueueItem(array $data): bool
    {
        $logger = new Logger("tags.csv");
        $tmpLibrary = Storage::getInstance()->getSubStorage("tmp-ftp-transfer");

        /**
         * Data is : {"files": [...]}
         * "files" is an array of files to fetch and parse
         */
        $files = $data["files"];

        if (!count($files))
            return false;

        $library = LibraryController::getLibraryStorage();
        $libraryPath = $library->getRoot();

        /** Serve as a fallback if the position tag is not set ! */
        $position = 0;

        foreach ($files as $missingFile)
        {
            $position++;

            $missingFileFullPath = Utils::joinPath($libraryPath, $missingFile);
            $missingHash = md5($missingFileFullPath);

            $content = $library->read($missingFileFullPath);

            $tmpLibrary->write($missingHash, $content);

            try
            {
                self::extractTags($tmpLibrary->path($missingHash), $missingFile, $position);
                $tmpLibrary->unlink($missingHash);
            }
            catch (Throwable $err)
            {
                $logger->info($err, self::$lastMetadata);
                $tmpLibrary->unlink($missingHash);

                return false;
            }

        }
        return true;
    }

    public static function extractTags(string $file, string $distPath, int $position=0)
    {
        $logger = self::getTagLogger();
        $db = Database::getInstance();

        $getID3 = new getID3();

        $metadata = $getID3->analyze($file);
        self::$lastMetadata  = $metadata;

        $getID3->CopyTagsToComments($metadata);

        if (($metadata["fileformat"] ?? "mp3") == "ogg")
            return TagAnomaly::insertArray(["filename" => $distPath, "description" => "Unsupported Format: OGG File"]);

        $logger->info("Parsing tag of $distPath");

        // Tags may be located in different keys
        if (!($tags =
            $metadata["tags"]["id3v2"]["comments"] ??
            $metadata["tags"]["id3v2"] ??
            $metadata["id3v2"]["comments"] ??
            $metadata["id3v2"] ??
            $metadata["comments"] ??
            false)
        ) return TagAnomaly::insertArray([ "filename" => $distPath, "description" => "Tags not found" ]);

        $artist   = $tags["artist"];
        $band     = $tags["band"] ?? $tags["album_artist"] ?? $artist;
        $song     = $tags["title"];
        $album    = $tags["album"];
        $year     = $tags["year"] ?? null;
        $track    = $tags["track_number"] ?? $position;
        $genre    = $tags["genre"] ?? null;
        $composer = $tags["composer"] ?? null;
        $cover    = $tags["picture"]["0"]["data"] ?? $metadata["comments"]["picture"]["0"]["data"] ?? null;

        if ($genre === null)
            TagAnomaly::insertArray(["filename" => $distPath, "description" => "Unknown Genre"]);

        if (is_array($genre))
            $genre = $genre[0] ?? null;

        if (is_array($band))
            $band = $band[0] ?? null;

        // Transform "5/12" into "5"
        $track = preg_replace("/\/.+$/", "", $track);

        $duration = isset($metadata["playtime_seconds"]) ? intval($metadata["playtime_seconds"]) : null;

        try
        {
            $editionDate = date("Y-m-d h:i:s", filemtime($file));
        }
        catch (Throwable)
        {
            $editionDate = date("Y-m-d h:i:s");
        }

        $sizeKb = (int)(filesize($file) / 1024);

        $db->query("INSERT IGNORE INTO artist(name) VALUES ({})", [$band]);
        $artistUUID = Artist::select()->where("name", $band)->first()["data"]["uuid"];

        $db->query("INSERT IGNORE INTO album(artist, name, genre, release_year) VALUES ({}, {}, {}, {})", [$artistUUID, $album, $genre, $year]);
        $albumUUID = Album::select()->where("artist", $artistUUID)->where("name", $album)->first()["data"]["uuid"];

        if ($cover)
            Storage::getInstance()->write("Resound/Covers/$albumUUID", $cover);

        $db->query(
            "INSERT INTO track (album, name, position, artist, producer, duration_seconds, path, edition_date, size_kb)
            VALUES ({}, {}, {}, {}, {}, {}, {}, {}, {})
            ON DUPLICATE KEY UPDATE
            position = {},
            artist = {},
            producer = {},
            duration_seconds = {},
            path = {},
            edition_date = {},
            size_kb = {}
        ", [
            $albumUUID,
            $song,
            $track,
            $artist,
            $composer,
            $duration,
            $distPath,
            $editionDate,
            $sizeKb,

            $track,
            $artist,
            $composer,
            $duration,
            $distPath,
            $editionDate,
            $sizeKb,
        ]);
    }
}