import type Sequelize from 'sequelize';
import { DataTypes, Model, type Optional } from 'sequelize';
import type { Playlist, PlaylistId } from './Playlist';
import type { Track, TrackId } from './Track';

export interface PlaylistTrackAttributes {
  id: number;
  position: number;
  playlist: number;
  track: number;
}

export type PlaylistTrackPk = "id";
export type PlaylistTrackId = PlaylistTrack[PlaylistTrackPk];
export type PlaylistTrackOptionalAttributes = "id";
export type PlaylistTrackCreationAttributes = Optional<PlaylistTrackAttributes, PlaylistTrackOptionalAttributes>;

export class PlaylistTrack extends Model<PlaylistTrackAttributes, PlaylistTrackCreationAttributes> implements PlaylistTrackAttributes {
  declare id : number;
  declare position : number;
  declare playlist : number;
  declare track : number;

  // PlaylistTrack belongsTo Playlist via playlist
  declare playlist_playlist : Playlist;
  declare getPlaylist_playlist : Sequelize.BelongsToGetAssociationMixin<Playlist>;
  declare setPlaylist_playlist : Sequelize.BelongsToSetAssociationMixin<Playlist, PlaylistId>;
  declare createPlaylist_playlist : Sequelize.BelongsToCreateAssociationMixin<Playlist>;
  // PlaylistTrack belongsTo Track via track
  declare track_track : Track;
  declare getTrack_track : Sequelize.BelongsToGetAssociationMixin<Track>;
  declare setTrack_track : Sequelize.BelongsToSetAssociationMixin<Track, TrackId>;
  declare createTrack_track : Sequelize.BelongsToCreateAssociationMixin<Track>;

  static initModel(sequelize: Sequelize.Sequelize): typeof PlaylistTrack {
    return PlaylistTrack.init({
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    position: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: "playlist_track_playlist_position_key"
    },
    playlist: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'playlist',
        key: 'id'
      },
      unique: "playlist_track_playlist_position_key"
    },
    track: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'track',
        key: 'id'
      }
    }
  }, {
    sequelize,
    tableName: 'playlist_track',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "playlist_track_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
      {
        name: "playlist_track_playlist_position_key",
        unique: true,
        fields: [
          { name: "playlist" },
          { name: "position" },
        ]
      },
    ]
  });
  }
}
