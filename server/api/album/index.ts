import { albumBaseIncludes } from "~/helpers/includes"
import models from "~/server/db/models"

export default defineEventHandler(async ()=>{
    return models.Album.findAll({
        where: {
            exists_locally: true
        },
        include: albumBaseIncludes,
        attributes: ['id', 'name', 'exists_locally']
    })
})