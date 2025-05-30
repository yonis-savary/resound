import { spotifyApi } from '../api'
import models from '~/server/db/models'
import { Op, Sequelize } from 'sequelize'
import { artistSlug } from '~/helpers/slug'

export async function discoverArtist(artistName: string): Promise<string | null> {
  console.log(`Discovering artist with name ${artistName}`)

  const slug = artistSlug(artistName)

  const existingArtist = await models.Artist.findOne({
    where: { slug, api_id: { [Op.not]: Sequelize.literal('NULL') } }
  })


  if (existingArtist) {
    return null
  }

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