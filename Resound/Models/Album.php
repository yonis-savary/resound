<?php

namespace Resound\Models;

use Sharp\Classes\Data\DatabaseField;
use Resound\Models\Artist;

class Album
{
    use \Sharp\Classes\Data\Model;

    public static function getTable(): string
    {
        return "album";
    }

    public static function getPrimaryKey(): string
    {
        return 'uuid';
    }

    public static function getFields(): array
    {
        return [
            'uuid' => (new DatabaseField('uuid'))->setType(DatabaseField::STRING)->setNullable(false),
			'artist' => (new DatabaseField('artist'))->setType(DatabaseField::STRING)->setNullable(false)->references(Artist::class, 'uuid'),
			'name' => (new DatabaseField('name'))->setType(DatabaseField::STRING)->setNullable(false),
			'genre' => (new DatabaseField('genre'))->setType(DatabaseField::STRING)->setNullable(true),
			'release_year' => (new DatabaseField('release_year'))->setType(DatabaseField::INTEGER)->setNullable(true),
			'cached_total_duration_seconds' => (new DatabaseField('cached_total_duration_seconds'))->setType(DatabaseField::INTEGER)->setNullable(true),
			'cached_track_number' => (new DatabaseField('cached_track_number'))->setType(DatabaseField::INTEGER)->setNullable(true),
			'accent_color_hex' => (new DatabaseField('accent_color_hex'))->setType(DatabaseField::STRING)->setNullable(true)
        ];
    }
}
