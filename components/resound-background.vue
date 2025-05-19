<template>
    <div class="page-background">
        <img
            v-if="currentTrack && currentTrack.album_album.id"
            class="page-image-background"
            :src="'/api/album/' + currentTrack.album_album.id + '/picture'"
        >
    </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { usePlayerStore } from '../stores/player';

const playerStore = usePlayerStore();
const { currentTrack }= storeToRefs(playerStore);

</script>

<style>

.page-image-background
{
    width: 160%;
    height: 160%;
    object-fit: cover;
    filter: brightness(40%) blur(12px);
}
</style>