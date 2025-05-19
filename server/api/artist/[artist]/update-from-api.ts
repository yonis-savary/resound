import models from "~/server/db/models";
import { discoverArtist } from "~/server/integrations/spotify/utils/discoverArtist";
import { indexArtist } from "~/server/integrations/spotify/utils/indexArtist";
import { indexDiscography } from "~/server/integrations/spotify/utils/indexDiscography";

export default defineEventHandler(async event => {
    const artistId = event.context.params?.artist;


    const artist = await models.Artist.findOne({where: {id: artistId}});

    if (!artist)
        return createError({statusCode: 404, statusMessage: 'Artist not found'});

    if (! (artist.api_id ?? false))
    {
        const newApiId = await discoverArtist(artist.name);
        if (newApiId)
            artist.update({ api_id: newApiId })
    }

    const artistAPIId = artist.api_id ?? false;
    if (!artistAPIId)
        return createError({statusCode: 400, statusMessage: 'Artist api_id not found'});

    try 
    {
        await Promise.all([
            indexArtist(artistAPIId, true),
            indexDiscography(artistAPIId, true),
        ])
        return {status: "OK"};
    }
    catch (err)
    {
        return {status: 'Error', message: err}
    }
})