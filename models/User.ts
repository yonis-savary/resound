import type Sequelize from 'sequelize';
import { DataTypes, Model, type Optional } from 'sequelize';
import type { Playlist, PlaylistId } from './Playlist';
import type { UserLike, UserLikeId } from './UserLike';
import type { UserListening, UserListeningId } from './UserListening';
import type { UserWishlist, UserWishlistId } from './UserWishlist';

export interface UserAttributes {
  id: number;
  username: string;
  password: string;
}

export type UserPk = "id";
export type UserId = User[UserPk];
export type UserOptionalAttributes = "id";
export type UserCreationAttributes = Optional<UserAttributes, UserOptionalAttributes>;

export class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  declare id : number;
  declare username : string;
  declare password : string;

  // User hasMany Playlist via author
  declare playlists : Playlist[];
  declare getPlaylists : Sequelize.HasManyGetAssociationsMixin<Playlist>;
  declare setPlaylists : Sequelize.HasManySetAssociationsMixin<Playlist, PlaylistId>;
  declare addPlaylist : Sequelize.HasManyAddAssociationMixin<Playlist, PlaylistId>;
  declare addPlaylists : Sequelize.HasManyAddAssociationsMixin<Playlist, PlaylistId>;
  declare createPlaylist : Sequelize.HasManyCreateAssociationMixin<Playlist>;
  declare removePlaylist : Sequelize.HasManyRemoveAssociationMixin<Playlist, PlaylistId>;
  declare removePlaylists : Sequelize.HasManyRemoveAssociationsMixin<Playlist, PlaylistId>;
  declare hasPlaylist : Sequelize.HasManyHasAssociationMixin<Playlist, PlaylistId>;
  declare hasPlaylists : Sequelize.HasManyHasAssociationsMixin<Playlist, PlaylistId>;
  declare countPlaylists : Sequelize.HasManyCountAssociationsMixin;
  // User hasMany UserLike via user
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
  // User hasMany UserListening via user
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
  // User hasMany UserWishlist via user
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

  static initModel(sequelize: Sequelize.Sequelize): typeof User {
    return User.init({
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    username: {
      type: DataTypes.STRING(200),
      allowNull: false,
      unique: "user_username_key"
    },
    password: {
      type: DataTypes.STRING(100),
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'user',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "user_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
      {
        name: "user_username_key",
        unique: true,
        fields: [
          { name: "username" },
        ]
      },
    ]
  });
  }
}
