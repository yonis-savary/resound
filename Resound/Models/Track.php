<?php

namespace Resound\Models;

use Sharp\Classes\Data\DatabaseField;
use Resound\Models\Album;

class Track
{
    use \Sharp\Classes\Data\Model;

    public static function getTable(): string
    {
        return "track";
    }

    public static function getPrimaryKey(): string
    {
        return 'uuid';
    }

    public static function getFields(): array
    {
        return [
            'uuid' => (new DatabaseField('uuid'))->setType(DatabaseField::STRING)->setNullable(false),
			'edition_date' => (new DatabaseField('edition_date'))->setType(DatabaseField::STRING)->setNullable(false),
			'album' => (new DatabaseField('album'))->setType(DatabaseField::STRING)->setNullable(false)->references(Album::class, 'uuid'),
			'name' => (new DatabaseField('name'))->setType(DatabaseField::STRING)->setNullable(true),
			'position' => (new DatabaseField('position'))->setType(DatabaseField::INTEGER)->setNullable(true),
			'artist' => (new DatabaseField('artist'))->setType(DatabaseField::STRING)->setNullable(true),
			'producer' => (new DatabaseField('producer'))->setType(DatabaseField::STRING)->setNullable(true),
			'duration_seconds' => (new DatabaseField('duration_seconds'))->setType(DatabaseField::INTEGER)->setNullable(true),
			'path' => (new DatabaseField('path'))->setType(DatabaseField::STRING)->setNullable(false)
        ];
    }
}
