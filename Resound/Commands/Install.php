<?php

namespace YonisSavary\Resound\Commands;

use YonisSavary\Sharp\Classes\CLI\Args;
use YonisSavary\Sharp\Classes\CLI\Command;
use YonisSavary\Sharp\Classes\Data\Database;
use YonisSavary\Sharp\Classes\Data\ModelGenerator\ModelGenerator;
use YonisSavary\Sharp\Classes\Env\Configuration;
use YonisSavary\Sharp\Core\Autoloader;
use YonisSavary\Sharp\Core\Utils;

class Install extends Command
{
    private function ftpMusicSetup(Configuration $config)
    {
        $url = readline("url [localhost] ? ");
        $username = readline("username [root] ? ");
        $password = readline("password ? ");
        $port = readline("port [21] ?  ");
        $path = readline("path (relative to ftp home dir) [/] ? ");

        if (!$url) $url = "localhost";
        if (!$username) $username = "root";
        if (!$path) $path = "/";
        if (!$port) $port = 21;


        $config->set("library", [
            "driver" => "ftp",
            "url" => $url,
            "username" => $username,
            "password" => $password,
            "port" => $port,
            "path" => $path,
        ]);
    }

    private function localMusicSetup(Configuration $config)
    {
        do
        {
            $musicPath = readline("Music Path (FTP Is configured through the app) ? ");
        }
        while (!is_dir($musicPath));

        $config->set("library", [
            "driver" => "local",
            "path" => $musicPath
        ]);
    }

    public function __invoke(Args $args)
    {
        $dbPath = Utils::relativePath("Storage/resound.db");
        if (is_file($dbPath)) unlink($dbPath);


        $config = Configuration::getInstance();

        $db = new Database("sqlite", "resound.db");

        $script = file_get_contents(Utils::relativePath("Resound/schema.sql"));
        foreach (explode("-- DELIMITER", $script) as $query)
        {
            if (trim($query))
                $db->query($query);
        }

        Database::setInstance($db);

        $config->set("database", [
            "driver" => "mysql",
            "database" => "resound"
        ]);

        $resoundPath = Utils::relativePath("Resound");
        ModelGenerator::getInstance()->generateAll($resoundPath);
        Autoloader::loadApplication($resoundPath);

        $config->set("authentication", [
            "model" => "Resound\\Models\\User",
            "login-field" => "login",
            "password-field" => "password",
            "session-duration" => 3600
        ]);


        echo "Type of connection :\n";
        echo " 1 - FTP\n";
        echo " 2 - Local disk\n";

        $type = readline("Type of installation (1-2) ? ");

        switch (intval($type))
        {
            case 1:
                $this->ftpMusicSetup($config);
                break;
            case 2:
                $this->localMusicSetup($config);
                break;
            default:
                echo "Unrecognized setup type\n";
                break;
        }


        $config->save();


        $createUser = new CreateUser();
        $createUser(new Args());
    }
}