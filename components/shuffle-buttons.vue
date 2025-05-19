<template>
    <div v-if="type == 'tracks'" class="flex flex-row gap-3">
        <UButton class="justify-center" @click="startShuffle(elements, false)">Shuffle</UButton>
        <UButton class="justify-center" @click="startShuffle(elements, true)">Shuffle Likes</UButton>
    </div>
    <div v-if="type == 'all'" class="flex flex-row gap-3">
        <UButton class="justify-center" @click="shuffleLibrary(false)">Shuffle</UButton>
        <UButton class="justify-center" @click="shuffleLibrary(true)">Shuffle Likes</UButton>
    </div>
</template>


<script setup lang="ts">
import { computed } from 'vue';
import { usePlayerStore } from '../stores/player';
import {startShuffle, shuffleLibrary} from '~/stores/shuffle';
import type { Track } from '~/models/Track';

type ShuffleButtonType = 'tracks' | 'all';

const player = usePlayerStore();
const currentColor = computed(() => player.currentColor)

const { type, elements } = defineProps<{
    type: ShuffleButtonType,
    elements: Track[]
}>()

</script>
<style scoped>
    :root
    {
        --p-button-primary-color: v-bind(currentColor) !important;
    }
</style>