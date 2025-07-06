import { spotifyApi } from '../api'
import models from '~/server/db/models'
import type { Image } from '../responses/GetArtistResponse'
import { createArtist } from '~/server/helpers/factory'
import { artistSlug } from '~/server/helpers/slug'
import type { Artist } from '~/server/models/Artist'

async function downloadBestImage(artistAPIId: string, images: Image[]): Promise<string | undefined> {
  if (!images.length) return undefined

  try {
    const bestImage = images.reduce((best, current) => {
      const currentRes = current.width * current.height
      const bestRes = best.width * best.height
      return currentRes > bestRes ? current : best
    })

    const response = await fetch(bestImage.url)
    const buffer = await response.arrayBuffer()

    const filename = `artist-image-${artistAPIId}.jpg`

    useStorage('data').setItemRaw(filename, Buffer.from(buffer));

    return filename

  } catch (err) {
    console.error('Error downloading image:', err)
    return undefined
  }
}

export async function indexArtist(
  artistAPIId: string,
  forceUpdate = false
): Promise<Artist|null> {
  console.info(`Indexing artist (id) ${artistAPIId}`)

  let artist = await models.Artist.findOne({ where: { api_id: artistAPIId } })

  if (!forceUpdate && artist?.last_update) {
    const lastUpdate = new Date(artist.last_update)
    const daysSinceUpdate = (Date.now() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24)

    if (daysSinceUpdate < 31) {
      console.info('Artist updated too recently')
      return null;
    }
  }

  try {
    // Récupère les données Spotify
    const spotifyArtist = await spotifyApi.getArtist(artistAPIId)

    // Crée ou met à jour l'artiste
    if (!artist) {
      artist = await createArtist(spotifyArtist.name);
    }
    artist.update({
      api_id: artistAPIId,
      url: spotifyArtist.external_urls?.spotify,
      slug: artistSlug(spotifyArtist.name)
    })

    // Télécharge la nouvelle image si disponible
    const newPicturePath = spotifyArtist.images?.length
      ? await downloadBestImage(artistAPIId, spotifyArtist.images)
      : undefined

    // Met à jour l'artiste
    await artist.update({
      name: spotifyArtist.name,
      url: spotifyArtist.external_urls?.spotify,
      picture_path: newPicturePath,
      last_update: new Date()
    })

    return artist

  } catch (err) {
    console.error('Error indexing artist:', err)
    return null
  }
}