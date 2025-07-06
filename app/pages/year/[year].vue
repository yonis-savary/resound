<template>
  <div class="container flex flex-col gap-8">
    <h1 class="text-5xl font-bold">{{ year }} releases</h1>
    <AlbumsAlbumList :albums="yearAlbums" />
  </div>
</template>

<script lang="ts" setup>
import type { Album } from '~/server/models/Album';

const route = useRoute()
const year = route.params.year
const yearAlbums = await $fetch<Album[]>('/api/year/' + year)

useHead({ title: year + ' year' })
</script>

<style>

</style>