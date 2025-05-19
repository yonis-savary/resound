import { Op, Sequelize } from 'sequelize'
import models from "~/server/db/models"

export default defineEventHandler(async () => {
    return models.Artist.findAll({
        where: {
            id: {
                [Op.in]: Sequelize.literal(`(
                    SELECT "artist"
                    FROM album_artist
                    JOIN album ON album_artist.album = album.id 
                    WHERE album.exists_locally = true
                )`)
            }
        }
    })
})