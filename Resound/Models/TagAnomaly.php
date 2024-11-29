<?php

namespace Resound\Models;

use YonisSavary\Sharp\Classes\Data\DatabaseField;
use YonisSavary\Sharp\Classes\Data\AbstractModel;


/**
 * @property string $id DEFINED BY `id, int(11), NO, PRI, , auto_increment`
 * @property string $filename DEFINED BY `filename, varchar(255), NO, , , `
 * @property string $description DEFINED BY `description, varchar(255), NO, , , `
*/
class TagAnomaly extends AbstractModel
{
    public static function getTable(): string
    {
        return "tag_anomaly";
    }

    public static function getPrimaryKey(): string
    {
        return 'id';
    }

    public static function getFields(): array
    {
        return [
            'id' => (new DatabaseField('id'))->setType(DatabaseField::INTEGER)->setNullable(false)->isGenerated()->hasDefault(true),
			'filename' => (new DatabaseField('filename'))->setType(DatabaseField::STRING)->setNullable(false)->hasDefault(true),
			'description' => (new DatabaseField('description'))->setType(DatabaseField::STRING)->setNullable(false)->hasDefault(true)
        ];
    }
}
