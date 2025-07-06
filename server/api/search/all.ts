import models from "~/server/db/models";
import { Op } from "sequelize";
import { albumBaseIncludes } from "~/server/helpers/includes";

export default defineEventHandler(async event => {
    const object = getQuery(event).q ?? null;

    if (!object)
        throw createError({
            statusCode: 400,
            statusMessage: 'Paramètre "object" nécessaire.',
        });

    return {
        artists: await models.Artist.findAll({
            where: { name: {[Op.iLike]: `%${object}%`} }
        }),
        albums: await models.Album.findAll({
            where: { name: {[Op.iLike]: `%${object}%`} }, include: albumBaseIncludes
        }),
        tracks: await models.Track.findAll({
            where: { name: {[Op.iLike]: `%${object}%`} }, 
            include: {
                model: models.Album,
                as: "album_album",
                include: albumBaseIncludes
            }
        }),
    }
});