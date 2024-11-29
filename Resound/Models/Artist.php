<?php

namespace Resound\Models;

use YonisSavary\Sharp\Classes\Data\DatabaseField;
use YonisSavary\Sharp\Classes\Data\AbstractModel;


/**
 * @property string $id DEFINED BY `id, int(11), NO, PRI, , auto_increment`
 * @property string $name DEFINED BY `name, varchar(100), NO, UNI, , `
*/
class Artist extends AbstractModel
{
    public static function getTable(): string
    {
        return "artist";
    }

    public static function getPrimaryKey(): string
    {
        return 'id';
    }

    public static function getFields(): array
    {
        return [
            'id' => (new DatabaseField('id'))->setType(DatabaseField::INTEGER)->setNullable(false)->isGenerated()->hasDefault(true),
			'name' => (new DatabaseField('name'))->setType(DatabaseField::STRING)->setNullable(false)->hasDefault(true)
        ];
    }
}
