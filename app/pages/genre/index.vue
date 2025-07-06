<template>
    <div class="container flex flex-col gap-3">
        <h1 class="text-5xl">Genres</h1>

        <div class="flex flex-row flex-wrap gap-8">
            <div v-for="genre in genres" :key="genre.id" class="flex flex-col gap-4 border-1 p-3">
                <div class="flex w-full flex-row justify-between">
                    <NuxtLink :to="'/genre/' + genre.id" class="text-3xl">
                        {{ formatedGenreName(genre.name) }}
                    </NuxtLink>
                </div>
                <div class="grid grid-cols-2 gap-4">
                    <AlbumCoverLink v-for="album in genre.album_genres" :key="album.id" :album="album.album_album" :show-title="false" :size="'small'" />
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import AlbumCoverLink from '~/app/components/albums/album-cover-link.vue';
import type { Genre } from '~/server/models/Genre';

definePageMeta({middleware: ['authenticated']})

const genres = ref<Genre[]>(await $fetch('/api/genre'))

useHead({ title: 'Genres' })

const formatedGenreName = (name: string) =>
    name.replace(/(?:^| |-)(\w)/, (match) => match.toUpperCase())

</script>