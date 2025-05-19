#!/usr/bin/env ndoe
import { existsSync } from "fs";
import { parseFile } from "music-metadata"
import models from "../db/models";
import mime from "mime-to-extensions"
import { Vibrant } from 'node-vibrant/node'
import { createAlbum, createArtist } from "~/helpers/factory";
import { albumSlug, artistSlug } from "~/helpers/slug";

export default async function parseFileTags(file: string) {
    if (!existsSync(file))
        throw new Error(`Given file ${file} does not exists`);

    console.log(file);

    const metadata = await parseFile(file);

    if (!metadata.common.albumartist)
        return console.log('Could not parse file albumartist missing');
    if (!metadata.common.album)
        return console.log('Could not parse file album missing');
    if (!metadata.common.title)
        return console.log('Could not parse file album missing');

    const artist = await createArtist(metadata.common.albumartist);
    artist.update({exists_locally: true});

    const albumSlugString: string = artistSlug(metadata.common.albumartist) + albumSlug(metadata.common.album);


    let pictureName: string | undefined = undefined;
    const picture = metadata.common.picture?.at(0) ?? null;
    let albumColor = "#FFF";
    if (picture) {
        let format: string | false = mime.extension(picture.format)
        if (!format)
            format = 'jpg'

        pictureName = albumSlugString + '.' + format
        useStorage('data').setItemRaw(pictureName, picture.data)


        // Extrait les couleurs avec Vibrant
        const palette = await Vibrant.from(Buffer.from(picture.data)).getPalette()

        // Utilise la couleur Vibrant ou DarkVibrant comme couleur d'accentuation
        const accentColor = palette.Vibrant || palette.DarkVibrant
        albumColor = accentColor ? accentColor.hex : '#000000'

    }

    const album = await createAlbum(
        metadata.common.albumartist,
        metadata.common.album
    );

    album.update({
        release_date: new Date(metadata.common.year + "-01-01"),
        type: 'album',
        color: albumColor,
        exists_locally: true,
        picture_path: pictureName,
        addition_date: new Date
    });

    for (let genreName of (metadata.common.genre ?? [])) {
        genreName = genreName.toLowerCase();
        const [genre, ____] = await models.Genre.upsert({ name: genreName })
        models.AlbumGenre.upsert({ album: album.id, genre: genre.id })
    }
    
    models.AlbumArtist.upsert({ album: album.id, artist: artist.id })

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

    return { status: "OK" };
}