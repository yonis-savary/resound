import models from "~/server/db/models";

export default defineEventHandler(async event => {
    const track = event.context.params?.track;
    if (!track)
        return createError({statusMessage: 'track parameter needed !', statusCode: 400});

    const user = await getUserSession(event)

    await models.UserLike.destroy({
        where: {
            user: user.user.id,
            track: track
        }
    })
    return {status: "OK"};
})