import { indexArtist } from "~/server/integrations/spotify/utils/indexArtist";
import { indexDiscography } from "~/server/integrations/spotify/utils/indexDiscography";

export default defineEventHandler(async event => {
    const params = getQuery(event);
    const artistApiId = (params.artist ?? null) as string|null;

    if (!artistApiId)
        return createError({statusMessage: 'artist parameter needed !', statusCode: 400})

    const artist = await indexArtist(artistApiId)

    try 
    {
        await indexDiscography(artistApiId);
    }
    catch(_) {}

    if (!artist)
        return createError({statusMessage: 'Could not index artist', statusCode: 500});

    return artist;
})