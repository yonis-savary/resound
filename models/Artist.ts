import type Sequelize from 'sequelize';
import { DataTypes, Model, type Optional } from 'sequelize';
import type { AlbumArtist, AlbumArtistId } from './AlbumArtist';
import type { TrackArtist, TrackArtistId } from './TrackArtist';

export interface ArtistAttributes {
  id: number;
  last_update: Date;
  last_discography_update: Date;
  api_id?: string;
  picture_path?: string;
  name: string;
  slug: string;
  exists_locally?: boolean;
  description?: string;
  url?: string;
}

export type ArtistPk = "id";
export type ArtistId = Artist[ArtistPk];
export type ArtistOptionalAttributes = "id" | "last_update" | "last_discography_update" | "api_id" | "picture_path" | "exists_locally" | "description" | "url";
export type ArtistCreationAttributes = Optional<ArtistAttributes, ArtistOptionalAttributes>;

export class Artist extends Model<ArtistAttributes, ArtistCreationAttributes> implements ArtistAttributes {
  declare id : number;
  declare last_update : Date;
  declare last_discography_update : Date;
  declare api_id : undefined | string;
  declare picture_path : undefined | string;
  declare name : string;
  declare slug : string;
  declare exists_locally : undefined | boolean;
  declare description : undefined | string;
  declare url : undefined | string;

  // Artist hasMany AlbumArtist via artist
  declare album_artists : AlbumArtist[];
  declare getAlbum_artists : Sequelize.HasManyGetAssociationsMixin<AlbumArtist>;
  declare setAlbum_artists : Sequelize.HasManySetAssociationsMixin<AlbumArtist, AlbumArtistId>;
  declare addAlbum_artist : Sequelize.HasManyAddAssociationMixin<AlbumArtist, AlbumArtistId>;
  declare addAlbum_artists : Sequelize.HasManyAddAssociationsMixin<AlbumArtist, AlbumArtistId>;
  declare createAlbum_artist : Sequelize.HasManyCreateAssociationMixin<AlbumArtist>;
  declare removeAlbum_artist : Sequelize.HasManyRemoveAssociationMixin<AlbumArtist, AlbumArtistId>;
  declare removeAlbum_artists : Sequelize.HasManyRemoveAssociationsMixin<AlbumArtist, AlbumArtistId>;
  declare hasAlbum_artist : Sequelize.HasManyHasAssociationMixin<AlbumArtist, AlbumArtistId>;
  declare hasAlbum_artists : Sequelize.HasManyHasAssociationsMixin<AlbumArtist, AlbumArtistId>;
  declare countAlbum_artists : Sequelize.HasManyCountAssociationsMixin;
  // Artist hasMany TrackArtist via artist
  declare track_artists : TrackArtist[];
  declare getTrack_artists : Sequelize.HasManyGetAssociationsMixin<TrackArtist>;
  declare setTrack_artists : Sequelize.HasManySetAssociationsMixin<TrackArtist, TrackArtistId>;
  declare addTrack_artist : Sequelize.HasManyAddAssociationMixin<TrackArtist, TrackArtistId>;
  declare addTrack_artists : Sequelize.HasManyAddAssociationsMixin<TrackArtist, TrackArtistId>;
  declare createTrack_artist : Sequelize.HasManyCreateAssociationMixin<TrackArtist>;
  declare removeTrack_artist : Sequelize.HasManyRemoveAssociationMixin<TrackArtist, TrackArtistId>;
  declare removeTrack_artists : Sequelize.HasManyRemoveAssociationsMixin<TrackArtist, TrackArtistId>;
  declare hasTrack_artist : Sequelize.HasManyHasAssociationMixin<TrackArtist, TrackArtistId>;
  declare hasTrack_artists : Sequelize.HasManyHasAssociationsMixin<TrackArtist, TrackArtistId>;
  declare countTrack_artists : Sequelize.HasManyCountAssociationsMixin;

  static initModel(sequelize: Sequelize.Sequelize): typeof Artist {
    return Artist.init({
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    last_update: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: "2000-01-01 00:00:00"
    },
    last_discography_update: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: "2000-01-01 00:00:00"
    },
    api_id: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    picture_path: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    slug: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: "artist_slug_key"
    },
    exists_locally: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    url: {
      type: DataTypes.STRING(255),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'artist',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "artist_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
      {
        name: "artist_slug_key",
        unique: true,
        fields: [
          { name: "slug" },
        ]
      },
    ]
  });
  }
}
