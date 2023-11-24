<?php

namespace Resound\Models;

use Sharp\Classes\Data\DatabaseField;
use Resound\Models\Playlist;
use Resound\Models\Track;

class PlaylistTrack
{
    use \Sharp\Classes\Data\Model;

    public static function getTable(): string
    {
        return "playlist_track";
    }

    public static function getPrimaryKey(): string
    {
        return 'id';
    }

    public static function getFields(): array
    {
        return [
            'id' => (new DatabaseField('id'))->setType(DatabaseField::INTEGER)->setNullable(false),
			'position' => (new DatabaseField('position'))->setType(DatabaseField::INTEGER)->setNullable(true),
			'playlist' => (new DatabaseField('playlist'))->setType(DatabaseField::STRING)->setNullable(true)->references(Playlist::class, 'uuid'),
			'track' => (new DatabaseField('track'))->setType(DatabaseField::STRING)->setNullable(true)->references(Track::class, 'uuid')
        ];
    }
}
