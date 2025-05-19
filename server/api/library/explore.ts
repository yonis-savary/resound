import { globSync } from "glob";
import parseFileTags from "~/server/music/fileParser";
import path, { dirname } from 'path'

export default defineEventHandler(async () => {
    await exploreLibrary();
    return { status: "OK" }
})


async function exploreLibrary()
{
    const libraryPath = process.env.LIBRARY_PATH;
    if (!libraryPath)
        throw new Error('Cannot resolve library path from .env');

    const files = globSync('**/*', {cwd: libraryPath, nodir: true});

    const workers: string[][] = [];
    let currentWorkerQueue: string[] = [];
    let currentDirectory: string|null = null

    for (const file of files)
    {
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

    await Promise.all(
        workers.map(async files => {
            for (const file of files)
                await parseFileTags(path.join(libraryPath, file));
        })
    )
}