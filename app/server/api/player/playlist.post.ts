import { existsSync, mkdirSync, writeFileSync } from "fs"
import path from "path"
import { z } from "zod"
import models from "~/server/db/models"

export default defineEventHandler(async event => {

    const body = await readBody(event)
    const schema = z.object({
        tracks: z.array(z.number().int().positive())
    })
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
        console.error(body);
        return createError({ statusCode: 400, statusMessage: 'Invalid request', data: parsed.error.flatten() })
    }
    
    const { tracks } = parsed.data
    if (!tracks.length)
        return {status: "OK"};

    const existingTracks = await models.Track.findAll({where: { id: tracks }})
    const foundIds = existingTracks.map(t => t.id)
    const missingIds = tracks.filter(id => !foundIds.includes(id))

    if (missingIds.length > 0) {
        console.error(`Tracks not found: ${missingIds.join(', ')}`)
        return createError({
            statusCode: 400,
            statusMessage: `Tracks not found: ${missingIds.join(', ')}`
        })
    }

    const user = await getUserSession(event)
    const key = user.user.id;
    const storage = useStorage('data/player');

    try 
    {
        storage.setItem(key, tracks);
    }
    catch (err)
    {
        console.error(err)
        return createError({statusCode: 500, statusMessage: 'Could not save playlist'});
    }

    return { status: "OK" };

})