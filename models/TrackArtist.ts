import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { Artist, ArtistId } from './Artist';
import type { Track, TrackId } from './Track';

export interface TrackArtistAttributes {
  id: number;
  track: number;
  artist: number;
}

export type TrackArtistPk = "id";
export type TrackArtistId = TrackArtist[TrackArtistPk];
export type TrackArtistOptionalAttributes = "id";
export type TrackArtistCreationAttributes = Optional<TrackArtistAttributes, TrackArtistOptionalAttributes>;

export class TrackArtist extends Model<TrackArtistAttributes, TrackArtistCreationAttributes> implements TrackArtistAttributes {
  declare id : number;
  declare track : number;
  declare artist : number;

  // TrackArtist belongsTo Artist via artist
  declare artist_artist : Artist;
  declare getArtist_artist : Sequelize.BelongsToGetAssociationMixin<Artist>;
  declare setArtist_artist : Sequelize.BelongsToSetAssociationMixin<Artist, ArtistId>;
  declare createArtist_artist : Sequelize.BelongsToCreateAssociationMixin<Artist>;
  // TrackArtist belongsTo Track via track
  declare track_track : Track;
  declare getTrack_track : Sequelize.BelongsToGetAssociationMixin<Track>;
  declare setTrack_track : Sequelize.BelongsToSetAssociationMixin<Track, TrackId>;
  declare createTrack_track : Sequelize.BelongsToCreateAssociationMixin<Track>;

  static initModel(sequelize: Sequelize.Sequelize): typeof TrackArtist {
    return TrackArtist.init({
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    track: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'track',
        key: 'id'
      },
      unique: "track_artist_track_artist_key"
    },
    artist: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'artist',
        key: 'id'
      },
      unique: "track_artist_track_artist_key"
    }
  }, {
    sequelize,
    tableName: 'track_artist',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "track_artist_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
      {
        name: "track_artist_track_artist_key",
        unique: true,
        fields: [
          { name: "track" },
          { name: "artist" },
        ]
      },
    ]
  });
  }
}
