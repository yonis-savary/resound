import models from "~/server/db/models";

export default defineEventHandler(async event => {
    const token = event.context.params?.token ?? 'no-token';

    const storage = useStorage('cache');

    if (! await storage.hasItem(token))
        return sendRedirect(event, '/login?err=invalid-remember-me-token');

    const userIdToLogIn = (await storage.getItem(token)) as number;
    const user = await models.User.findOne({ where: { id: userIdToLogIn } });
    await setUserSession(event, { user });

    return sendRedirect(event, '/');
})