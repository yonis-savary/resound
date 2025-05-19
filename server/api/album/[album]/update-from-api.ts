import models from "~/server/db/models";
import { indexAlbum } from "~/server/integrations/spotify/utils/indexAlbum"

export default defineEventHandler(async event => {
    const albumId = event.context.params?.album;

    const album = await models.Album.findOne({ where: { id: albumId } });

    if (!album)
        return createError({ statusCode: 404, statusMessage: 'Album not found' });

    const albumAPIId = album.api_id ?? false;

    if (!albumAPIId)
        return createError({ statusCode: 400, statusMessage: 'Album api_id not found' });

    try {
        await indexAlbum(albumAPIId, true)
        return { status: "OK" };
    }
    catch(err) {
        return {status: 'Error', message: err}
    }
})