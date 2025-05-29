<template>

    <div class="container flex flex-col gap-8">
        <h1 class="text-5xl">Search</h1>
        <div class="flex flex-col gap-3">
            <UInput v-model="searchObjectRaw" placeholder="Search any album, artist, track..." />
        </div>
        <UTabs v-model="tabSelection" :items="tabItems" class="w-full">
            <template #content="{item}">
                <div v-if="item.label === 'Resound'">
                    <div v-if="resoundSearchResults" class="flex flex-col gap-9">
                        <div v-if="resoundSearchResults.artists.length > 0" class="flex flex-col gap-6">
                            <ArtistList :artists="resoundSearchResults.artists" />
                            <hr>
                        </div>
                        <div v-if="resoundSearchResults.albums.length > 0" class="flex flex-col gap-6">
                            <AlbumList :albums="resoundSearchResults.albums" />
                            <hr>
                        </div>
                        <div v-if="resoundSearchResults.tracks.length > 0" class="flex flex-col gap-6">
                            <div class="max-h-100 overflow-auto">
                                <Tracklist :tracks="resoundSearchResults.tracks" @track-clicked="playResoundSearchResults" />
                            </div>
                        </div>
                        <small>Results from Resound</small>
                    </div>
                </div>
                <div v-if="item.label === 'Spotify'">
    
                    <div v-if="spotifySearchResults" class="flex flex-col gap-9">
    
                        <div v-if="spotifySearchResults.artists?.items.length" class="flex flex-col gap-9" >
                            <h1 class="text-3xl">Artists</h1>
                            <div class="flex flex-row flex-wrap gap-9">
                                <div v-for="artist in spotifySearchResults.artists.items" :key="artist.id">
        
                                    <div
                                        class="artist-cover-link-container"
                                        @click="importArtist(artist)"
                                    >
                                        <img
                                            :src="artist.images.length ? artist.images[0].url : '/api/artist/default-picture'"
                                            alt="Avatar"
                                            style="width: 8em; height: 8em"
                                            class="rounded-full object-cover"
                                        >
                                        <span class="font-medium artist-name">{{ artist.name }}</span>
                                    </div>
    
                                </div>
                            </div>
                        </div>
    
                        <div v-if="spotifySearchResults.albums?.items.length" class="flex flex-col gap-9">
                            <h1 class="text-3xl">Albums</h1>
                            <div class="flex flex-row flex-wrap gap-9">
                                <div v-for="album in spotifySearchResults.albums.items" :key="album.id">
    
                                    <div
                                        class="artist-cover-link-container"
                                        @click="importAlbum(album)"
                                    >
                                        <img
                                            style="width: 8em; height: 8em"
                                            class="album-cover-link"
                                            :src="album.images.length ? album.images[0].url : '/api/artist/default-picture'"
                                        >
                                        <span class="font-medium artist-name">{{ album.name }}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <small>Results from Spotify</small>
                </div>
            </template>
        </UTabs>
    </div>
</template>



<script setup lang="ts">
import { useDebounce } from '@vueuse/core';
import { ref, watch } from 'vue';
import AlbumList from '~/components/albums/album-list.vue';
import ArtistList from '~/components/artists/artist-list.vue';
import Tracklist from '~/components/tracks/tracklist.vue';
import type { Album } from '~/models/Album';
import type { Artist } from '~/models/Artist';
import type { Track } from '~/models/Track';
import type { SearchResponse, Artist as SpotifyArtist, AlbumsItem as SpotifyAlbum } from '~/server/integrations/spotify/responses/SearchResponse';

useHead({ title: 'Search' })

definePageMeta({middleware: ['authenticated']})

const player = usePlayerStore();

const tabSelection = ref()
const searchObjectRaw = ref('')
const searchObject = useDebounce(searchObjectRaw, 500);

type ResoundSearchResultsType = {
    albums: Album[],
    artists: Artist[],
    tracks: Track[],
};

const resoundSearchResults = ref<ResoundSearchResultsType>();
const spotifySearchResults = ref<SearchResponse>()


const tabItems = [
    {
        label: 'Resound',
        
    },
    {
        label: 'Spotify'
    }
]

const playResoundSearchResults = (index: number, tracks: Track[]) => {
    player.changeTracklist(tracks, index)
}

const launchResoundSearch = async ()=>{
    resoundSearchResults.value = (await $fetch('/api/search/all', {params:{ q: searchObjectRaw.value}}));
};
const launchSpotifySearch = async ()=>{
    spotifySearchResults.value = (await $fetch('/api/search/spotify', {params:{ q: searchObjectRaw.value}}));
};
const importArtist = async (artistToImport: SpotifyArtist) => {
    const artist = (await $fetch<Artist>('/api/import/artist', {params: {artist: artistToImport.id}}));
    navigateTo('/artist/' + artist.id)
};
const importAlbum = async (albumToImport: SpotifyAlbum) => {
    const album = (await $fetch<Album>('/api/import/album', {params: {album: albumToImport.id}}));
    navigateTo('/album/' + album.id)
};

const launchSearch = ()=>{
    if (searchObjectRaw.value.length < 2)
        return;

    switch (tabItems[tabSelection.value ?? 0].label as string)
    {
        case 'Resound':
            launchResoundSearch()
            break;
        case 'Spotify':
            launchSpotifySearch()
            break;
    }
};

watch(searchObject, launchSearch);
watch(tabSelection, launchSearch);

</script>

<style scoped>

:deep(img) {
    object-fit: cover;
}

.artist-cover-link-container
{
    width: 8em;
    display: flex;
    flex-direction: column;
    gap: .25em;
    align-items: flex-start;
    cursor: pointer;
}


.artist-name
{
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: min-content;
}

</style>