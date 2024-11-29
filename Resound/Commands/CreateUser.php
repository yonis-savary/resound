<?php

namespace Resound\Commands;

use YonisSavary\Sharp\Classes\CLI\Args;
use YonisSavary\Sharp\Classes\CLI\Command;
use Resound\Models\User;
use YonisSavary\Sharp\Classes\CLI\AbstractCommand;

class CreateUser extends AbstractCommand
{
    public function execute(Args $args): int
    {
        if (!($login = readline("login ? ")))
            die("A login is needed to create a user\n");

        if (!($password = readline("password ? ")))
            die("A password is needed to create a user\n");

        $password = password_hash($password, PASSWORD_BCRYPT, ["cost" => 8]);

        User::insertArray(["login" => $login , "password" => $password]);
        echo "User created !\n";

        return 0;
    }
}