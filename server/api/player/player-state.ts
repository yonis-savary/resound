export default defineEventHandler(async event => {
    const user = await getUserSession(event)
    const userId = user.user?.id;
    const storage = useStorage('data/states');

    if (await storage.hasItem(userId))
        return JSON.parse(await storage.getItem(userId))

    return {}
})