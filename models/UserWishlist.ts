import type Sequelize from 'sequelize';
import { DataTypes, Model } from 'sequelize';
import type { Optional } from 'sequelize';
import type { Album, AlbumId } from './Album';
import type { User, UserId } from './User';

export interface UserWishlistAttributes {
  id: number;
  user: number;
  album: number;
}

export type UserWishlistPk = "id";
export type UserWishlistId = UserWishlist[UserWishlistPk];
export type UserWishlistOptionalAttributes = "id";
export type UserWishlistCreationAttributes = Optional<UserWishlistAttributes, UserWishlistOptionalAttributes>;

export class UserWishlist extends Model<UserWishlistAttributes, UserWishlistCreationAttributes> implements UserWishlistAttributes {
  declare id : number;
  declare user : number;
  declare album : number;

  // UserWishlist belongsTo Album via album
  declare album_album : Album;
  declare getAlbum_album : Sequelize.BelongsToGetAssociationMixin<Album>;
  declare setAlbum_album : Sequelize.BelongsToSetAssociationMixin<Album, AlbumId>;
  declare createAlbum_album : Sequelize.BelongsToCreateAssociationMixin<Album>;
  // UserWishlist belongsTo User via user
  declare user_user : User;
  declare getUser_user : Sequelize.BelongsToGetAssociationMixin<User>;
  declare setUser_user : Sequelize.BelongsToSetAssociationMixin<User, UserId>;
  declare createUser_user : Sequelize.BelongsToCreateAssociationMixin<User>;

  static initModel(sequelize: Sequelize.Sequelize): typeof UserWishlist {
    return UserWishlist.init({
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
      unique: "user_wishlist_user_album_key"
    },
    album: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'album',
        key: 'id'
      },
      unique: "user_wishlist_user_album_key"
    }
  }, {
    sequelize,
    tableName: 'user_wishlist',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "user_wishlist_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
      {
        name: "user_wishlist_user_album_key",
        unique: true,
        fields: [
          { name: "user" },
          { name: "album" },
        ]
      },
    ]
  });
  }
}
