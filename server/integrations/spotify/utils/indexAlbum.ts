import models from "~/server/db/models"
import type { Image, Item } from "../responses/GetAlbumResponse";
import { Vibrant } from 'node-vibrant/node'
import { spotifyApi } from "../api";
import { albumSlug } from '~/helpers/slug'
import { createAlbum, createArtist } from "~/helpers/factory";
import type { Album, AlbumAttributes } from "~/models/Album";

async function syncAlbumGenres(albumId: number, genres: string[]) {
  if (!genres.length)
    return;

  await models.AlbumGenre.destroy({ where: { album: albumId } })

  for (const genreName of genres) {
    const [genre] = await models.Genre.findOrCreate({
      where: { name: genreName.toLowerCase() }
    })

    await models.AlbumGenre.create({ album: albumId, genre: genre.id })
  }
}

async function downloadBestImage(albumApiId: string, images: Image[]): Promise<{ path: string, color: string } | null> {

  if (!images.length) return null

  try {
    // Trouve l'image avec la meilleure résolution
    const bestImage = images.reduce((best, current) => {
      const currentRes = current.width * current.height
      const bestRes = best.width * best.height
      return currentRes > bestRes ? current : best
    })

    const response = await fetch(bestImage.url)
    const image = Buffer.from(await response.arrayBuffer())

    const filepath = `album-image-${albumApiId}.jpg`
    useStorage('data').setItemRaw(filepath, image)

    // Extrait les couleurs avec Vibrant
    const palette = await Vibrant.from(image).getPalette()

    // Utilise la couleur Vibrant ou DarkVibrant comme couleur d'accentuation
    const accentColor = palette.Vibrant || palette.DarkVibrant
    const color = accentColor ? accentColor.hex : '#000000'

    return { path: filepath, color: color }
  } catch (err) {
    console.error('Error downloading image:', err)
    return null
  }
}

async function indexTrack(albumId: number, trackData: Item, albumSlugString: string) {
  try {

    const trackSlug = albumSlugString + albumSlug(trackData.name) 
    const [track] = await models.Track.findOrCreate({
      where: {
        album: albumId,
        name: trackData.name,
        slug: trackSlug
      }
    })

    if (trackData.artists.length)
      await models.TrackArtist.destroy({ where: { track: track.id } })

    for (const artist of trackData.artists) {
      const artistRecord = await createArtist(artist.name)
      await models.TrackArtist.create({ track: track.id, artist: artistRecord.id })
    }

    await track.update({
      api_id: trackData.id,
      disc_number: trackData.disc_number,
      duration_milliseconds: trackData.duration_ms,
      explicit: trackData.explicit,
      position: trackData.track_number
    })

  } catch (err) {
    console.error('Error indexing track:', err)
    console.error('Album:', albumId)
  }
}

export async function indexAlbum(albumId: string, forceUpdate = false): Promise<Album|null> {
  let album = await models.Album.findOne({ where: { api_id: albumId } })

  if (!forceUpdate && album?.last_update) {
    const lastUpdate = new Date(album.last_update)
    const daysSinceUpdate = (Date.now() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24)

    if (daysSinceUpdate < 31) {
      return null
    }
  }

  const spotifyAlbum = await spotifyApi.getAlbum(albumId)

  if (!album)
    album = await createAlbum(spotifyAlbum.artists[0].name, spotifyAlbum.name);

  await syncAlbumGenres(album.id, spotifyAlbum.genres)

  const data: Partial<AlbumAttributes> = {
    last_update: new Date(),
    release_date: spotifyAlbum.release_date ? spotifyAlbum.release_date.toString() : undefined,
    name: spotifyAlbum.name,
    url: spotifyAlbum.external_urls.spotify
  }
  const imageResult = await downloadBestImage(albumId, spotifyAlbum.images)
  if (imageResult) {
    data.picture_path = imageResult.path
    data.color = imageResult.color
  }

  await album.update(data)

  for (const artist of spotifyAlbum.artists) {
    const artistRecord = await createArtist(artist.name)

    await models.AlbumArtist.findOrCreate({
      where: {
        album: album.id,
        artist: artistRecord.id
      }
    })
  }

  for (const track of spotifyAlbum.tracks.items) {
    await indexTrack(album.id, track, album.slug)
  }

  return album
}