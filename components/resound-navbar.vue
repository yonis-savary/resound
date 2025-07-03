<template>
    <UNavigationMenu :items="items" />
</template>

<script setup lang="ts">
import { ref } from 'vue';

const items = ref([
    { label: "Home", to: "/" },
    { label: "Albums", to: "/album" },
    { label: "Artists", to: "/artist" },
    { label: "Genres", to: "/genre" },
    { label: "Search", to: "/search" },
    { label: "Wishlist", to: "/wishlist" },
    { label: "Settings", to: "/settings" },
    { label: "Add Music", to: "/add-music" },
    { label: "Logout", to: "/api/logout" },
    // { href: "/playlist", name: "Playlists" },
    // { href: "/web", name: "Web" },
]);

</script>

<style scoped>

:deep(.group)
{
    color: red !important;
}

</style>
