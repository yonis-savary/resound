<template>
    <img
        :src="`/api/artist/${artist.id}/picture?hash=${artist.picture_path_hash}`"
        alt="Avatar"
        :class="size"
        class="rounded-full object-cover"
    >
</template>



<script setup lang="ts">
import type { PropType } from 'vue';
import type { Artist } from '~/server/models/Artist';

type CoverSize = 'small' | 'medium' | 'big';

defineProps({
    supportInexistent: {
        type: Boolean,
        default: true
    },
    artist: {
        type: Object as PropType<Artist>,
        required: true
    },
    size: {
        type: String as PropType<CoverSize>,
        default: 'small'
    }
})


defineEmits<{
    (e: "click", event: MouseEvent): void
}>();

</script>
<style scoped>

:deep(img) {
    object-fit: cover;
}

.small {
    width: 2em;
    height: 2em;
}
.medium {
    width: 4em;
    height: 4em;
}
.big {
    width: 10em;
    height: 10em;
}

</style>