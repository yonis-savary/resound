<?php

namespace YonisSavary\Resound\Commands;

use YonisSavary\Sharp\Classes\CLI\Args;
use YonisSavary\Sharp\Classes\CLI\Command;
use YonisSavary\Resound\Models\User;

class CreateUser extends Command
{
    public function __invoke(Args $args)
    {
        if (!($login = readline("login ? ")))
            die("A login is needed to create a user\n");

        if (!($password = readline("password ? ")))
            die("A password is needed to create a user\n");

        $password = password_hash($password, PASSWORD_BCRYPT, ["cost" => 8]);

        User::insertArray(["login" => $login , "password" => $password]);
        echo "User created !\n";
    }
}