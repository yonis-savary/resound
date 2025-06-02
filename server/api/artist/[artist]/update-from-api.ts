import { Op } from "sequelize";
import models from "~/server/db/models";
import { discoverArtist } from "~/server/integrations/spotify/utils/discoverArtist";
import { indexAlbum } from "~/server/integrations/spotify/utils/indexAlbum";
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
        ]);

        const albumsToUpdate = await models.Album.findAll({
            include: [{
                model: models.AlbumArtist,
                where: {artist: artist.id},
                as: 'album_artists'
            }],
            where: {
                type: { [Op.ne]: 'single' }
            },
            limit: 5,
            order: [['release_date', 'DESC']]
        })

        await Promise.all(albumsToUpdate.map(album => {
            console.log('Indexing album : ' + album.api_id)
            return album.api_id ? indexAlbum(album.api_id): null
        }));

        return {status: "OK"};
    }
    catch (err)
    {
        console.error(err);
        return {status: 'Error', message: err}
    }
})