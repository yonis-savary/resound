#!/usr/bin/env ndoe
import { existsSync, mkdirSync, writeFileSync } from "fs";
import { getSupportedMimeTypes, parseBlob } from "music-metadata"
import parseFileTags from "./fileParser";
import path from "path";
import mime from "mime-to-extensions"

export default async function handleUpload(filename: string, blob: Blob) {
    const supportedMimeTypes = getSupportedMimeTypes();

    const fileMime = mime.lookup(filename);
    if (!supportedMimeTypes.includes(fileMime))
    {
        console.info("Unsupported mime type for " + filename);
        return;
    }
    const metadata = await parseBlob(blob);

    if (!metadata.common.albumartist)
        return console.log('Could not parse file albumartist missing');
    if (!metadata.common.album)
        return console.log('Could not parse file album missing');

    const artist = metadata.common.albumartist
    const album = metadata.common.album

    const libraryPath = process.env.LIBRARY_PATH;
    if (!libraryPath)
        throw new Error('Cannot resolve library path from .env');

    const fileDirectory = path.join(libraryPath, artist, album);
    const filePath = path.join(fileDirectory, filename);

    if (!existsSync(fileDirectory))
        mkdirSync(fileDirectory, {recursive: true});

    writeFileSync(filePath, Buffer.from(await blob.arrayBuffer()));

    parseFileTags(filePath, null, null)
}