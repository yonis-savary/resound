<?php

namespace Resound\Models;

use Sharp\Classes\Data\DatabaseField;
use Resound\Models\User;

class Playlist
{
    use \Sharp\Classes\Data\Model;

    public static function getTable(): string
    {
        return "playlist";
    }

    public static function getPrimaryKey(): string
    {
        return 'uuid';
    }

    public static function getFields(): array
    {
        return [
            'uuid' => (new DatabaseField('uuid'))->setType(DatabaseField::STRING)->setNullable(false),
			'creation_date' => (new DatabaseField('creation_date'))->setType(DatabaseField::STRING)->setNullable(false),
			'user' => (new DatabaseField('user'))->setType(DatabaseField::STRING)->setNullable(true)->references(User::class, 'uuid'),
			'name' => (new DatabaseField('name'))->setType(DatabaseField::STRING)->setNullable(false),
			'private' => (new DatabaseField('private'))->setType(DatabaseField::INTEGER)->setNullable(true)
        ];
    }
}
