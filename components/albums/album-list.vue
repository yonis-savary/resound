<template>

    <div class="flex flex-row justify-between">
        <h1 class="text-3xl">
            <slot name="title">Albums</slot>
        </h1>
        <div class="flex flex-row align-center gap-5">
            <label class="flex flex-row items-center gap-3">
                Only in library
                <USwitch v-model="onlyInLibrary"/>
            </label>
            <label class="flex flex-row items-center gap-3">
                Show Singles
                <USwitch v-model="showSingles"/>
            </label>

        </div>
    </div>
    <div class="flex flex-row flex-wrap gap-3">
        <AlbumCoverLink v-for="album in albumToDisplay" :key="album.id" :album="album"/>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useStorage } from '@vueuse/core';
import AlbumCoverLink from './album-cover-link.vue';
import type { Album } from '~/models/Album';

const onlyInLibrary = useStorage('album-list-only-in-library', true);
const showSingles = useStorage('album-list-show-singles', false);

const sortByReleaseDate = (a: Album, b: Album) => {
    return (a.release_date ?? '0000-00-00') > (b.release_date ?? '0000-00-00') ? -1:1;
}

const albumToDisplay = computed(()=> {
    let albumsToShow = albums

    if (onlyInLibrary.value)
        albumsToShow = albumsToShow.filter(x => x.exists_locally)

    if (!showSingles.value)
        albumsToShow = albumsToShow.filter(x => x.type != "single")

    return albumsToShow.sort(sortByReleaseDate)
}
)

const {albums} = defineProps<{
    albums: Album[]
}>()
</script>