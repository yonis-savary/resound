import { albumBaseIncludes } from "~/helpers/includes";
import models from "~/server/db/models"

export default defineEventHandler(async (event) => {
  const user = await getUserSession(event);

  if (!(user.user?.id ?? null))
      return [];

  return await models.UserWishlist.findAll({
    where: {user: user.user.id},
    include: {
      model: models.Album,
      as: 'album_album',
      include: albumBaseIncludes
    }
  })
})
