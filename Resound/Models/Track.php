<?php

namespace Resound\Models;

use YonisSavary\Sharp\Classes\Data\DatabaseField;
use YonisSavary\Sharp\Classes\Data\AbstractModel;
use Resound\Models\Album;

/**
 * @property string $id DEFINED BY `id, int(11), NO, PRI, , auto_increment`
 * @property string $edition_date DEFINED BY `edition_date, timestamp, YES, , current_timestamp(), `
 * @property \Resound\Models\Album $album DEFINED BY `album, int(11), NO, MUL, , `
 * @property string $name DEFINED BY `name, varchar(255), NO, , , `
 * @property string $position DEFINED BY `position, int(11), YES, , , `
 * @property string $disc_number DEFINED BY `disc_number, smallint(6), YES, , , `
 * @property string $artist DEFINED BY `artist, varchar(100), YES, , , `
 * @property string $producer DEFINED BY `producer, varchar(255), YES, , , `
 * @property string $duration_seconds DEFINED BY `duration_seconds, int(11), YES, , , `
 * @property string $path DEFINED BY `path, varchar(1024), NO, , , `
 * @property string $size_kb DEFINED BY `size_kb, int(11), YES, , , `
*/
class Track extends AbstractModel
{
    public static function getTable(): string
    {
        return "track";
    }

    public static function getPrimaryKey(): string
    {
        return 'id';
    }

    public static function getFields(): array
    {
        return [
            'id' => (new DatabaseField('id'))->setType(DatabaseField::INTEGER)->setNullable(false)->isGenerated()->hasDefault(true),
			'edition_date' => (new DatabaseField('edition_date'))->setType(DatabaseField::STRING)->setNullable(true)->hasDefault(true),
			'album' => (new DatabaseField('album'))->setType(DatabaseField::INTEGER)->setNullable(false)->hasDefault(true)->references(Album::class, 'id'),
			'name' => (new DatabaseField('name'))->setType(DatabaseField::STRING)->setNullable(false)->hasDefault(true),
			'position' => (new DatabaseField('position'))->setType(DatabaseField::INTEGER)->setNullable(true)->hasDefault(true),
			'disc_number' => (new DatabaseField('disc_number'))->setType(DatabaseField::INTEGER)->setNullable(true)->hasDefault(true),
			'artist' => (new DatabaseField('artist'))->setType(DatabaseField::STRING)->setNullable(true)->hasDefault(true),
			'producer' => (new DatabaseField('producer'))->setType(DatabaseField::STRING)->setNullable(true)->hasDefault(true),
			'duration_seconds' => (new DatabaseField('duration_seconds'))->setType(DatabaseField::INTEGER)->setNullable(true)->hasDefault(true),
			'path' => (new DatabaseField('path'))->setType(DatabaseField::STRING)->setNullable(false)->hasDefault(true),
			'size_kb' => (new DatabaseField('size_kb'))->setType(DatabaseField::INTEGER)->setNullable(true)->hasDefault(true)
        ];
    }
}
