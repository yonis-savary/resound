import type Sequelize from 'sequelize';
import { DataTypes, Model, type Optional } from 'sequelize';
import type { Album, AlbumId } from './Album';
import type { PlaylistTrack, PlaylistTrackId } from './PlaylistTrack';
import type { TrackArtist, TrackArtistId } from './TrackArtist';
import type { UserLike, UserLikeId } from './UserLike';
import type { UserListening, UserListeningId } from './UserListening';

export interface TrackAttributes {
  id: number;
  api_id?: string;
  album: number;
  discovery_date?: Date;
  position?: number;
  disc_number?: number;
  name: string;
  slug: string;
  path?: string;
  duration_milliseconds?: number;
  explicit?: boolean;
}

export type TrackPk = "id";
export type TrackId = Track[TrackPk];
export type TrackOptionalAttributes = "id" | "api_id" | "discovery_date" | "position" | "disc_number" | "path" | "duration_milliseconds" | "explicit";
export type TrackCreationAttributes = Optional<TrackAttributes, TrackOptionalAttributes>;

export class Track extends Model<TrackAttributes, TrackCreationAttributes> implements TrackAttributes {
  declare id : number;
  declare api_id : undefined | string;
  declare album : number;
  declare discovery_date : undefined | Date;
  declare position : undefined | number;
  declare disc_number : undefined | number;
  declare name : string;
  declare slug : string;
  declare path : undefined | string;
  declare duration_milliseconds : undefined | number;
  declare explicit : undefined | boolean;

  // Track belongsTo Album via album
  declare album_album : Album;
  declare getAlbum_album : Sequelize.BelongsToGetAssociationMixin<Album>;
  declare setAlbum_album : Sequelize.BelongsToSetAssociationMixin<Album, AlbumId>;
  declare createAlbum_album : Sequelize.BelongsToCreateAssociationMixin<Album>;
  // Track hasMany PlaylistTrack via track
  declare playlist_tracks : PlaylistTrack[];
  declare getPlaylist_tracks : Sequelize.HasManyGetAssociationsMixin<PlaylistTrack>;
  declare setPlaylist_tracks : Sequelize.HasManySetAssociationsMixin<PlaylistTrack, PlaylistTrackId>;
  declare addPlaylist_track : Sequelize.HasManyAddAssociationMixin<PlaylistTrack, PlaylistTrackId>;
  declare addPlaylist_tracks : Sequelize.HasManyAddAssociationsMixin<PlaylistTrack, PlaylistTrackId>;
  declare createPlaylist_track : Sequelize.HasManyCreateAssociationMixin<PlaylistTrack>;
  declare removePlaylist_track : Sequelize.HasManyRemoveAssociationMixin<PlaylistTrack, PlaylistTrackId>;
  declare removePlaylist_tracks : Sequelize.HasManyRemoveAssociationsMixin<PlaylistTrack, PlaylistTrackId>;
  declare hasPlaylist_track : Sequelize.HasManyHasAssociationMixin<PlaylistTrack, PlaylistTrackId>;
  declare hasPlaylist_tracks : Sequelize.HasManyHasAssociationsMixin<PlaylistTrack, PlaylistTrackId>;
  declare countPlaylist_tracks : Sequelize.HasManyCountAssociationsMixin;
  // Track hasMany TrackArtist via track
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
  // Track hasMany UserLike via track
  declare user_likes : UserLike[];
  declare getUser_likes : Sequelize.HasManyGetAssociationsMixin<UserLike>;
  declare setUser_likes : Sequelize.HasManySetAssociationsMixin<UserLike, UserLikeId>;
  declare addUser_like : Sequelize.HasManyAddAssociationMixin<UserLike, UserLikeId>;
  declare addUser_likes : Sequelize.HasManyAddAssociationsMixin<UserLike, UserLikeId>;
  declare createUser_like : Sequelize.HasManyCreateAssociationMixin<UserLike>;
  declare removeUser_like : Sequelize.HasManyRemoveAssociationMixin<UserLike, UserLikeId>;
  declare removeUser_likes : Sequelize.HasManyRemoveAssociationsMixin<UserLike, UserLikeId>;
  declare hasUser_like : Sequelize.HasManyHasAssociationMixin<UserLike, UserLikeId>;
  declare hasUser_likes : Sequelize.HasManyHasAssociationsMixin<UserLike, UserLikeId>;
  declare countUser_likes : Sequelize.HasManyCountAssociationsMixin;
  // Track hasMany UserListening via track
  declare user_listenings : UserListening[];
  declare getUser_listenings : Sequelize.HasManyGetAssociationsMixin<UserListening>;
  declare setUser_listenings : Sequelize.HasManySetAssociationsMixin<UserListening, UserListeningId>;
  declare addUser_listening : Sequelize.HasManyAddAssociationMixin<UserListening, UserListeningId>;
  declare addUser_listenings : Sequelize.HasManyAddAssociationsMixin<UserListening, UserListeningId>;
  declare createUser_listening : Sequelize.HasManyCreateAssociationMixin<UserListening>;
  declare removeUser_listening : Sequelize.HasManyRemoveAssociationMixin<UserListening, UserListeningId>;
  declare removeUser_listenings : Sequelize.HasManyRemoveAssociationsMixin<UserListening, UserListeningId>;
  declare hasUser_listening : Sequelize.HasManyHasAssociationMixin<UserListening, UserListeningId>;
  declare hasUser_listenings : Sequelize.HasManyHasAssociationsMixin<UserListening, UserListeningId>;
  declare countUser_listenings : Sequelize.HasManyCountAssociationsMixin;

  static initModel(sequelize: Sequelize.Sequelize): typeof Track {
    return Track.init({
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    api_id: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    album: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'album',
        key: 'id'
      },
      unique: "track_album_name_key"
    },
    discovery_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    position: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    disc_number: {
      type: DataTypes.SMALLINT,
      allowNull: true
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: "track_album_name_key"
    },
    slug: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: "track_slug_key"
    },
    path: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    duration_milliseconds: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    explicit: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false
    }
  }, {
    sequelize,
    tableName: 'track',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "track_album_name_key",
        unique: true,
        fields: [
          { name: "album" },
          { name: "name" },
        ]
      },
      {
        name: "track_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
      {
        name: "track_slug_key",
        unique: true,
        fields: [
          { name: "slug" },
        ]
      },
    ]
  });
  }
}
