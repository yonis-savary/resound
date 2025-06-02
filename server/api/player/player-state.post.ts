import { z } from "zod"

const bodySchema = z.object({
    index: z.number(),
    currentTime: z.number()
})

export default defineEventHandler(async (event) => {
    const body = await readValidatedBody(event, bodySchema.parse)
    const user = await getUserSession(event)
    const key = user.user?.id ?? null;

    if (!key)
        return createError({statusCode: 400, statusMessage: 'Could not resolve cache key'});

    const storage = useStorage('data/player-state');

    try 
    {
        storage.setItem(key, body);
    }
    catch (err)
    {
        console.error(err)
        return createError({statusCode: 500, statusMessage: 'Could not save playlist'});
    }

    return { status: "OK" };
})