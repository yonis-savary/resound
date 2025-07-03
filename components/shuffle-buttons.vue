<template>
    <div v-if="type == 'tracks' && elements" class="flex flex-row gap-3">
        <UButton class="justify-center" @click="startShuffle(elements, false)">Shuffle</UButton>
        <UButton class="justify-center" @click="startShuffle(elements, true)">Shuffle Likes</UButton>
    </div>
    <div v-if="type == 'all'" class="flex flex-row gap-3">
        <UButton class="justify-center" @click="shuffleLibrary(false)">Shuffle</UButton>
        <UButton class="justify-center" @click="shuffleLibrary(true)">Shuffle Likes</UButton>
    </div>
    <div v-if="type == 'genre'" class="flex flex-row gap-3">
        <UButton class="justify-center" @click="shuffleGenre(genre.name, false)">Shuffle</UButton>
        <UButton class="justify-center" @click="shuffleGenre(genre.name, true)">Shuffle Likes</UButton>
    </div>
</template>


<script setup lang="ts">
import { computed } from 'vue';
import type { PropType } from 'vue';
import { usePlayerStore } from '../stores/player';
import type { Track } from '~/models/Track';
import { useSuffleStore } from '~/stores/shuffle';
import type { Genre } from '~/models/Genre';

type ShuffleButtonType = 'tracks' | 'all' | 'genre';

const player = usePlayerStore();
const currentColor = computed(() => player.currentColor)

const {
    startShuffle,
    shuffleLibrary,
    shuffleGenre,
} = useSuffleStore();


const { type, elements, genre } = defineProps({
    type: {
        type: String as PropType<ShuffleButtonType>,
        required: true
    },
    elements: {
        type: Array as PropType<Track[]>,
        required: false,
        default : () => []
    },
    genre: {
        type: Object as PropType<Genre>,
        required: false,
        default: ()=>{}
    }
})

</script>
<style scoped>
    :root
    {
        --p-button-primary-color: v-bind(currentColor) !important;
    }
</style>