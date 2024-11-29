<?php

namespace Resound\Models;

use YonisSavary\Sharp\Classes\Data\DatabaseField;
use YonisSavary\Sharp\Classes\Data\AbstractModel;
use Resound\Models\Artist;
use Resound\Models\User;

/**
 * @property string $id DEFINED BY `id, int(11), NO, PRI, , auto_increment`
 * @property \Resound\Models\Artist $artist DEFINED BY `artist, int(11), NO, MUL, , `
 * @property string $name DEFINED BY `name, varchar(100), NO, , , `
 * @property string $genre DEFINED BY `genre, varchar(100), YES, , , `
 * @property string $release_year DEFINED BY `release_year, int(11), YES, , , `
 * @property string $accent_color_hex DEFINED BY `accent_color_hex, varchar(7), YES, , , `
 * @property string $cached_total_duration_seconds DEFINED BY `cached_total_duration_seconds, int(11), YES, , , `
 * @property string $cached_track_number DEFINED BY `cached_track_number, int(11), YES, , , `
 * @property \Resound\Models\User $user_author DEFINED BY `user_author, int(11), NO, MUL, , `
*/
class Album extends AbstractModel
{
    public static function getTable(): string
    {
        return "album";
    }

    public static function getPrimaryKey(): string
    {
        return 'id';
    }

    public static function getFields(): array
    {
        return [
            'id' => (new DatabaseField('id'))->setType(DatabaseField::INTEGER)->setNullable(false)->isGenerated()->hasDefault(true),
			'artist' => (new DatabaseField('artist'))->setType(DatabaseField::INTEGER)->setNullable(false)->hasDefault(true)->references(Artist::class, 'id'),
			'name' => (new DatabaseField('name'))->setType(DatabaseField::STRING)->setNullable(false)->hasDefault(true),
			'genre' => (new DatabaseField('genre'))->setType(DatabaseField::STRING)->setNullable(true)->hasDefault(true),
			'release_year' => (new DatabaseField('release_year'))->setType(DatabaseField::INTEGER)->setNullable(true)->hasDefault(true),
			'accent_color_hex' => (new DatabaseField('accent_color_hex'))->setType(DatabaseField::STRING)->setNullable(true)->hasDefault(true),
			'cached_total_duration_seconds' => (new DatabaseField('cached_total_duration_seconds'))->setType(DatabaseField::INTEGER)->setNullable(true)->hasDefault(true),
			'cached_track_number' => (new DatabaseField('cached_track_number'))->setType(DatabaseField::INTEGER)->setNullable(true)->hasDefault(true),
			'user_author' => (new DatabaseField('user_author'))->setType(DatabaseField::INTEGER)->setNullable(false)->hasDefault(true)->references(User::class, 'id')
        ];
    }
}
