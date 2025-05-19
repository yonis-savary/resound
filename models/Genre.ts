import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { AlbumGenre, AlbumGenreId } from './AlbumGenre';

export interface GenreAttributes {
  id: number;
  name: string;
}

export type GenrePk = "id";
export type GenreId = Genre[GenrePk];
export type GenreOptionalAttributes = "id";
export type GenreCreationAttributes = Optional<GenreAttributes, GenreOptionalAttributes>;

export class Genre extends Model<GenreAttributes, GenreCreationAttributes> implements GenreAttributes {
  declare id : number;
  declare name : string;

  // Genre hasMany AlbumGenre via genre
  declare album_genres : AlbumGenre[];
  declare getAlbum_genres : Sequelize.HasManyGetAssociationsMixin<AlbumGenre>;
  declare setAlbum_genres : Sequelize.HasManySetAssociationsMixin<AlbumGenre, AlbumGenreId>;
  declare addAlbum_genre : Sequelize.HasManyAddAssociationMixin<AlbumGenre, AlbumGenreId>;
  declare addAlbum_genres : Sequelize.HasManyAddAssociationsMixin<AlbumGenre, AlbumGenreId>;
  declare createAlbum_genre : Sequelize.HasManyCreateAssociationMixin<AlbumGenre>;
  declare removeAlbum_genre : Sequelize.HasManyRemoveAssociationMixin<AlbumGenre, AlbumGenreId>;
  declare removeAlbum_genres : Sequelize.HasManyRemoveAssociationsMixin<AlbumGenre, AlbumGenreId>;
  declare hasAlbum_genre : Sequelize.HasManyHasAssociationMixin<AlbumGenre, AlbumGenreId>;
  declare hasAlbum_genres : Sequelize.HasManyHasAssociationsMixin<AlbumGenre, AlbumGenreId>;
  declare countAlbum_genres : Sequelize.HasManyCountAssociationsMixin;

  static initModel(sequelize: Sequelize.Sequelize): typeof Genre {
    return Genre.init({
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: "genre_name_key"
    }
  }, {
    sequelize,
    tableName: 'genre',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "genre_name_key",
        unique: true,
        fields: [
          { name: "name" },
        ]
      },
      {
        name: "genre_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
  }
}
