import { indexAlbum } from "~/server/integrations/spotify/utils/indexAlbum";

export default defineEventHandler(async event => {
    const params = getQuery(event);
    const albumApiId = (params.album ?? null) as string|null;

    if (!albumApiId)
        return createError({statusMessage: 'album parameter needed !', statusCode: 400})

    const album = await indexAlbum(albumApiId)

    if (!album)
        return createError({statusMessage: 'Could not index album', statusCode: 500});

    return album;
})