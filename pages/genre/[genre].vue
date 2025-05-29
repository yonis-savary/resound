<template>
    <div v-if="genre" class="container flex flex-col gap-3">
        <AlbumList v-if="genre.album_genres?.length" :albums="genre.album_genres.map(x => x.album_album)" >
            <template #title>
                {{ formatedGenreName(genre.name) }} releases
            </template>
        </AlbumList>
        <div class="max-h-100 overflow-auto">
            <Tracklist v-if="genreTracks" :show-year="true" :tracks="genreTracks" @track-clicked="handleTrackListClick" />
        </div>
    </div>
</template>


<script setup lang="ts">
import AlbumList from '~/components/albums/album-list.vue';
import Tracklist from '~/components/tracks/tracklist.vue';
import type { Album } from '~/models/Album';
import type { Genre } from '~/models/Genre';
import type { Track } from '~/models/Track';

definePageMeta({middleware: ['authenticated']})

const route = useRoute();
const player = usePlayerStore();

const genre = ref<Genre>(await $fetch<Genre>('/api/genre/' + route.params.genre + "/"));

useHead({ title: genre.value.name })

const handleTrackListClick = (index: number, tracks: Track[]) => {
    if (!genreTracks.value)
        return;
    player.changeTracklist(tracks, index);
}

const genreTracks = computed(()=> {
    const albums = genre.value?.album_genres?.map(x => x.album_album)
        .sort((a: Album, b: Album) => (a.release_date ?? 0) > (b.release_date ?? 0) ? -1:1)
    ;


    albums.forEach(album => {
        album.tracks.forEach(track => track.album_album = album)
    })
    
    return albums.reduce(
        (acc: Track[], cur: Album)=> [
            ...acc,
            ...cur.tracks?.sort((a: Track, b: Track) => (a.position??0) > (b.position??0) ? 1:-1) ?? []
        ],
        []
    )
});


const formatedGenreName = (name: string) =>
    name.replace(/^\d+$/, (match) => match.toUpperCase())

</script>