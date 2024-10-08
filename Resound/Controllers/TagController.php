<?php

namespace Resound\Controllers;

use getID3;
use Resound\Classes\Straws\UserID;
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

            self::pushQueueItem(["files" => $missing, "userAuthor" => UserID::get()]);

            $logger->info("Added item of ".count($missing)." files");
        }
    }

    protected static function processQueueItem(array $data): bool
    {
        $logger = new Logger("tags.csv");
        $tmpLibrary = Storage::getInstance()->getSubStorage("tmp/tag-extract-buffer-dir");

        /**
         * Data is : {"files": [...]}
         * "files" is an array of files to fetch and parse
         */
        $files = $data["files"];
        $userAuthor = $data["userAuthor"];

        if (!count($files))
            return false;

        $library = LibraryController::getLibraryStorage();
        $libraryPath = $library->getRoot();

        // Serve as a fallback if the position tag is not set !
        $position = 0;

        $isLibraryLocal = LibraryController::isLibraryLocal();

        foreach ($files as $missingFile)
        {
            $position++;

            $missingFileFullPath = Utils::joinPath($libraryPath, $missingFile);
            $fileToProcess = $missingFileFullPath;
            $deleteTransfer = false;

            if (!$isLibraryLocal)
            {
                $missingHash = md5($missingFileFullPath);
                $content = $library->read($missingFileFullPath);
                $tmpLibrary->write($missingHash, $content);
                $fileToProcess = $tmpLibrary->path($missingHash);
                $deleteTransfer = true;
            }

            try
            {
                self::extractTags($fileToProcess, $missingFile, $position, $userAuthor);
            }
            catch (Throwable $err)
            {
                $logger->info($err);
                return false;
            }
            finally
            {
                if ($deleteTransfer)
                    $tmpLibrary->unlink($missingHash);
            }
        }
        return true;
    }

    public static function extractTags(
        string $file,
        string $distPath,
        int $position=0,
        int $userAuthor=1
    )
    {
        $userId = $userAuthor;
        $logger = self::getTagLogger();
        $db = Database::getInstance();

        $getID3 = new getID3();

        $filesize = filesize($file) / (1024*1024);
        if ($filesize > 4.5)
            TagAnomaly::insertArray(["filename" => $distPath, "description" => "Heavy file ! ($filesize Mo)"]);

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

        $artist     = $tags["artist"];
        $band       = $tags["band"] ?? $tags["album_artist"] ?? $artist;
        $song       = $tags["title"];
        $album      = $tags["album"];
        $year       = $tags["year"] ?? $tags["creation_date"] ?? null;
        $track      = $tags["track_number"] ?? $position;
        $genre      = $tags["genre"] ?? null;
        $composer   = $tags["composer"] ?? null;
        $cover      = $tags["picture"]["0"]["data"] ?? $metadata["comments"]["picture"]["0"]["data"] ?? null;
        $discNumber = $tags["part_of_a_set"] ?? "1";

        if ($genre === null)
            TagAnomaly::insertArray(["filename" => $distPath, "description" => "Unknown Genre"]);

        foreach ([
            &$artist,
            &$band,
            &$song,
            &$album,
            &$year,
            &$track,
            &$genre,
            &$composer,
            &$discNumber
        ] as &$var)
        {
            if (is_array($var))
                $var = $var[0] ?? null;
        }

        if ($year && (!preg_match("/^\d{4}$/", $year)))
            $year = substr($year, 0, 4);

        // Transform "5/12" into "5"
        $track = preg_replace("/\/.+$/", "", $track);
        $discNumber = preg_replace("/\/.+$/", "", $discNumber);

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
        $artistID = Artist::findWhere(["name" => $band])["data"]["id"];

        $db->query("INSERT IGNORE INTO album(artist, name, genre, release_year, user_author) VALUES ({}, {}, {}, {}, {})", [$artistID, $album, $genre, $year, $userId]);
        $albumID = Album::findWhere(["artist" => $artistID, "name" => $album])["data"]["id"];

        if ($cover)
            Storage::getInstance()->write("Resound/Covers/$albumID", $cover);

        $db->query(
            "INSERT IGNORE INTO track (album, name, position, disc_number, artist, producer, duration_seconds, path, edition_date, size_kb)
            VALUES ({}, {}, {}, {}, {}, {}, {}, {}, {}, {})
        ", [
            $albumID,
            $song,
            $track,
            $discNumber,
            $artist,
            $composer,
            $duration,
            $distPath,
            $editionDate,
            $sizeKb,
        ]);

        $db->query(
            "UPDATE track
            SET position = {}, artist = {}, producer = {}, duration_seconds = {}, path = {}, edition_date = {}, size_kb = {}
            WHERE album = {}
            AND name = {}
        ",[
            $track,
            $artist,
            $composer,
            $duration,
            $distPath,
            $editionDate,
            $sizeKb,
            $albumID,
            $song,
        ]);
    }
}