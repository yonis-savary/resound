import { spotifyApi } from '../api'
import models from '~/server/db/models'
import { artistSlug } from '~/server/helpers/slug'

export async function discoverArtist(artistName: string): Promise<string | null> {

  const slug = artistSlug(artistName)

  const existingArtist = await models.Artist.findOne({
    where: { slug }
  })


  if ((!existingArtist) || existingArtist?.api_id) {
    return null
  }

  if (existingArtist.last_update)
  {
    const lastUpdate = new Date(existingArtist.last_update)
    const daysSinceUpdate = (Date.now() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24)
  
    if (daysSinceUpdate < 31) {
      console.info('Artist updated too recently')
      return null;
    }
  }

  console.log(`Discovering artist with name ${artistName}`)
  console.info(`Indexing artist (name) ${artistName}`)

  try {
    const results = await spotifyApi.searchArtist(artistName)

    if (!results.artists?.items?.length) {
      console.info(`No artist found for ${artistName}`)
      return null
    }

    const bestMatch = results.artists.items[0]

    // Vérifie si le nom correspond bien
    if (artistSlug(bestMatch.name) !== artistSlug(artistName)) {
      console.info(`Best match for ${artistName} is ${bestMatch.name}, skipping`)

      existingArtist.update({last_update: new Date});
      return null
    }

    // Met à jour l'artiste avec l'ID Spotify
    await models.Artist.update(
      { api_id: bestMatch.id },
      { where: { slug } }
    )

    return bestMatch.id

  } catch (err) {
    console.error('Error discovering artist:', err)
    return null
  }
}