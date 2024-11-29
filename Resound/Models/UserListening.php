<?php

namespace Resound\Models;

use YonisSavary\Sharp\Classes\Data\DatabaseField;
use YonisSavary\Sharp\Classes\Data\AbstractModel;
use Resound\Models\User;
use Resound\Models\Track;
use Resound\Models\Playlist;

/**
 * @property string $id DEFINED BY `id, int(11), NO, PRI, , auto_increment`
 * @property string $timestamp DEFINED BY `timestamp, timestamp, YES, , current_timestamp(), `
 * @property \Resound\Models\User $user DEFINED BY `user, int(11), NO, MUL, , `
 * @property \Resound\Models\Track $track DEFINED BY `track, int(11), NO, MUL, , `
 * @property \Resound\Models\Playlist $playlist DEFINED BY `playlist, int(11), YES, MUL, , `
*/
class UserListening extends AbstractModel
{
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
            'id' => (new DatabaseField('id'))->setType(DatabaseField::INTEGER)->setNullable(false)->isGenerated()->hasDefault(true),
			'timestamp' => (new DatabaseField('timestamp'))->setType(DatabaseField::STRING)->setNullable(true)->hasDefault(true),
			'user' => (new DatabaseField('user'))->setType(DatabaseField::INTEGER)->setNullable(false)->hasDefault(true)->references(User::class, 'id'),
			'track' => (new DatabaseField('track'))->setType(DatabaseField::INTEGER)->setNullable(false)->hasDefault(true)->references(Track::class, 'id'),
			'playlist' => (new DatabaseField('playlist'))->setType(DatabaseField::INTEGER)->setNullable(true)->hasDefault(true)->references(Playlist::class, 'id')
        ];
    }
}
