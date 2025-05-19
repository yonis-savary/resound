import models from "~/server/db/models";

export default defineEventHandler(async event => {
    const album = event.context.params?.album;
    if (!album)
        return createError({statusMessage: 'album parameter needed !', statusCode: 400});

    const user = await getUserSession(event)

    await models.UserWishlist.findOrCreate({
        where: {
            user: user.user.id,
            album: album
        }
    })
    return {status: "OK"};
})