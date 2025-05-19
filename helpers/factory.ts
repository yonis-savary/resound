import models from "~/server/db/models";
import { albumSlug, artistSlug } from "./slug";

export async function createArtist(name: string)
{
    const [artist, _] = await models.Artist.upsert({
        slug: artistSlug(name),
        name: name
    }, { conflictFields: ['slug'] });
    return artist;
}

export async function createAlbum(artist: string, album: string)
{
    const [albumObject, __] = await models.Album.upsert({
        slug: artistSlug(artist) + albumSlug(album),
        name: album,
        type: 'album'
    }, { conflictFields: ['slug'] });

    return albumObject
}

