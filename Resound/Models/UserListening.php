<?php

namespace Resound\Models;

use Sharp\Classes\Data\DatabaseField;
use Resound\Models\User;
use Resound\Models\Track;
use Resound\Models\Playlist;

class UserListening
{
    use \Sharp\Classes\Data\Model;

    public static function getTable(): string
    {
        return "user_listening";
    }

    public static function getPrimaryKey(): string
    {
        return 'id';
    }

    public static function getFields(): array
    {
        return [
            'id' => (new DatabaseField('id'))->setType(DatabaseField::INTEGER)->setNullable(false),
			'timestamp' => (new DatabaseField('timestamp'))->setType(DatabaseField::STRING)->setNullable(false),
			'user' => (new DatabaseField('user'))->setType(DatabaseField::STRING)->setNullable(false)->references(User::class, 'uuid'),
			'track' => (new DatabaseField('track'))->setType(DatabaseField::STRING)->setNullable(false)->references(Track::class, 'uuid'),
			'playlist' => (new DatabaseField('playlist'))->setType(DatabaseField::STRING)->setNullable(true)->references(Playlist::class, 'uuid')
        ];
    }
}
