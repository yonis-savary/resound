import models from "~/server/db/models";

const albumBaseIncludes = [
    {
        model: models.AlbumArtist,
        as: "album_artists",
        include: [{
            model: models.Artist,
            as: 'artist_artist'
        }]
    }
];

const albumTracksIncludes = [
    ...albumBaseIncludes,
    {
        model: models.Track,
        as: 'tracks',
        include: [{
            model: models.TrackArtist,
            as: 'track_artists',
            include: [{
                model: models.Artist,
                as: 'artist_artist'
            }]
        }]
    },
    {
        model: models.AlbumGenre,
        as: 'album_genres',
        include: [{
            model: models.Genre,
            as: 'genre_genre',
        }]
    }
]

export { albumBaseIncludes, albumTracksIncludes };