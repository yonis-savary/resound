<template>
    <div v-if="genre" class="container flex flex-col gap-3">
        <div class="ml-auto">
            <ShuffleButtons type="genre" :genre="genre.id"/>
        </div>
        <AlbumList v-if="genre.album_genres?.length" :albums="genre.album_genres.map(x => x.album_album)" >
            <template #title>
                {{ formatedGenreName(genre.name) }} releases
            </template>
        </AlbumList>
    </div>
</template>


<script setup lang="ts">
import AlbumList from '~/components/albums/album-list.vue';
import ShuffleButtons from '~/components/shuffle-buttons.vue';
import type { Genre } from '~/models/Genre';

definePageMeta({middleware: ['authenticated']})

const route = useRoute();

const genre = ref<Genre>(await $fetch<Genre>('/api/genre/' + route.params.genre + "/"));

useHead({ title: genre.value.name })

const formatedGenreName = (name: string) =>
    name.replace(/^\d+$/, (match) => match.toUpperCase()).toUpperCase()

</script>