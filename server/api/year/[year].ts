import { Sequelize } from "sequelize";
import { albumTracksIncludes } from "~/helpers/includes";
import models from "~/server/db/models";

export default defineEventHandler(async (event) => {
    const year = event.context.params?.year;

    // Vérifie que year est un entier de 4 chiffres
    if (!year || !/^\d{4}$/.test(year)) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Paramètre "year" invalide. Doit être un entier sur 4 chiffres.',
        });
    }

    const numericYear = parseInt(year, 10);

    return await models.Album.findAll({
        where: Sequelize.literal(`EXTRACT(YEAR FROM release_date) = ${numericYear}`),
        include: albumTracksIncludes
    });
});