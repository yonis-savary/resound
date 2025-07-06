import type Sequelize from 'sequelize';
import { DataTypes, Model } from 'sequelize';
import type { Optional } from 'sequelize';
import type { Album, AlbumId } from './Album';
import type { Artist, ArtistId } from './Artist';

export interface AlbumArtistAttributes {
  id: number;
  album: number;
  artist: number;
}

export type AlbumArtistPk = "id";
export type AlbumArtistId = AlbumArtist[AlbumArtistPk];
export type AlbumArtistOptionalAttributes = "id";
export type AlbumArtistCreationAttributes = Optional<AlbumArtistAttributes, AlbumArtistOptionalAttributes>;

export class AlbumArtist extends Model<AlbumArtistAttributes, AlbumArtistCreationAttributes> implements AlbumArtistAttributes {
  declare id : number;
  declare album : number;
  declare artist : number;

  // AlbumArtist belongsTo Album via album
  declare album_album : Album;
  declare getAlbum_album : Sequelize.BelongsToGetAssociationMixin<Album>;
  declare setAlbum_album : Sequelize.BelongsToSetAssociationMixin<Album, AlbumId>;
  declare createAlbum_album : Sequelize.BelongsToCreateAssociationMixin<Album>;
  // AlbumArtist belongsTo Artist via artist
  declare artist_artist : Artist;
  declare getArtist_artist : Sequelize.BelongsToGetAssociationMixin<Artist>;
  declare setArtist_artist : Sequelize.BelongsToSetAssociationMixin<Artist, ArtistId>;
  declare createArtist_artist : Sequelize.BelongsToCreateAssociationMixin<Artist>;

  static initModel(sequelize: Sequelize.Sequelize): typeof AlbumArtist {
    return AlbumArtist.init({
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
      unique: "album_artist_album_artist_key"
    },
    artist: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'artist',
        key: 'id'
      },
      unique: "album_artist_album_artist_key"
    }
  }, {
    sequelize,
    tableName: 'album_artist',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "album_artist_album_artist_key",
        unique: true,
        fields: [
          { name: "album" },
          { name: "artist" },
        ]
      },
      {
        name: "album_artist_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
  }
}
