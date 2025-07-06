<template>
    <img
        :class="[size, { 'inexistent': (supportInexistent && !album.exists_locally)}]"
        class="album-cover-link"
        :src="`/api/album/${album.id}/picture`"
        @click="handleClick"
    >
</template>



<script setup lang="ts">
import type { PropType } from 'vue';
import type { Album } from '~/server/models/Album';

type CoverSize = 'small' | 'medium' | 'medium-big' | 'big';

defineProps({
    supportInexistent: {
        type: Boolean,
        default: true
    },
    album: {
        type: Object as PropType<Album>,
        required: true
    },
    size: {
        type: String as PropType<CoverSize>,
        default: 'medium'
    }
})


const emit = defineEmits<{
    (e: "click", event: MouseEvent): void
}>();

const handleClick = (event: MouseEvent) => {
    emit('click', event)
}

</script>
<style scoped>

.inexistent:not(:hover)
{
    opacity: .5;
    filter: grayscale(50%);
}

.inexistent
{
    transition: all 200ms ease;
}

.album-cover-link
{
    width: 100%;
    aspect-ratio: 1/1;
    object-fit: cover;
    border-radius: 7%;
}

.small  { width: 3em !important }
.medium { width: 8em !important }
.medium-big { width: 10em !important }
.big    { width: 14em !important }

</style>