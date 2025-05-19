import { Op, Sequelize } from "sequelize";
import models from "~/server/db/models";

export default defineEventHandler(async event => {
    const artist = parseInt(event.context.params?.artist ?? '0');

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
                    model: models.AlbumArtist,
                    as: 'album_artists',
                    where: { artist }
                }]
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