<?php

namespace Resound\Models;

use Sharp\Classes\Data\DatabaseField;


class User
{
    use \Sharp\Classes\Data\Model;

    public static function getTable(): string
    {
        return "user";
    }

    public static function getPrimaryKey(): string
    {
        return 'uuid';
    }

    public static function getFields(): array
    {
        return [
            'uuid' => (new DatabaseField('uuid'))->setType(DatabaseField::STRING)->setNullable(false),
			'login' => (new DatabaseField('login'))->setType(DatabaseField::STRING)->setNullable(false),
			'password' => (new DatabaseField('password'))->setType(DatabaseField::STRING)->setNullable(false)
        ];
    }
}
