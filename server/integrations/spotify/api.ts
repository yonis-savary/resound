import type { GetAlbumResponse } from "./responses/GetAlbumResponse"
import type { GetArtistAlbumsResponse } from "./responses/GetArtistAlbumsResponse"
import type { GetArtistResponse } from "./responses/GetArtistResponse"
import type { SearchArtistResponse } from "./responses/SearchArtistResponse"
import type { SearchResponse } from "./responses/SearchResponse"

interface SpotifyAPIConfig {
    clientId: string
    clientSecret: string
}

class SpotifyAPI {
    private config: SpotifyAPIConfig
    private baseUrl = 'https://api.spotify.com/v1/'

    constructor(config?: SpotifyAPIConfig) {
        this.config = config || {
            clientId: process.env.SPOTIFY_CLIENT_ID || '',
            clientSecret: process.env.SPOTIFY_CLIENT_SECRET || ''
        }
    }

    private async getAccessToken(): Promise<string> {
        const storage = useStorage()
        const cachedToken = await storage.getItem('spotify-access-token')

        if (cachedToken) {
            return cachedToken as string
        }

        console.info("Retrieving new access token")

        const authHeader = Buffer.from(`${this.config.clientId}:${this.config.clientSecret}`).toString('base64')

        const response = await fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': `Basic ${authHeader}`
            },
            body: new URLSearchParams({
                'grant_type': 'client_credentials'
            })
        })

        if (!response.ok) {
            console.error("Could not retrieve spotify access token")
            throw new Error("Could not retrieve spotify access token")
        }

        const data = await response.json()
        const accessToken = data.access_token
        const expiresIn = data.expires_in

        await storage.setItem('spotify-access-token', accessToken, {
            ttl: expiresIn
        })

        console.info(`Retrieved new access token for ${expiresIn} seconds`)
        return accessToken
    }

    private async request(endpoint: string, params = {}) {
        const token = await this.getAccessToken()
        const url = new URL(endpoint, this.baseUrl)

        Object.entries(params).forEach(([key, value]) => {
            url.searchParams.append(key, String(value))
        })

        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })

        if (!response.ok) {
            throw new Error(`Spotify API error: ${response.statusText}`)
        }

        return response.json()
    }

    async searchArtist(name: string): Promise<SearchArtistResponse> {
        return (await this.request('search', { type: 'artist', q: name })) as SearchArtistResponse
    }

    async getArtist(id: string): Promise<GetArtistResponse> {
        return (await this.request(`artists/${id}`)) as GetArtistResponse
    }

    async getArtistAlbums(artistId: string): Promise<GetArtistAlbumsResponse> {
        return (await this.request(`artists/${artistId}/albums`)) as GetArtistAlbumsResponse
    }

    async getAlbum(albumId: string) : Promise<GetAlbumResponse> {
        return (await this.request(`albums/${albumId}`)) as GetAlbumResponse
    }

    async search(object: string): Promise<SearchResponse> {
        return (await this.request('search', {
            q: object,
            type: 'album,artist',
            limit: 10
        })) as SearchResponse
    }
}

export const spotifyApi = new SpotifyAPI()