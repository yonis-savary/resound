import { createReadStream } from "fs"
import models from "~/server/db/models";

export default defineEventHandler(async event => {
    const slug = event.context.params?.album;
    if (!slug || !/^\d+$/.test(slug)) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Paramètre "album" invalide. Doit être un entier.',
        });
    }

    const album = await models.Album.findOne({where: {id: slug}});
    if (!album)
        throw createError({statusCode: 404, statusMessage: "Album not found"})

    const storage = useStorage('data')

    const returnDefaultPicture = () => {
        const path = "public/assets/default-artist-picture.png";
        const fileStream = createReadStream(path);

        event.node.res.setHeader('Content-Type', 'image/png');
        event.node.res.setHeader('Cache-Control', 'max-age=' + 3600 )

        return fileStream.pipe(event.node.res);
    }

    if (!(album.picture_path && await storage.hasItem(album.picture_path))){
        return returnDefaultPicture();
    }

    const content = await storage.getItemRaw(album.picture_path)
    if (!content){
        return returnDefaultPicture()
    }

    event.node.res.setHeader('Content-Type', 'image/png');
    event.node.res.setHeader('Cache-Control', 'max-age=' + (3600*24*31) )

    return content
})