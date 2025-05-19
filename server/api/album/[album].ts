import { albumTracksIncludes } from "~/helpers/includes";
import models from "~/server/db/models";

export default defineEventHandler(async event => {
    const slug = event.context.params?.album;
    if (!slug || !/^\d+$/.test(slug)) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Paramètre "album" invalide. Doit être un entier.',
        });
    }

    const album = await models.Album.findOne({where: {id: slug}, include: albumTracksIncludes});
    if (!album)
        throw createError({statusCode: 404, statusMessage: "Album not found"})

    return album
})