import { Op, Sequelize } from "sequelize";
import { albumBaseIncludes } from "~/server/helpers/includes";
import models from "~/server/db/models";

export default defineEventHandler(async event => {
    const genre = event.context.params?.genre ?? '0';

    const user = (await getUserSession(event)).user?.id ?? 0;

    const options = (getQuery(event).likesOnly ?? false)
        ? { id: { [Op.in]: Sequelize.literal(`(SELECT track FROM user_like WHERE "user" = ${user})`) } }
        : {}

    return await models.Track.findAll({
        where: { ...options },
        order: [Sequelize.fn('RANDOM')],
        include: [
            {
                model: models.Album,
                as: 'album_album',
                include: [{
                    model: models.AlbumGenre,
                    as: 'album_genres',
                    where: { genre }
                }, ...albumBaseIncludes]
            },
            {
                model: models.TrackArtist,
                as: 'track_artists',
                include: [{
                    model: models.Artist,
                    as: 'artist_artist'
                }]
            },
        ],
        limit: 100
    })
})