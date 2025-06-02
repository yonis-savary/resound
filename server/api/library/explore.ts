import { globSync } from "glob";
import parseFileTags from "~/server/music/fileParser";
import path, { dirname } from 'path'
import type { Album } from "~/models/Album";
import type { Artist } from "~/models/Artist";
import { getSupportedMimeTypes } from "music-metadata";
import mime from "mime-to-extensions"

export default defineEventHandler(async () => {
    exploreLibrary();
    return { status: "OK" }
})


async function exploreLibrary()
{
    const libraryPath = process.env.LIBRARY_PATH;
    if (!libraryPath)
        throw new Error('Cannot resolve library path from .env');

    let files = globSync('**/*', {cwd: libraryPath, nodir: true});

    console.info(`Exploring a library of ${files.length} files`);

    const supportedMimeTypes = getSupportedMimeTypes();

    files = files.filter(file => {
        const fileMime = mime.lookup(file);
        return supportedMimeTypes.includes(fileMime);
    });

    let fileCount = 1;
    for (const file of files)
    {
        try
        {
            console.log(`[F${fileCount}/${files.length}}] ${file}`)
            await parseFileTags(path.join(libraryPath, file), null, null);
        }
        catch (err)
        {
            console.error(err);
        }
        fileCount++
    }

    console.log('OK');

    return { status: 'OK' };
}