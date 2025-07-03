<template>
    <button
        v-if="isLiked"
        :class="props.buttonClass" class="player-button"
        @click.stop="likes.unlike(props.track.id)"
    >
        <Icon name="ic:baseline-favorite" :size="props.size"/>
    </button>
    <button
        v-else
        :class="props.buttonClass" class="player-button"
        @click.stop="likes.like(props.track.id)"
    >
        <Icon name="ic:baseline-favorite-border" :size="props.size"/>
    </button>
</template>

<script setup lang="ts">
import type { PropType } from 'vue';
import type { Track } from '~/models/Track';
import { useLikesStore } from '~/stores/likes';

const likes = useLikesStore();

const isLiked = computed(() => likes.isLiked(props.track.id));

const props = defineProps({
    track: {
        type: Object as PropType<Track>,
        required: true
    },
    size: {
        type: Number,
        default: undefined
    },
    buttonClass: {
        type: String,
        default: ""
    }
})

</script>

<style scoped>
    .iconify {
        display: flex;
        justify-content: center;
        align-items: center;
    }
</style>