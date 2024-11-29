<?php

namespace Resound\Models;

use YonisSavary\Sharp\Classes\Data\DatabaseField;
use YonisSavary\Sharp\Classes\Data\AbstractModel;
use Resound\Models\Playlist;
use Resound\Models\Track;

/**
 * @property string $id DEFINED BY `id, int(11), NO, PRI, , auto_increment`
 * @property string $position DEFINED BY `position, int(11), YES, , , `
 * @property \Resound\Models\Playlist $playlist DEFINED BY `playlist, int(11), YES, MUL, , `
 * @property \Resound\Models\Track $track DEFINED BY `track, int(11), YES, MUL, , `
*/
class PlaylistTrack extends AbstractModel
{
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
            'id' => (new DatabaseField('id'))->setType(DatabaseField::INTEGER)->setNullable(false)->isGenerated()->hasDefault(true),
			'position' => (new DatabaseField('position'))->setType(DatabaseField::INTEGER)->setNullable(true)->hasDefault(true),
			'playlist' => (new DatabaseField('playlist'))->setType(DatabaseField::INTEGER)->setNullable(true)->hasDefault(true)->references(Playlist::class, 'id'),
			'track' => (new DatabaseField('track'))->setType(DatabaseField::INTEGER)->setNullable(true)->hasDefault(true)->references(Track::class, 'id')
        ];
    }
}
