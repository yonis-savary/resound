export default defineEventHandler(async (event) => {
    const user = await getUserSession(event)

    if (!user.user)
        return null;

    const key = user.user.id ?? null;
    if (!key)
        return null;

    const storage = useStorage('data/player-state');

    if (! await storage.hasItem(key))
        return null;

    try 
    {
        return await storage.getItem(key);
    }
    catch (err)
    {
        console.error(err)
        return createError({statusCode: 500, statusMessage: 'Could not save playlist'});
    }
})