<template>
    <div v-if="album" class="container flex flex-col gap-3">
        <div class="flex flex-wrap gap-10 mb-5 flex-col items-center lg:flex-row  ">
            <AlbumCover v-if="album" size="big" :album="album" :support-inexistent="false" />
            <div class="flex flex-col lg:flex-row flex-grow-1">
                <div class="flex flex-col gap-3 flex-grow-1 mb-5">
                    <h1 class="text-3xl lg:text-5xl  font-bold">{{ album.name }}</h1>

                    <div class="flex flex-row lg:flex-col gap-3">
                        <ArtistLink v-for="artist in album.album_artists" :key="artist.artist_artist.id" :artist="artist.artist_artist"/>
                        <div v-if="album.album_genres?.length ?? false" class="flex flex-row align-center">
                            <GenreLink v-for="genre in album.album_genres" :key="genre.genre_genre.name" :genre="genre.genre_genre" />
                        </div>
                        <YearLink v-if="album?.release_date" :date="album.release_date"/>
                    </div>
                </div>

                <div class="flex flex-row items-center gap-5">
                    <AlbumWishlistButton :album="album" />
                    <UButton class="justify-center" :loading="apiUpdateIsLoading" severity="contrast" @click="startToUpdateFromApi">
                        {{ apiUpdateIsLoading ? 'This may take a minute' : 'Update from Spotify' }}
                    </UButton>
                </div>
            </div>
        </div>

        <Tracklist :tracks="album.tracks" :album="album" @track-clicked="handleTrackClicked" />
    </div>
</template>

<script setup lang="ts">
import AlbumCover from '~/app/components/albums/album-cover.vue'
import AlbumWishlistButton from '~/app/components/albums/album-wishlist-button.vue'
import ArtistLink from '~/app/components/artists/artist-link.vue'
import GenreLink from '~/app/components/genres/genre-link.vue'
import Tracklist from '~/app/components/tracks/tracklist.vue'
import YearLink from '~/app/components/years/year-link.vue'
import type { Album } from '~/server/models/Album'
import type { Track } from '~/server/models/Track'

definePageMeta({ middleware: ['authenticated'] })

const album = ref<Album>()
const { changeTracklist } = usePlayerStore()

const route = useRoute()

const loadAlbum = async () => {
    album.value = await $fetch<Album>('/api/album/' + route.params.album  + "/");

    useHead({ title: album.value.name })

    album.value.tracks.forEach(track => {
        if (album.value)
            track.album_album = album.value
    })

    if (album.value.tracks)
        album.value.tracks = album.value.tracks.sort((a, b) => {
            if (a.disc_number != b.disc_number)
                return (a.disc_number ?? 0) > (b.disc_number ?? 0) ? 1 : -1;

            return (a.position ?? 0) > (b.position ?? 0) ? 1 : -1
        })


}

onMounted(loadAlbum)

const handleTrackClicked = (index: number, tracks: Track[]) => {
    if (!album.value?.tracks)
        return;

    changeTracklist(tracks, index);
}

const apiUpdateIsLoading = ref(false);
const startToUpdateFromApi = async () => {
    if (!album.value)
        return;
    apiUpdateIsLoading.value = true;
    await $fetch(`/api/album/${album.value.id}/update-from-api`)
    apiUpdateIsLoading.value = false;
    loadAlbum();
}


</script>