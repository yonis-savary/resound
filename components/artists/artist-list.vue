<template>
    <div class="flex flex-grow-1 justify-between align-center mb-3">
        <h1 class="text-3xl">
            <slot name="title">Artists</slot>
        </h1>
        <label class="flex flex-row  items-center gap-3">
            Only in library
            <USwitch v-model="onlyArtistsInLibrary"/>
        </label>
    </div>
    <div class="flex flex-row gap-8">
        <ArtistAvatarLink v-for="artist in artistsToDisplay" :key="artist.id" :artist="artist"/>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useStorage } from '@vueuse/core';
import type { Artist } from '~/models/Artist';
import ArtistAvatarLink from './artist-avatar-link.vue';

const onlyArtistsInLibrary = useStorage('artist-list-only-in-library', true);

const artistsToDisplay = computed(()=>
    onlyArtistsInLibrary.value ? 
        artists.filter(x => x.exists_locally):
        artists
)

const {artists} = defineProps<{
    artists: Artist[]
}>()
</script>