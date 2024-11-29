<?php

namespace Resound\Models;

use YonisSavary\Sharp\Classes\Data\DatabaseField;
use YonisSavary\Sharp\Classes\Data\AbstractModel;
use Resound\Models\User;
use Resound\Models\Track;

/**
 * @property \Resound\Models\User $user DEFINED BY `user, int(11), NO, PRI, , `
 * @property \Resound\Models\Track $track DEFINED BY `track, int(11), NO, PRI, , `
*/
class UserLike extends AbstractModel
{
    public static function getTable(): string
    {
        return "user_like";
    }

    public static function getPrimaryKey(): string
    {
        return 'user';
    }

    public static function getFields(): array
    {
        return [
            'user' => (new DatabaseField('user'))->setType(DatabaseField::INTEGER)->setNullable(false)->hasDefault(true)->references(User::class, 'id'),
			'track' => (new DatabaseField('track'))->setType(DatabaseField::INTEGER)->setNullable(false)->hasDefault(true)->references(Track::class, 'id')
        ];
    }
}
