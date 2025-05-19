import type { Sequelize } from "sequelize";
import { Album as _Album } from "./Album";
import type { AlbumAttributes, AlbumCreationAttributes } from "./Album";
import { AlbumArtist as _AlbumArtist } from "./AlbumArtist";
import type { AlbumArtistAttributes, AlbumArtistCreationAttributes } from "./AlbumArtist";
import { AlbumGenre as _AlbumGenre } from "./AlbumGenre";
import type { AlbumGenreAttributes, AlbumGenreCreationAttributes } from "./AlbumGenre";
import { Artist as _Artist } from "./Artist";
import type { ArtistAttributes, ArtistCreationAttributes } from "./Artist";
import { Genre as _Genre } from "./Genre";
import type { GenreAttributes, GenreCreationAttributes } from "./Genre";
import { Playlist as _Playlist } from "./Playlist";
import type { PlaylistAttributes, PlaylistCreationAttributes } from "./Playlist";
import { PlaylistTrack as _PlaylistTrack } from "./PlaylistTrack";
import type { PlaylistTrackAttributes, PlaylistTrackCreationAttributes } from "./PlaylistTrack";
import { Track as _Track } from "./Track";
import type { TrackAttributes, TrackCreationAttributes } from "./Track";
import { TrackArtist as _TrackArtist } from "./TrackArtist";
import type { TrackArtistAttributes, TrackArtistCreationAttributes } from "./TrackArtist";
import { User as _User } from "./User";
import type { UserAttributes, UserCreationAttributes } from "./User";
import { UserLike as _UserLike } from "./UserLike";
import type { UserLikeAttributes, UserLikeCreationAttributes } from "./UserLike";
import { UserListening as _UserListening } from "./UserListening";
import type { UserListeningAttributes, UserListeningCreationAttributes } from "./UserListening";
import { UserWishlist as _UserWishlist } from "./UserWishlist";
import type { UserWishlistAttributes, UserWishlistCreationAttributes } from "./UserWishlist";

export {
  _Album as Album,
  _AlbumArtist as AlbumArtist,
  _AlbumGenre as AlbumGenre,
  _Artist as Artist,
  _Genre as Genre,
  _Playlist as Playlist,
  _PlaylistTrack as PlaylistTrack,
  _Track as Track,
  _TrackArtist as TrackArtist,
  _User as User,
  _UserLike as UserLike,
  _UserListening as UserListening,
  _UserWishlist as UserWishlist,
};

export type {
  AlbumAttributes,
  AlbumCreationAttributes,
  AlbumArtistAttributes,
  AlbumArtistCreationAttributes,
  AlbumGenreAttributes,
  AlbumGenreCreationAttributes,
  ArtistAttributes,
  ArtistCreationAttributes,
  GenreAttributes,
  GenreCreationAttributes,
  PlaylistAttributes,
  PlaylistCreationAttributes,
  PlaylistTrackAttributes,
  PlaylistTrackCreationAttributes,
  TrackAttributes,
  TrackCreationAttributes,
  TrackArtistAttributes,
  TrackArtistCreationAttributes,
  UserAttributes,
  UserCreationAttributes,
  UserLikeAttributes,
  UserLikeCreationAttributes,
  UserListeningAttributes,
  UserListeningCreationAttributes,
  UserWishlistAttributes,
  UserWishlistCreationAttributes,
};

