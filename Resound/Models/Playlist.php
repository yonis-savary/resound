<?php

namespace Resound\Models;

use YonisSavary\Sharp\Classes\Data\DatabaseField;
use YonisSavary\Sharp\Classes\Data\AbstractModel;
use Resound\Models\User;

/**
 * @property string $id DEFINED BY `id, int(11), NO, PRI, , auto_increment`
 * @property string $creation_date DEFINED BY `creation_date, timestamp, YES, , current_timestamp(), `
 * @property \Resound\Models\User $user DEFINED BY `user, int(11), NO, MUL, , `
 * @property string $name DEFINED BY `name, varchar(100), NO, , , `
 * @property string $private DEFINED BY `private, tinyint(1), YES, , 0, `
*/
class Playlist extends AbstractModel
{
    public static function getTable(): string
    {
        return "playlist";
    }

    public static function getPrimaryKey(): string
    {
        return 'id';
    }

    public static function getFields(): array
    {
        return [
            'id' => (new DatabaseField('id'))->setType(DatabaseField::INTEGER)->setNullable(false)->isGenerated()->hasDefault(true),
			'creation_date' => (new DatabaseField('creation_date'))->setType(DatabaseField::STRING)->setNullable(true)->hasDefault(true),
			'user' => (new DatabaseField('user'))->setType(DatabaseField::INTEGER)->setNullable(false)->hasDefault(true)->references(User::class, 'id'),
			'name' => (new DatabaseField('name'))->setType(DatabaseField::STRING)->setNullable(false)->hasDefault(true),
			'private' => (new DatabaseField('private'))->setType(DatabaseField::INTEGER)->setNullable(true)->hasDefault(true)
        ];
    }
}
