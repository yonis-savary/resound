import type Sequelize from 'sequelize';
import { DataTypes, Model, type Optional } from 'sequelize';
import type { Track, TrackId } from './Track';
import type { User, UserId } from './User';

export interface UserLikeAttributes {
  id: number;
  user: number;
  track: number;
}

export type UserLikePk = "id";
export type UserLikeId = UserLike[UserLikePk];
export type UserLikeOptionalAttributes = "id";
export type UserLikeCreationAttributes = Optional<UserLikeAttributes, UserLikeOptionalAttributes>;

export class UserLike extends Model<UserLikeAttributes, UserLikeCreationAttributes> implements UserLikeAttributes {
  declare id : number;
  declare user : number;
  declare track : number;

  // UserLike belongsTo Track via track
  declare track_track : Track;
  declare getTrack_track : Sequelize.BelongsToGetAssociationMixin<Track>;
  declare setTrack_track : Sequelize.BelongsToSetAssociationMixin<Track, TrackId>;
  declare createTrack_track : Sequelize.BelongsToCreateAssociationMixin<Track>;
  // UserLike belongsTo User via user
  declare user_user : User;
  declare getUser_user : Sequelize.BelongsToGetAssociationMixin<User>;
  declare setUser_user : Sequelize.BelongsToSetAssociationMixin<User, UserId>;
  declare createUser_user : Sequelize.BelongsToCreateAssociationMixin<User>;

  static initModel(sequelize: Sequelize.Sequelize): typeof UserLike {
    return UserLike.init({
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    user: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'user',
        key: 'id'
      },
      unique: "user_like_user_track_key"
    },
    track: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'track',
        key: 'id'
      },
      unique: "user_like_user_track_key"
    }
  }, {
    sequelize,
    tableName: 'user_like',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "user_like_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
      {
        name: "user_like_user_track_key",
        unique: true,
        fields: [
          { name: "user" },
          { name: "track" },
        ]
      },
    ]
  });
  }
}
