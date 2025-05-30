import { albumBaseIncludes } from "~/helpers/includes";
import models from "~/server/db/models";

export default defineEventHandler(async (event) => {
    const slug = event.context.params?.genre;
    if (!slug || !/^\d+$/i.test(slug)) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Paramètre "genre" nécessaire.',
        });
    }

    return await models.Genre.findOne({
        where: { id: slug },
        include: [{
            model: models.AlbumGenre,
            as: "album_genres",
            include: [{
                model: models.Album,
                as: 'album_album',
                include: albumBaseIncludes
            }]
        }]
    });
})