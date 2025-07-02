import { createReadStream } from "fs"
import models from "~/server/db/models";


export default defineEventHandler(async event => {
    const slug = event.context.params?.artist;
    if (!slug || !/^\d+$/.test(slug)) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Paramètre "artist" invalide. Doit être un entier.',
        });
    }

    const artist = await models.Artist.findOne({where: {id: slug}});
    if (!artist)
        throw createError({statusCode: 404, statusMessage: "Artist not found"})

    const storage = useStorage('data')

    const returnDefaultPicture = () => {
        const path = "public/assets/default-artist-picture.png";
        const fileStream = createReadStream(path);

        if (cacheDuration)
        {
            event.node.res.setHeader('Content-Type', 'image/png');
            event.node.res.setHeader('Cache-Control', 'max-age=' + 3600 )
        }

        return fileStream.pipe(event.node.res);
    }

    let cacheDuration: number|null = 3600*24*7;
    let storageKey : string|null = null;

    if (!(artist.picture_path && await storage.hasItem(artist.picture_path))){

        const anyAlbum = await models.AlbumArtist.findOne({
            where: {artist: artist.id},
            include: { model: models.Album, as: 'album_album' }
        });
        cacheDuration = null;
        if (anyAlbum && anyAlbum.album_album.picture_path)
        {
            cacheDuration = 3600;
            storageKey = anyAlbum.album_album.picture_path
        }

        return returnDefaultPicture();
    }
    else
    {
        storageKey = artist.picture_path
    }

    const content = await storage.getItemRaw(storageKey)
    if (!content){
        return returnDefaultPicture()
    }

    event.node.res.setHeader('Content-Type', 'image/png');
    event.node.res.setHeader('Cache-Control', 'max-age=' + (cacheDuration) )

    return content
})