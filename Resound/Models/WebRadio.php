<?php

namespace Resound\Models;

use Sharp\Classes\Data\DatabaseField;


class WebRadio
{
    use \Sharp\Classes\Data\Model;

    public static function getTable(): string
    {
        return "web_radio";
    }

    public static function getPrimaryKey(): string
    {
        return 'id';
    }

    public static function getFields(): array
    {
        return [
            'id' => (new DatabaseField('id'))->setType(DatabaseField::INTEGER)->setNullable(false),
			'name' => (new DatabaseField('name'))->setType(DatabaseField::STRING)->setNullable(false),
			'url' => (new DatabaseField('url'))->setType(DatabaseField::STRING)->setNullable(false)
        ];
    }
}
