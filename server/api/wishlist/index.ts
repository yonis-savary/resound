import { Op, Sequelize } from "sequelize"
import models from "~/server/db/models"

export default defineEventHandler(async event => {

  const user = await getUserSession(event);

  if (!(user.user?.id ?? null))
      return [];

  return (await models.Album.findAll({
    attributes:['id'],
    where: {
      id: { [Op.in]: Sequelize.literal(`(SELECT album FROM user_wishlist WHERE "user" = ${user.user.id })`) }
    }
  })).map(x => x.id)
})
