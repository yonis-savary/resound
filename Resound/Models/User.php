<?php

namespace Resound\Models;

use YonisSavary\Sharp\Classes\Data\DatabaseField;
use YonisSavary\Sharp\Classes\Data\AbstractModel;


/**
 * @property string $id DEFINED BY `id, int(11), NO, PRI, , auto_increment`
 * @property string $login DEFINED BY `login, varchar(200), NO, UNI, , `
 * @property string $password DEFINED BY `password, varchar(100), NO, , , `
*/
class User extends AbstractModel
{
    public static function getTable(): string
    {
        return "user";
    }

    public static function getPrimaryKey(): string
    {
        return 'id';
    }

    public static function getFields(): array
    {
        return [
            'id' => (new DatabaseField('id'))->setType(DatabaseField::INTEGER)->setNullable(false)->isGenerated()->hasDefault(true),
			'login' => (new DatabaseField('login'))->setType(DatabaseField::STRING)->setNullable(false)->hasDefault(true),
			'password' => (new DatabaseField('password'))->setType(DatabaseField::STRING)->setNullable(false)->hasDefault(true)
        ];
    }
}