export function initModels(sequelize: Sequelize) {
  const Album = _Album.initModel(sequelize);
  const AlbumArtist = _AlbumArtist.initModel(sequelize);
  const AlbumGenre = _AlbumGenre.initModel(sequelize);
  const Artist = _Artist.initModel(sequelize);
  const Genre = _Genre.initModel(sequelize);
  const Playlist = _Playlist.initModel(sequelize);
  const PlaylistTrack = _PlaylistTrack.initModel(sequelize);
  const Track = _Track.initModel(sequelize);
  const TrackArtist = _TrackArtist.initModel(sequelize);
  const User = _User.initModel(sequelize);
  const UserLike = _UserLike.initModel(sequelize);
  const UserListening = _UserListening.initModel(sequelize);
  const UserWishlist = _UserWishlist.initModel(sequelize);

  AlbumArtist.belongsTo(Album, { as: "album_album", foreignKey: "album"});
  Album.hasMany(AlbumArtist, { as: "album_artists", foreignKey: "album"});
  AlbumGenre.belongsTo(Album, { as: "album_album", foreignKey: "album"});
  Album.hasMany(AlbumGenre, { as: "album_genres", foreignKey: "album"});
  Track.belongsTo(Album, { as: "album_album", foreignKey: "album"});
  Album.hasMany(Track, { as: "tracks", foreignKey: "album"});
  UserWishlist.belongsTo(Album, { as: "album_album", foreignKey: "album"});
  Album.hasMany(UserWishlist, { as: "user_wishlists", foreignKey: "album"});
  AlbumArtist.belongsTo(Artist, { as: "artist_artist", foreignKey: "artist"});
  Artist.hasMany(AlbumArtist, { as: "album_artists", foreignKey: "artist"});
  TrackArtist.belongsTo(Artist, { as: "artist_artist", foreignKey: "artist"});
  Artist.hasMany(TrackArtist, { as: "track_artists", foreignKey: "artist"});
  AlbumGenre.belongsTo(Genre, { as: "genre_genre", foreignKey: "genre"});
  Genre.hasMany(AlbumGenre, { as: "album_genres", foreignKey: "genre"});
  PlaylistTrack.belongsTo(Playlist, { as: "playlist_playlist", foreignKey: "playlist"});
  Playlist.hasMany(PlaylistTrack, { as: "playlist_tracks", foreignKey: "playlist"});
  UserListening.belongsTo(Playlist, { as: "playlist_playlist", foreignKey: "playlist"});
  Playlist.hasMany(UserListening, { as: "user_listenings", foreignKey: "playlist"});
  PlaylistTrack.belongsTo(Track, { as: "track_track", foreignKey: "track"});
  Track.hasMany(PlaylistTrack, { as: "playlist_tracks", foreignKey: "track"});
  TrackArtist.belongsTo(Track, { as: "track_track", foreignKey: "track"});
  Track.hasMany(TrackArtist, { as: "track_artists", foreignKey: "track"});
  UserLike.belongsTo(Track, { as: "track_track", foreignKey: "track"});
  Track.hasMany(UserLike, { as: "user_likes", foreignKey: "track"});
  UserListening.belongsTo(Track, { as: "track_track", foreignKey: "track"});
  Track.hasMany(UserListening, { as: "user_listenings", foreignKey: "track"});
  Playlist.belongsTo(User, { as: "author_user", foreignKey: "author"});
  User.hasMany(Playlist, { as: "playlists", foreignKey: "author"});
  UserLike.belongsTo(User, { as: "user_user", foreignKey: "user"});
  User.hasMany(UserLike, { as: "user_likes", foreignKey: "user"});
  UserListening.belongsTo(User, { as: "user_user", foreignKey: "user"});
  User.hasMany(UserListening, { as: "user_listenings", foreignKey: "user"});
  UserWishlist.belongsTo(User, { as: "user_user", foreignKey: "user"});
  User.hasMany(UserWishlist, { as: "user_wishlists", foreignKey: "user"});

  return {
    Album: Album,
    AlbumArtist: AlbumArtist,
    AlbumGenre: AlbumGenre,
    Artist: Artist,
    Genre: Genre,
    Playlist: Playlist,
    PlaylistTrack: PlaylistTrack,
    Track: Track,
    TrackArtist: TrackArtist,
    User: User,
    UserLike: UserLike,
    UserListening: UserListening,
    UserWishlist: UserWishlist,
  };
}
