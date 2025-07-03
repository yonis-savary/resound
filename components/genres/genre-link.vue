<template>
    <NuxtLink
        v-if="genre"
        class="underline"
        :to="'/genre/' + genre.id"
    >
        {{ formatedGenreName }}
    </NuxtLink>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { PropType } from 'vue';
import type { Genre } from '~/models/Genre';

const formatedGenreName = computed(() =>
    genre.name?.replace(/(?:^| |-)(\w)/, (match) => match.toUpperCase())
)

const { genre } = defineProps({
    genre: {
        type: Object as PropType<Genre>,
        required: true
    }
})

</script>