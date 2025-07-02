import { Op, Sequelize } from "sequelize";
import { albumBaseIncludes } from "~/helpers/includes";
import models from "~/server/db/models";

export default defineEventHandler(async event => {
  const user = await getUserSession(event);

  if (!(user.user?.id ?? null))
    return [];

  const options = (getQuery(event).likesOnly ?? false)
    ? { where: { id: { [Op.in]: Sequelize.literal(`(SELECT track FROM user_like WHERE "user" = ${user.user.id})`) } } }
    : {}

  return models.Track.findAll({
    limit: 100,
    order: [Sequelize.fn('RANDOM')],
    ...options,
    include: [{
      model: models.Album,
      as: 'album_album',
      include: albumBaseIncludes
    },
    {
      model: models.TrackArtist,
      as: 'track_artists',
      include: [{
        model: models.Artist,
        as: 'artist_artist'
      }]
    },
    ]
  })
})