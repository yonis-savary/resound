import { Op, Sequelize } from "sequelize";
import models from "~/server/db/models";

export default defineEventHandler(async event => {
    const genre = event.context.params?.genre ?? '0';

    const user = (await getUserSession(event)).user?.id ?? 0;

    const options = (getQuery(event).likesOnly ?? false)
        ? { id: { [Op.in]: Sequelize.literal(`(SELECT track FROM user_like WHERE "user" = ${user})`) } }
        : {}

    // Wanted to do this in one query, the {where: {name: genre}} in nested includes won't work
    // So this solution was chosen instead

    const albums = await models.Album.findAll({
        attributes: ["id"],
        include: [
            {
                model: models.AlbumGenre,
                as: "album_genres",
                required: true,
                include: [
                    {
                        model: models.Genre,
                        as: "genre_genre",
                        required: true,
                        where: { name: genre }
                    }
                ]
            }
        ]
    });

    const albumIds = albums.map(a => a.id);

    return await models.Track.findAll({
        where: {
            ...options,
            album: albumIds
        },
        order: [Sequelize.fn('RANDOM')],
        include: [
            {
                model: models.Album,
                as: 'album_album',
                include: [{
                    model: models.AlbumArtist,
                    as: 'album_artists'
                }]
            },
            {
                model: models.TrackArtist,
                as: 'track_artists',
                include: [{
                    model: models.Artist,
                    as: 'artist_artist',
                }]
            },
        ],
        limit: 100
    });
})