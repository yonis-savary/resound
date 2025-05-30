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
        <UButton class="justify-center" @click="shuffleGenre(false)">Shuffle</UButton>
        <UButton class="justify-center" @click="shuffleGenre(true)">Shuffle Likes</UButton>
    </div>
</template>


<script setup lang="ts">
import { computed, type PropType } from 'vue';
import { usePlayerStore } from '../stores/player';
import {startShuffle, shuffleLibrary} from '~/stores/shuffle';
import type { Track } from '~/models/Track';

type ShuffleButtonType = 'tracks' | 'all' | 'genre';

const player = usePlayerStore();
const currentColor = computed(() => player.currentColor)

const likesOnlyOptions = (likesOnly: boolean = false) => (
    likesOnly ? {params: {likesOnly: true}}: {}
);

const shuffleGenre =  async (likesOnly: boolean = false) => {
    const data = await $fetch<Track[]>(`/api/shuffle/genre/` + genre, likesOnlyOptions(likesOnly));
    player.changeTracklist(data);
}

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
        type: Number,
        required: false,
        default: 0
    }
})

</script>
<style scoped>
    :root
    {
        --p-button-primary-color: v-bind(currentColor) !important;
    }
</style>