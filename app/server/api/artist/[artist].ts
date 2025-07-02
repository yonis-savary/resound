import { albumTracksIncludes } from "~/helpers/includes";
import models from "~/server/db/models";

export default defineEventHandler(async event => {
    const slug = event.context.params?.artist;
    if (!slug || !/^\d+$/.test(slug)) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Paramètre "artist" invalide. Doit être un entier.',
        });
    }

    const artist = await models.Artist.findOne({
        where: {id: slug},
        include: {
            model: models.AlbumArtist,
            as: 'album_artists',
            include: [{
                model: models.Album,
                as: 'album_album',
                include: albumTracksIncludes
            }]
        }
    });
    if (!artist)
        throw createError({statusCode: 404, statusMessage: "Artist not found"})

    return artist
})