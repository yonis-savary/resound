import type Sequelize from 'sequelize';
import { DataTypes, Model } from 'sequelize';
import type { Optional } from 'sequelize';
import type { AlbumArtist, AlbumArtistId } from './AlbumArtist';
import type { AlbumGenre, AlbumGenreId } from './AlbumGenre';
import type { Track, TrackId } from './Track';
import type { UserWishlist, UserWishlistId } from './UserWishlist';

export interface AlbumAttributes {
  id: number;
  last_update: Date;
  api_id?: string;
  url?: string;
  type: string;
  name: string;
  slug: string;
  release_date?: string;
  picture_path?: string;
  total_duration_milliseconds_cache?: number;
  track_count_cache?: number;
  exists_locally?: boolean;
  addition_date?: Date;
  color?: string;
}

export type AlbumPk = "id";
export type AlbumId = Album[AlbumPk];
export type AlbumOptionalAttributes = "id" | "last_update" | "api_id" | "url" | "release_date" | "picture_path" | "total_duration_milliseconds_cache" | "track_count_cache" | "exists_locally" | "addition_date" | "color";
export type AlbumCreationAttributes = Optional<AlbumAttributes, AlbumOptionalAttributes>;

export class Album extends Model<AlbumAttributes, AlbumCreationAttributes> implements AlbumAttributes {
  declare id : number;
  declare last_update : Date;
  declare api_id : undefined | string;
  declare url : undefined | string;
  declare type : string;
  declare name : string;
  declare slug : string;
  declare release_date : undefined | string;
  declare picture_path : undefined | string;
  declare total_duration_milliseconds_cache : undefined | number;
  declare track_count_cache : undefined | number;
  declare exists_locally : undefined | boolean;
  declare addition_date : undefined | Date;
  declare color : undefined | string;

  // Album hasMany AlbumArtist via album
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
  // Album hasMany AlbumGenre via album
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
  // Album hasMany Track via album
  declare tracks : Track[];
  declare getTracks : Sequelize.HasManyGetAssociationsMixin<Track>;
  declare setTracks : Sequelize.HasManySetAssociationsMixin<Track, TrackId>;
  declare addTrack : Sequelize.HasManyAddAssociationMixin<Track, TrackId>;
  declare addTracks : Sequelize.HasManyAddAssociationsMixin<Track, TrackId>;
  declare createTrack : Sequelize.HasManyCreateAssociationMixin<Track>;
  declare removeTrack : Sequelize.HasManyRemoveAssociationMixin<Track, TrackId>;
  declare removeTracks : Sequelize.HasManyRemoveAssociationsMixin<Track, TrackId>;
  declare hasTrack : Sequelize.HasManyHasAssociationMixin<Track, TrackId>;
  declare hasTracks : Sequelize.HasManyHasAssociationsMixin<Track, TrackId>;
  declare countTracks : Sequelize.HasManyCountAssociationsMixin;
  // Album hasMany UserWishlist via album
  declare user_wishlists : UserWishlist[];
  declare getUser_wishlists : Sequelize.HasManyGetAssociationsMixin<UserWishlist>;
  declare setUser_wishlists : Sequelize.HasManySetAssociationsMixin<UserWishlist, UserWishlistId>;
  declare addUser_wishlist : Sequelize.HasManyAddAssociationMixin<UserWishlist, UserWishlistId>;
  declare addUser_wishlists : Sequelize.HasManyAddAssociationsMixin<UserWishlist, UserWishlistId>;
  declare createUser_wishlist : Sequelize.HasManyCreateAssociationMixin<UserWishlist>;
  declare removeUser_wishlist : Sequelize.HasManyRemoveAssociationMixin<UserWishlist, UserWishlistId>;
  declare removeUser_wishlists : Sequelize.HasManyRemoveAssociationsMixin<UserWishlist, UserWishlistId>;
  declare hasUser_wishlist : Sequelize.HasManyHasAssociationMixin<UserWishlist, UserWishlistId>;
  declare hasUser_wishlists : Sequelize.HasManyHasAssociationsMixin<UserWishlist, UserWishlistId>;
  declare countUser_wishlists : Sequelize.HasManyCountAssociationsMixin;

  static initModel(sequelize: Sequelize.Sequelize): typeof Album {
    return Album.init({
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
    api_id: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    url: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    type: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    slug: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: "album_slug_key"
    },
    release_date: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    picture_path: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    total_duration_milliseconds_cache: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    track_count_cache: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    exists_locally: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false
    },
    addition_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    color: {
      type: DataTypes.STRING(7),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'album',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "album_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
      {
        name: "album_slug_key",
        unique: true,
        fields: [
          { name: "slug" },
        ]
      },
    ]
  });
  }
}
