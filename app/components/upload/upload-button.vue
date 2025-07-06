<template>
    <UButton class="justify-center" @click="openFileInput">Add files</UButton>
    <input ref="trueFileInput" type="file" multiple accept="audio/*" @change="emitFiles">
</template>


<script setup lang="ts">
import { UButton } from '#components';
import { templateRef } from '@vueuse/core';

const trueFileInput = templateRef('trueFileInput');

const emits = defineEmits<{
    (e: 'change', files: File[]): void
}>()

const emitFiles = (event: Event) => {
    if (!event.target)
        return;

    const target = event.target as HTMLInputElement;
    const files = target.files
    if (!files)
        return;

    emits('change', Array.from(files))
}

const openFileInput = ()=>{
    trueFileInput.value.click();
}

</script>

<style scoped>


input[type='file']
{
    display: none;
}

</style>
