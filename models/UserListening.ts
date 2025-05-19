import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { Playlist, PlaylistId } from './Playlist';
import type { Track, TrackId } from './Track';
import type { User, UserId } from './User';

export interface UserListeningAttributes {
  id: number;
  timestamp?: Date;
  user: number;
  track: number;
  playlist?: number;
}

export type UserListeningPk = "id";
export type UserListeningId = UserListening[UserListeningPk];
export type UserListeningOptionalAttributes = "id" | "timestamp" | "playlist";
export type UserListeningCreationAttributes = Optional<UserListeningAttributes, UserListeningOptionalAttributes>;

export class UserListening extends Model<UserListeningAttributes, UserListeningCreationAttributes> implements UserListeningAttributes {
  declare id : number;
  declare timestamp : undefined | Date;
  declare user : number;
  declare track : number;
  declare playlist : undefined | number;

  // UserListening belongsTo Playlist via playlist
  declare playlist_playlist : Playlist;
  declare getPlaylist_playlist : Sequelize.BelongsToGetAssociationMixin<Playlist>;
  declare setPlaylist_playlist : Sequelize.BelongsToSetAssociationMixin<Playlist, PlaylistId>;
  declare createPlaylist_playlist : Sequelize.BelongsToCreateAssociationMixin<Playlist>;
  // UserListening belongsTo Track via track
  declare track_track : Track;
  declare getTrack_track : Sequelize.BelongsToGetAssociationMixin<Track>;
  declare setTrack_track : Sequelize.BelongsToSetAssociationMixin<Track, TrackId>;
  declare createTrack_track : Sequelize.BelongsToCreateAssociationMixin<Track>;
  // UserListening belongsTo User via user
  declare user_user : User;
  declare getUser_user : Sequelize.BelongsToGetAssociationMixin<User>;
  declare setUser_user : Sequelize.BelongsToSetAssociationMixin<User, UserId>;
  declare createUser_user : Sequelize.BelongsToCreateAssociationMixin<User>;

  static initModel(sequelize: Sequelize.Sequelize): typeof UserListening {
    return UserListening.init({
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    timestamp: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: Sequelize.Sequelize.literal('CURRENT_TIMESTAMP')
    },
    user: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'user',
        key: 'id'
      }
    },
    track: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'track',
        key: 'id'
      }
    },
    playlist: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'playlist',
        key: 'id'
      }
    }
  }, {
    sequelize,
    tableName: 'user_listening',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "user_listening_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
  }
}
