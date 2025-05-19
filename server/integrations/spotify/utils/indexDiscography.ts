import models from '~/server/db/models'
import { createAlbum } from '~/helpers/factory'
import { spotifyApi } from '../api'

export async function indexDiscography(
  artistApiId: string,
  forceUpdate = false
): Promise<boolean> {
  console.info(`Indexing artist (discography) api_id=${artistApiId}`)

  const artist = await models.Artist.findOne({
    where: { api_id: artistApiId }
  })

  if (!artist) {
    console.warn(`DISCOVERY BAD ARGUMENT COULD NOT FIND ARTIST WITH ID ${artistApiId}`)
    return false
  }

  if (!forceUpdate && artist.last_discography_update) {
    const lastUpdate = new Date(artist.last_discography_update)
    const daysSinceUpdate = (Date.now() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24)

    if (daysSinceUpdate < 31) {
      console.info('Artist discography updated too recently')
      return false
    }
  }

  try {
    await artist.update({ last_discography_update: new Date() })

    const discography = await spotifyApi.getArtistAlbums(artistApiId)

    for (const release of discography.items) {
      if (release.album_group === 'appears_on') continue

      try {
        const album = await createAlbum(artist.name, release.name);

        album.update({
          api_id: release.id,
          type: release.album_type,
          url: release.external_urls?.spotify,
          release_date: release.release_date ?? undefined,
        })

        // Crée l'association artiste-album
        await models.AlbumArtist.findOrCreate({
          where: {
            album: album.id,
            artist: artist.id
          }
        })

      } catch (err) {
        console.error(`Could not add ${release.name} release into database:`, err)
      }
    }

    return true

  } catch (err) {
    console.error('Error indexing discography:', err)
    return false
  }
}