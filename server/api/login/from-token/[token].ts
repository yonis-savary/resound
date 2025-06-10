import models from "~/server/db/models";
import { getCache, hasCache } from "~/server/utils/cache";

export default defineEventHandler(async event => {
    const token = event.context.params?.token ?? 'no-token';

    if (! await hasCache(token))
        return sendRedirect(event, '/login?err=invalid-remember-me-token');

    const userIdToLogIn = (await getCache(token)) as number;
    const user = await models.User.findOne({ where: { id: userIdToLogIn } });
    await setUserSession(event, { user });

    return sendRedirect(event, '/');
})