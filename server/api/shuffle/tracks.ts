import { Op, Sequelize } from "sequelize";
import { albumBaseIncludes } from "~/helpers/includes";
import models from "~/server/db/models";

export default defineEventHandler(async (event) => {
    const tracks = (getQuery(event).tracks ?? []) as string[];

    const tracksId = tracks.map(x => parseInt(x))

    return await models.Track.findAll({
        order: [Sequelize.fn('RANDOM')],
        where: { id: { [Op.in]: tracksId } },
        include: {
            model: models.Album,
            as: 'album_album',
            include: albumBaseIncludes
        }
    });
})