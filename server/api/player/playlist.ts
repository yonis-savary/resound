import { Op } from "sequelize"
import { albumBaseIncludes } from "~/helpers/includes"
import models from "~/server/db/models"

export default defineEventHandler(async (event) => {

    const user = await getUserSession(event)
    const key = user.user?.id ?? null;

    if (!key)
        return []

    const storage = useStorage('data/player');

    if (! await storage.hasItem(key))
        return [];

    const tracksIdList = await storage.getItem(key)

    const tracks = await models.Track.findAll({
        include: {
            model: models.Album,
            as: 'album_album',
            include: albumBaseIncludes
        },
        where: {
            id: {
                [Op.in]: tracksIdList
            }
        }
    })

    const sortedTracks = tracksIdList.map((trackId: number) => tracks.find(x => x.id === trackId));

    return sortedTracks
})