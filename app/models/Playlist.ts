import type Sequelize from 'sequelize';
import { DataTypes, Model, type Optional } from 'sequelize';
import type { PlaylistTrack, PlaylistTrackId } from './PlaylistTrack';
import type { User, UserId } from './User';
import type { UserListening, UserListeningId } from './UserListening';

export interface PlaylistAttributes {
  id: number;
  name: string;
  author: number;
}

export type PlaylistPk = "id";
export type PlaylistId = Playlist[PlaylistPk];
export type PlaylistOptionalAttributes = "id";
export type PlaylistCreationAttributes = Optional<PlaylistAttributes, PlaylistOptionalAttributes>;

export class Playlist extends Model<PlaylistAttributes, PlaylistCreationAttributes> implements PlaylistAttributes {
  declare id : number;
  declare name : string;
  declare author : number;

  // Playlist hasMany PlaylistTrack via playlist
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
  // Playlist hasMany UserListening via playlist
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
  // Playlist belongsTo User via author
  declare author_user : User;
  declare getAuthor_user : Sequelize.BelongsToGetAssociationMixin<User>;
  declare setAuthor_user : Sequelize.BelongsToSetAssociationMixin<User, UserId>;
  declare createAuthor_user : Sequelize.BelongsToCreateAssociationMixin<User>;

  static initModel(sequelize: Sequelize.Sequelize): typeof Playlist {
    return Playlist.init({
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    author: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'user',
        key: 'id'
      }
    }
  }, {
    sequelize,
    tableName: 'playlist',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "playlist_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
  }
}
