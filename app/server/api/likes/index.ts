import models from "~/server/db/models"

export default defineEventHandler(async event => {

  const user = await getUserSession(event);

  if (!(user.user?.id ?? null))
      return [];

  return (await models.UserLike.findAll({
    attributes:['track'],
    where: { user: user.user.id }
  })).map(x => x.track)
})
