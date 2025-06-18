import { createReadStream, existsSync, fstat, fstatSync, readFile, readFileSync, statSync } from 'fs';
import { resolve } from 'path';
import models from "~/server/db/models";

export default defineEventHandler(async event => {
    const slug = event.context.params?.track
    if (!slug || !/^\d+$/.test(slug)) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Paramètre "track" invalide. Doit être un entier.',
        });
    }

    const track = await models.Track.findOne({ where: { id: slug } })
    if (!track || !track.path) {
        throw createError({
            statusCode: 404,
            statusMessage: 'Track not found',
        });
    }

    const path = track.path;
    if (!existsSync(path)) {
        throw createError({ statusCode: 500, statusMessage: 'File not found', });
    }

    const user = await getUserSession(event)
    if (user.user?.id)
        models.UserListening.create({
            user: user.user.id,
            track: track.id,
            playlist: (getQuery(event).playlist ?? null) as number|undefined
        })

    const fileSize = statSync(path).size;
    setHeader(event, 'Accept-Ranges', 'bytes');
    setHeader(event, 'Content-Length', fileSize);
    setHeader(event, 'Content-Range', `bytes 0-${fileSize}`)
    return sendStream(event, createReadStream(path));
})