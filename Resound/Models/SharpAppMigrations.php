<?php

namespace Resound\Models;

use YonisSavary\Sharp\Classes\Data\DatabaseField;
use YonisSavary\Sharp\Classes\Data\AbstractModel;


/**
 * @property string $id DEFINED BY `id, int(11), NO, PRI, , auto_increment`
 * @property string $name DEFINED BY `name, varchar(200), NO, UNI, , `
 * @property string $created_at DEFINED BY `created_at, timestamp, YES, , current_timestamp(), `
*/
class SharpAppMigrations extends AbstractModel
{
    public static function getTable(): string
    {
        return "__sharp_app_migrations";
    }

    public static function getPrimaryKey(): string
    {
        return 'id';
    }

    public static function getFields(): array
    {
        return [
            'id' => (new DatabaseField('id'))->setType(DatabaseField::INTEGER)->setNullable(false)->isGenerated()->hasDefault(true),
			'name' => (new DatabaseField('name'))->setType(DatabaseField::STRING)->setNullable(false)->hasDefault(true),
			'created_at' => (new DatabaseField('created_at'))->setType(DatabaseField::STRING)->setNullable(true)->hasDefault(true)
        ];
    }
}
