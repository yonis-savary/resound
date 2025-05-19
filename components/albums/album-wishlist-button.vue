<template>
    <UButton v-if="wishes.isWished(album.id)" class="justify-center" icon="ic:baseline-bookmark" @click.stop="wishes.unwish(album.id)"/>
    <UButton v-else class="justify-center" icon="ic:baseline-bookmark-border" @click.stop="wishes.wish(album.id)"/>
</template>

<script setup lang="ts">
import { useWishListStore } from '../../stores/wishlist';
import { UButton } from '#components';
import type { Album } from '~/models/Album';

const wishes = useWishListStore();

const { album } = defineProps<{
    album: Album
}>()

</script>
<style scoped>

    .p-button
    {
        border-color: white !important;
        border: 1px solid white !important;
        color: white !important;
        background: transparent;
        padding: 0;
    }

    .p-button:hover
    {
        background: rgba(255,255,255,0.2) !important;
    }

</style>