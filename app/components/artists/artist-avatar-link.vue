<template>
    <NuxtLink 
        class="artist-cover-link-container"
        :to="'/artist/' + artist.id"
    >
        <ArtistAvatar :artist="artist" :size="size"/>
        <span v-if="showTitle" class="font-medium artist-name">{{ artist.name }}</span>
    </NuxtLink>
</template>


<script setup lang="ts">
import type { PropType } from 'vue';
import type { Artist } from '~/server/models/Artist';
import ArtistAvatar from './artist-avatar.vue';

type CoverSize = 'small' | 'medium' | 'big';

const { artist, showTitle, size } = defineProps({
    artist: {
        type: Object as PropType<Artist>,
        required: true
    },
    showTitle: {
        type: Boolean,
        default: true
    },
    size: {
        type: String as PropType<CoverSize>,
        default: 'medium'
    }
});

</script>
<style scoped>

.artist-cover-link-container
{
    display: flex;
    flex-direction: column;
    gap: .25em;
    align-items: center;
    cursor: pointer;
}

.artist-cover-link
{
    width: 100%;
    aspect-ratio: 1/1;
    object-fit: cover;
    border-radius: 8px;
}

.artist-name
{
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: min-content;
}

.small  { width: 3em !important }
.medium { width: 8em !important }
.big    { width: 10em !important; height: 10em !important }

</style>