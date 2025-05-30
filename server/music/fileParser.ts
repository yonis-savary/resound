#!/usr/bin/env ndoe
import { existsSync } from "fs";
import { type IAudioMetadata, parseFile } from "music-metadata"
import models from "../db/models";
import mime from "mime-to-extensions"
import { Vibrant } from 'node-vibrant/node'
import { createAlbum, createArtist } from "~/helpers/factory";
import { artistSlug } from "~/helpers/slug";
import type { Album } from "~/models/Album";
import type { Artist } from "~/models/Artist";
import { Track } from "~/models/Track";

const getArtist = async (metadata: IAudioMetadata): Promise<Artist> => {

    if (!metadata.common.albumartist)
        throw new Error('This function needs a valid metadata object (common.albumartist is missing)');

    const artistName = metadata.common.albumartist;

    const artist = await createArtist(artistName);
    artist.update({exists_locally: true});

    return artist;
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


        // Extrait les couleurs avec Vibrant
        const palette = await Vibrant.from(Buffer.from(picture.data)).getPalette()

        // Utilise la couleur Vibrant ou DarkVibrant comme couleur d'accentuation
        const accentColor = palette.Vibrant || palette.DarkVibrant
        albumColor = accentColor ? accentColor.hex : '#000000'

    }

    album.update({
        color: albumColor,
        picture_path: pictureName,
    });
}


const getAlbum = async (artist: Artist, metadata: IAudioMetadata): Promise<Album> => {
    if (!metadata.common.album)
        throw new Error('This function needs a valid metadata object (common.album is missing)');

    const album = await createAlbum(
        artist.name,
        metadata.common.album
    );

    album.update({
        release_date: new Date(metadata.common.year + "-01-01"),
        type: 'album',
        exists_locally: true,
        addition_date: new Date
    });

    for (let genreName of (metadata.common.genre ?? [])) {
        genreName = genreName.toLowerCase();
        const [genre, ____] = await models.Genre.upsert({ name: genreName })
        models.AlbumGenre.upsert({ album: album.id, genre: genre.id })
    }

    models.AlbumArtist.upsert({ album: album.id, artist: artist.id })

    await getPicturePath(album, metadata);

    return album;
}

export default async function parseFileTags(
    file: string, 
    album: Album|null, 
    artist: Artist|null
): Promise<{track: Track, album: Album, artist: Artist}> {
    if (!existsSync(file))
        throw new Error(`Given file ${file} does not exists`);

    console.log(file);

    const metadata = await parseFile(file);

    if (!metadata.common.albumartist)
        throw new Error('Could not parse file albumartist missing');
    if (!metadata.common.album)
        throw new Error('Could not parse file album missing');
    if (!metadata.common.title)
        throw new Error('Could not parse file album missing');

    if (!(artist && artist.name === metadata.common.albumartist))
        artist = await getArtist(metadata);

    if (!(album && album.name === metadata.common.album))
        album = await getAlbum(artist, metadata)

    const [track, ___] = await models.Track.upsert({
        slug: artistSlug(metadata.common.title),
        album: album.id,
        discovery_date: new Date,
        position: metadata.common.track.no ?? undefined,
        disc_number: metadata.common.disk.no ?? 1,
        duration_milliseconds: Math.floor((metadata.format.duration ?? 0) *1000),
        name: metadata.common.title,
        path: file
    }, { conflictFields: ['slug'] });

    models.TrackArtist.upsert({ track: track.id, artist: artist.id })

    return { track, album, artist };
}