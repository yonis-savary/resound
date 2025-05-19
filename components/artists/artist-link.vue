<template>
    <NuxtLink class="underline flex flex-row gap-3 align-items-center" :to="'/artist/' + artist.id">
        <ArtistAvatar :artist="artist" />
        <span>{{ artist.name }}</span>
    </NuxtLink>
</template>

<script setup lang="ts">
import type { PropType } from 'vue';
import type { Artist } from '~/models/Artist';
import ArtistAvatar from './artist-avatar.vue';

const { artist } = defineProps({
    artist: {
        required: true,
        type: Object as PropType<Artist>
    }
})

</script>