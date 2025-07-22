<template>
    <div
        :class="size"
        class="album-cover-link-container"
    >
        <NuxtLink :to="'/album/' + album.id">
            <AlbumCover :album="album" :size="size" :support-inexistent="true"/>
        </NuxtLink>
        <div v-if="showTitle" class="flex flex-col gap-0">
            <NuxtLink :to="'/album/' + album.id" class="font-medium album-name">{{ album.name }} {{ album.type == "single" ? "(Single)": "" }}</NuxtLink>
            <NuxtLink 
                v-for="artist in album.album_artists" 
                :key="artist.artist_artist.id" class="opacity-50 font-medium"
                :to="'/artist/' + artist.artist_artist.id"
            > {{ artist.artist_artist.name  }} </NuxtLink>
        </div>
    </div>
</template>

<script setup lang="ts">
import type { PropType } from 'vue';
import type { Album } from '~/server/models/Album';
import AlbumCover from './album-cover.vue';

type CoverSize = 'small' | 'medium' | 'medium-big' | 'big';

const { album, showTitle, size } = defineProps({
    album: {
        type: Object as PropType<Album>,
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

.album-cover-link-container
{
    display: flex;
    flex-direction: column;
    gap: .25em;
    align-items: flex-start;
    cursor: pointer;
}

.album-cover-link
{
    width: 100%;
    aspect-ratio: 1/1;
    object-fit: cover;
    border-radius: 8px;
}

.album-name
{
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: min-content;
}

.small  { 
    width: 3em !important ;
    min-width: 3em !important ;
}
.medium { 
    width: 8em !important ;
    min-width: 8em !important ;
}
.medium-big { 
    width: 10em !important ;
    min-width: 10em !important ;
}
.big    { 
    width: 14em !important ;
    min-width: 14em !important ;
}

@media only screen and (max-width: 500px) {
    .small {
        display: none;
    }
}


a 
{
    line-height: 1.2em;
}
</style>