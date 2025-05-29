<template>
    <div class="container flex flex-col gap-3">
        <h1 class="text-5xl">Artists</h1>
        <div class="flex flex-row flex-wrap gap-6">
            <ArtistsArtistAvatarLink v-for="artist in artists" :key="artist.id" :artist="artist"/>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { Artist } from '~/models/Artist';

definePageMeta({middleware: ['authenticated']})

useHead({ title: 'Artists' })

const artists = ref<Artist[]>([])

;(async () => {
    artists.value = await $fetch<Artist[]>('/api/artist', {params: {exists_locally: true}})
})();

</script>