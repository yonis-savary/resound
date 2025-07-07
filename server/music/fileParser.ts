#!/usr/bin/env ndoe
import { existsSync, statSync } from "fs";
import type { Stats } from "fs";
import { parseFile } from "music-metadata"
import type { IAudioMetadata } from "music-metadata"
import models from "../db/models";
import mime from "mime-to-extensions"
import { Vibrant } from 'node-vibrant/node'
import { createAlbum, createArtist } from "~/server/helpers/factory";
import { trackSlug } from "~/server/helpers/slug";
import type { Album } from "~/server/models/Album";
import type { Artist } from "~/server/models/Artist";
import type { Track } from "~/server/models/Track";
import sharp from "sharp"

let lastAlbumName: string | undefined = undefined;
let lastAlbumObject: Album | undefined = undefined;
let lastArtistName: string | undefined = undefined;
let lastArtistObject: Artist | undefined = undefined;

const getArtist = async (metadata: IAudioMetadata): Promise<Artist> => {

    const artistName = metadata.common.albumartist ?? metadata.common.artist ?? null

    if (lastArtistName === artistName && lastArtistObject)
        return lastArtistObject;

    if (!artistName)
        throw new Error('This function needs a valid metadata object (common.albumartist is missing)');

    const artist = await createArtist(artistName);
    artist.update({ exists_locally: true });

    lastArtistName = artistName
    lastArtistObject = artist;
    return artist;
}

async function convertWebPtoPNG(imageData: Buffer<ArrayBuffer>): Promise<Buffer<ArrayBuffer>> {
    return Buffer.from(await sharp(imageData).png().toBuffer());
}

const getPicturePath = async (album: Album, metadata: IAudioMetadata) => {

    let pictureName: string | undefined = undefined;
    const picture = metadata.common.picture?.at(0) ?? null;
    let albumColor = "#FFF";
    if (picture) {
        let format: string | false = mime.extension(picture.format)
        if (!format)
            format = 'jpg'

        pictureName = album.slug + '.' + format
        useStorage('data').setItemRaw(pictureName, picture.data)


        let imageBufferData = Buffer.from(picture.data);
        if (format === 'webp') {
            console.log('Convert webp to png')
            imageBufferData = await convertWebPtoPNG(Buffer.from(picture.data));
        }

        // Extrait les couleurs avec Vibrant
        const palette = await Vibrant.from(imageBufferData).getPalette()

        // Utilise la couleur Vibrant ou DarkVibrant comme couleur d'accentuation
        const accentColor = palette.Vibrant || palette.DarkVibrant
        albumColor = accentColor ? accentColor.hex : '#000000'

    }

    album.update({
        color: albumColor,
        picture_path: pictureName,
    });
}


const getAlbum = async (stats: Stats, artist: Artist, metadata: IAudioMetadata): Promise<Album> => {
    const albumName = metadata.common.album ?? undefined

    if (!albumName)
        throw new Error('This function needs a valid metadata object (common.album is missing)');

    if (lastAlbumName === albumName && lastAlbumObject)
        return lastAlbumObject;

    const album = await createAlbum(
        artist.name,
        albumName
    );

    album.update({
        release_date: metadata.common.year + "-01-01",
        type: 'album',
        exists_locally: true,
        addition_date: stats.mtime
    });

    for (let genreName of (metadata.common.genre ?? [])) {
        genreName = genreName.toLowerCase();
        const [genre, ____] = await models.Genre.upsert({ name: genreName })
        models.AlbumGenre.upsert({ album: album.id, genre: genre.id })
    }

    models.AlbumArtist.upsert({ album: album.id, artist: artist.id })

    await getPicturePath(album, metadata);

    lastAlbumName = albumName
    lastAlbumObject = album;
    return album;
}

export default async function parseFileTags(
    file: string,
    album: Album | null,
    artist: Artist | null
): Promise<{ track: Track, album: Album, artist: Artist }> {
    if (!existsSync(file))
        throw new Error(`Given file ${file} does not exists`);

    const metadata = await parseFile(file);

    const artistName = metadata.common.albumartist ?? metadata.common.artist ?? null;

    const stat = statSync(file);

    if (!artistName)
        throw new Error('Could not parse file albumartist missing');
    if (!metadata.common.album)
        throw new Error('Could not parse file album missing');
    if (!metadata.common.title)
        throw new Error('Could not parse file album missing');

    if (!(artist && artist.name === artistName))
        artist = await getArtist(metadata);

    if (!(album && album.name === metadata.common.album))
        album = await getAlbum(stat, artist, metadata)

    const [track, ___] = await models.Track.upsert({
        slug: album.slug + trackSlug(metadata.common.title),
        album: album.id,
        discovery_date: stat.mtime,
        position: metadata.common.track.no ?? undefined,
        disc_number: metadata.common.disk.no ?? 1,
        duration_milliseconds: Math.floor((metadata.format.duration ?? 0) * 1000),
        name: metadata.common.title,
        path: file
    }, { conflictFields: ['slug'] });

    models.TrackArtist.upsert({ track: track.id, artist: artist.id })

    return { track, album, artist };
}