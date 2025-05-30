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

    const files = globSync('**/*', {cwd: libraryPath, nodir: true});

    console.info(`Exploring a library of ${files.length} files`);

    const workers: string[][] = [];
    let currentWorkerQueue: string[] = [];
    let currentDirectory: string|null = null

    const supportedMimeTypes = getSupportedMimeTypes();

    for (const file of files)
    {
        const fileMime = mime.lookup(file);
        if (!supportedMimeTypes.includes(fileMime))
        {
            console.info("Unsupported mime type for " + file);
            continue;
        }

        const thisDirectory = dirname(file)
        if (currentDirectory != thisDirectory)
        {
            if (currentWorkerQueue.length)
                workers.push(currentWorkerQueue);
            currentWorkerQueue = [file];
            currentDirectory = thisDirectory;
        }
        else
        {
            currentWorkerQueue.push(file);
        }
    }
    if (currentWorkerQueue.length)
        workers.push(currentWorkerQueue);


    let workerCount = 1;
    for (const worker of workers)
    {
        let fileCount = 1;
        for (const file of worker)
        {
            try
            {
                console.log(`[C${workerCount}/${workers.length}][F${fileCount}/${worker.length}] ${file}`)
                await parseFileTags(path.join(libraryPath, file), null, null);
            }
            catch (err)
            {
                console.error(err);
            }
            fileCount++
        }
        workerCount++;
    }

    /*
    await Promise.all(
        workers.map(async files => {
            let album : Album|null = null;
            let artist : Artist|null = null;

            for (const file of files)
            {
                try
                {
                    ({album, artist} = await parseFileTags(path.join(libraryPath, file), album, artist));
                }
                catch (err)
                {
                    console.error(err);
                }
            }
        })
    )
        */
}