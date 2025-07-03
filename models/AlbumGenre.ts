import type Sequelize from 'sequelize';
import { DataTypes, Model, type Optional } from 'sequelize';
import type { Album, AlbumId } from './Album';
import type { Genre, GenreId } from './Genre';

export interface AlbumGenreAttributes {
  id: number;
  album: number;
  genre: number;
}

export type AlbumGenrePk = "id";
export type AlbumGenreId = AlbumGenre[AlbumGenrePk];
export type AlbumGenreOptionalAttributes = "id";
export type AlbumGenreCreationAttributes = Optional<AlbumGenreAttributes, AlbumGenreOptionalAttributes>;

export class AlbumGenre extends Model<AlbumGenreAttributes, AlbumGenreCreationAttributes> implements AlbumGenreAttributes {
  declare id : number;
  declare album : number;
  declare genre : number;

  // AlbumGenre belongsTo Album via album
  declare album_album : Album;
  declare getAlbum_album : Sequelize.BelongsToGetAssociationMixin<Album>;
  declare setAlbum_album : Sequelize.BelongsToSetAssociationMixin<Album, AlbumId>;
  declare createAlbum_album : Sequelize.BelongsToCreateAssociationMixin<Album>;
  // AlbumGenre belongsTo Genre via genre
  declare genre_genre : Genre;
  declare getGenre_genre : Sequelize.BelongsToGetAssociationMixin<Genre>;
  declare setGenre_genre : Sequelize.BelongsToSetAssociationMixin<Genre, GenreId>;
  declare createGenre_genre : Sequelize.BelongsToCreateAssociationMixin<Genre>;

  static initModel(sequelize: Sequelize.Sequelize): typeof AlbumGenre {
    return AlbumGenre.init({
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    album: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'album',
        key: 'id'
      },
      unique: "album_genre_album_genre_key"
    },
    genre: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'genre',
        key: 'id'
      },
      unique: "album_genre_album_genre_key"
    }
  }, {
    sequelize,
    tableName: 'album_genre',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "album_genre_album_genre_key",
        unique: true,
        fields: [
          { name: "album" },
          { name: "genre" },
        ]
      },
      {
        name: "album_genre_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
  }
}
