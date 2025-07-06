import { albumBaseIncludes } from "~/server/helpers/includes";
import models from "~/server/db/models"

export default defineEventHandler(async ()=>{
    return await models.Genre.findAll({
        include: [{
            model: models.AlbumGenre,
            as: 'album_genres',
            limit: 10,
            include: [{
                model: models.Album,
                as: 'album_album',
                include: albumBaseIncludes
            }]
        }]
    });
})