<?php

namespace Resound\Models;

use Sharp\Classes\Data\DatabaseField;


class Artist
{
    use \Sharp\Classes\Data\Model;

    public static function getTable(): string
    {
        return "artist";
    }

    public static function getPrimaryKey(): string
    {
        return 'uuid';
    }

    public static function getFields(): array
    {
        return [
            'uuid' => (new DatabaseField('uuid'))->setType(DatabaseField::STRING)->setNullable(false),
			'name' => (new DatabaseField('name'))->setType(DatabaseField::STRING)->setNullable(false)
        ];
    }
}
