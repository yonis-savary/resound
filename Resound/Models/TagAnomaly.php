<?php

namespace Resound\Models;

use Sharp\Classes\Data\DatabaseField;


class TagAnomaly
{
    use \Sharp\Classes\Data\Model;

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
            'id' => (new DatabaseField('id'))->setType(DatabaseField::INTEGER)->setNullable(false),
			'filename' => (new DatabaseField('filename'))->setType(DatabaseField::STRING)->setNullable(false),
			'description' => (new DatabaseField('description'))->setType(DatabaseField::STRING)->setNullable(false)
        ];
    }
}
