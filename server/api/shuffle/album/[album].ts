import { Op, Sequelize } from "sequelize";
import { albumBaseIncludes } from "~/helpers/includes";
import models from "~/server/db/models";

export default defineEventHandler(async event => {
    const album = parseInt(event.context.params?.album ?? '0');

    const user = (await getUserSession(event)).user?.id ?? 0;

    const options = (getQuery(event).likesOnly ?? false)
        ? { id: { [Op.in]: Sequelize.literal(`(SELECT track FROM user_like WHERE "user" = ${user})`) }}
        : {}

    return await models.Track.findAll({
        where: {...options, album},
        include: [
            {
                model: models.TrackArtist,
                as: 'track_artists',
                include: [{
                    model: models.Artist,
                    as: 'artist_artist'
                }]
            },
            {
                model: models.Album,
                as: 'album_album',
                include: albumBaseIncludes
            }
        ],
        order: [Sequelize.fn('RANDOM')],
        limit: 100
    })
})