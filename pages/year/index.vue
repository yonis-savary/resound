<template>

    <div class="container flex flex-col gap-3">
        <h1 class="text-5xl">{{ year }}'s releases</h1>

        <AlbumList v-if="albums" :albums="albums"/>
    </div>

</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import type { Album } from '~/models/Album';

useHead({ title: 'Years' })
definePageMeta({middleware: ['authenticated']})

const albums = ref<Album[]>([])

const props = defineProps({
  year: {
    type: Number,
    required: true
  }
})

const loadYears = async () => {
    albums.value = await $fetch<Album[]>('/year/' + props.year + "/");
}

watch(()=>props.year, loadYears);
onMounted(loadYears)

</script>