export default defineEventHandler(async (event) => {
    await clearUserSession(event)

    const rememberMe = getCookie(event, 'remember_token');
    if (rememberMe)
    {
        const storage = useStorage('cache');
        if (await storage.hasItem(rememberMe))
            await storage.removeItem(rememberMe)
    }

    return sendRedirect(event, '/login');
})