<template>

    <div class="container flex flex-col gap-8">
        <h1 class="text-5xl">My Wishlist</h1>
        <div class="flex flex-row flex-wrap gap-3">
            <div v-for="album in wishlist" :key="album.album_album.id">
                <AlbumCoverLink :album="album.album_album"/>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import AlbumCoverLink from '~/components/albums/album-cover-link.vue';
import type { UserWishlist } from '~/models/UserWishlist';

useHead({ title: 'Wishlist' })

definePageMeta({middleware: ['authenticated']})

const wishlist = ref<UserWishlist[]>([])

;(async () => {
    wishlist.value = await $fetch<UserWishlist[]>('/api/wishlist/details')
})();

</script>