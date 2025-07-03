<template>
    <div class="p-3 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700 flex flex-row items-center gap-3">
        <Icon name="ic:baseline-music-note" size="30"/>
        <h1 class="text-xl text-center font-bold">{{ file.name }}</h1> 
        <span class="text-xl text-muted">{{ prettySize(file.size) }}</span>
        <div v-if="!disabled" class="ml-auto hover:bg-gray-800 transition cursor-pointer p-1 " @click="emitDelete">
            <Icon name="ic:baseline-close" size="30" />
        </div>
    </div>
</template>

<script setup lang="ts">



const emits = defineEmits<{
    (e: 'delete', file: File): void
}>()

const { file } = defineProps<{
    file: File,
    disabled: boolean
}>()

const prettySize = (bytes: number): string => {
    if (bytes > 1024**2)
        return (bytes / 1024**2).toPrecision(2) + "Mb"

    if (bytes > 1024)
        return (bytes / 1024).toPrecision(2) + "kb"

    return (bytes).toPrecision(2) + "b"
}

const emitDelete = ()=>{
    emits('delete', file)
}

</script>