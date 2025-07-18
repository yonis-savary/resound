<template>
    <div class="container flex flex-col gap-8">
        <h1 class="text-5xl">Home</h1>

        <div class="flex max-sm:flex-col min-sm:flex-row gap-6">
            <div class="flex flex-col gap-3 flex-1">
                <h1 class="text-2xl">Most listened genres</h1>
                <div class="grid grid-cols-2 gap-3">
                    <div 
                        v-for="genre of Object.keys(instantPlaylists)" 
                        :key="genre" 
                        :style="getGenreComputedStyle(genre)"
                        class="p-5 cursor-pointer rounded-md"
                        @click="startPlaylist(genre)"
                    >
                        <div class="text-2xl font-bold">{{ genre.toUpperCase() }}</div>
                    </div>
                </div>
            </div>
            <div class="flex flex-col gap-3 flex-1">
                <h1 class="text-2xl">Most listened Albums</h1>
                <div class="grid grid-cols-2 gap-3 place-items-center">
                    <NuxtLink v-for="album in mostListenedAlbums" :key="album.id" :to="'/album/' + album.id" class="w-full">
                        <img class="album-cover-home-link rounded-md" :src="`/api/album/${album.id}/picture?hash=${album.picture_path_hash}`">
                    </NuxtLink>
                </div>
            </div>
        </div>

        <h2 class="text-3xl">Last Additions</h2>
        <div v-if="lastAdditions" class="flex flex-row flex-wrap justify-center gap-3">
            <AlbumCoverLink v-for="album in lastAdditions" :key="album.id" :album="album"/>
        </div>


        <h2 class="text-3xl">Artists of the Day</h2>
        <div v-if="artistsOfTheDay" class="flex flex-row flex-wrap gap-3">
            <ArtistsArtistAvatarLink
                v-for="artist in artistsOfTheDay"
                :key="artist.id"
                size="big"
                :artist="artist"
            />
        </div>


    </div>

</template>


<script setup lang="ts">
import AlbumCoverLink from '~/app/components/albums/album-cover-link.vue';
import { getContrastText, stringToColorFriendly } from '~/server/helpers/lang';
import type { Album } from '~/server/models/Album';
import type { Artist } from '~/server/models/Artist';
import type { Track } from '~/server/models/Track';


const player = usePlayerStore();

useHead({ title: 'Resound Home' })

definePageMeta({middleware: ['authenticated']})

const mostListenedAlbums = ref<Album[]>([]);
const lastAdditions = ref<Album[]>([]);
const instantPlaylists = ref<{ [key: string]: Track[] }>({});
const artistsOfTheDay = ref<Artist[]>([]);

onMounted(async ()=>{
    const response = (await $fetch<{
        lastAdditions: Album[],
        mostListened: Album[],
        instantPlaylists: Record<string,Track[]>,
        artistsOfTheDay: Artist[]
    }>('/api/library/home'));

    lastAdditions.value = response.lastAdditions
    mostListenedAlbums.value = response.mostListened;
    instantPlaylists.value = response.instantPlaylists;
    artistsOfTheDay.value = response.artistsOfTheDay
});

const getGenreComputedStyle = (genre: string) => {
    const background = stringToColorFriendly(genre);
    return `background: ${background}; color: ${getContrastText(background)}`
};

const startPlaylist = (key: string) => {
    const tracks = instantPlaylists.value[key] ?? [];
    player.changeTracklist(tracks);
}

</script>

<style>

.album-cover-home-link
{
    width: 100%;
    max-height: 5em;
    object-fit: cover;
}
</style>