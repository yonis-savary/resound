<template>
    <div class="container flex flex-col gap-8">
        <div class="flex flex-row justify-between items-center">
            <h1 class="text-5xl">Files to upload</h1>
            <UploadButton @change="handleFileUpload" />
        </div>
        <div class="flex flex-col flex-1 gap-2">
            <UploadFileSection v-for="file in filesToUpload" :key="file.name" :file="file" :disabled="locked" @delete="deleteFile"/>
        </div>
        <UButton v-if="filesToUpload.length && !locked" class="justify-center" @click="startToUpload">Upload files</UButton>
    </div>
</template>

<script setup lang="ts">

const filesToUpload: Ref<File[]> = ref([]);
const locked = ref(false);

const handleFileUpload = (files: File[]) =>{
    files = files.filter(toAdd =>
        filesToUpload.value.find(f => f.name === toAdd.name) === undefined
    )
    filesToUpload.value.push(...files);
}

const deleteFile = (toDelete: File) => {
    filesToUpload.value = filesToUpload.value.filter(f => f.name !== toDelete.name);
}

const startToUpload = async ()=>{
    locked.value = true;

    const fileCopy = Array.from(filesToUpload.value);
    console.info(fileCopy);

    for (const file of fileCopy)
    {
        const formData = new FormData()
        formData.append('file', file)
        await $fetch('/api/library/upload', {method: 'POST', body: formData})   ;
        filesToUpload.value = filesToUpload.value.filter(f => f.name !== file.name);
    }

    locked.value = false
}

</script>