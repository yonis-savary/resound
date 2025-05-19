<template>
    <div class="container flex flex-col gap-8">
        <h1 class="text-5xl">Albums</h1>
        <div class="flex flex-row flex-wrap gap-3">
            <div v-for="album in albums" :key="album.id">
                <AlbumsAlbumCoverLink :album="album"/>
            </div>
        </div>
    </div>

</template>


<script setup lang="ts">
import { onMounted, ref } from 'vue';
import type { Album } from '~/models/Album';

definePageMeta({middleware: ['authenticated']})


const albums = ref<Album[]>([]);

onMounted(async ()=>{
    albums.value = (await $fetch<Album[]>('/api/album'))
        .sort((a: Album, b: Album) => (a.album_artists?.[0].artist_artist?.name ?? '?') > (b.album_artists?.[0].artist_artist?.name ?? '?') ? 1:-1 );
});

</script>