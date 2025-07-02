<template>
    <NuxtLink class="underline" :to="'/year/' + year">{{ year }}</NuxtLink>
</template>

<script setup lang="ts">

import { computed } from 'vue';


const year = computed(() => {
    return (new Date(date)).getFullYear()
}
)

const { date } = defineProps({
    date: {
        type: String,
        required: true
    }
});

</script>