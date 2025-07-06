<template>
    <div class="container flex flex-col gap-8">
        <div class="flex flex-row justify-between items-center">
            <h1 class="text-5xl">Files to upload</h1>
            <UploadButton @change="handleFileUpload" />
        </div>
        <div class="flex flex-col flex-1 gap-2">
            <UploadFileSection v-for="file in filesToUpload" :key="file.file.name" :file="file" :disabled="locked" @delete="deleteFile"/>
        </div>
        <UButton v-if="filesToUpload.length && !locked" class="justify-center" @click="startToUpload">Upload files</UButton>
    </div>
</template>

<script setup lang="ts">
import { WorkerPool } from '~/app/helpers/Worker';
import type { UploadFileState } from '~/app/types/UploadFileState';


const filesToUpload: Ref<UploadFileState[]> = ref([]);
const locked = ref(false);
const chunkSize = 2 * 1024 * 1024 // 2MB
const toast = useToast();

useHead({ title: 'Add music' })

const workerPool = new WorkerPool(5);

const handleFileUpload = async (files: File[]) =>{
    files = files.filter(toAdd =>
        filesToUpload.value.find(f => f.file.name === toAdd.name) === undefined
    )
    filesToUpload.value.push(...files.map(file => ({
        file,
        sentChunk: 0,
        totalChunkCount: Math.ceil(file.size / chunkSize),
        status: 'pending',
        error: null
    }) as UploadFileState ));
}

const deleteFile = (toDelete: File) => {
    filesToUpload.value = filesToUpload.value.filter(f => f.file.name !== toDelete.name);
}

const startToUpload = async ()=>{
    locked.value = true;

    const fileCopy = Array.from(filesToUpload.value);

    await Promise.allSettled(fileCopy.map(file => uploadFileInChunks(file)))

    await workerPool.join()
    locked.value = false
}

async function uploadFileInChunks(fileData: UploadFileState) {
    const file = fileData.file;
    fileData.totalChunkCount = Math.ceil(file.size / chunkSize)

    fileData.status = 'uploading';

    const { token } = await $fetch<{token: string}>('/api/library/upload/initialize', {
        query: {fileName: file.name}
    });

    for (let i = 0; i < fileData.totalChunkCount; i++) {
        const start = i * chunkSize
        const end = Math.min(file.size, start + chunkSize)
        const chunk = file.slice(start, end)


        const formData = new FormData()
        formData.append('chunk', i.toString())
        formData.append('file', chunk)
        formData.append('token', token)

        workerPool.addJob(async ()=>{
            if (fileData.error)
                return;

            try
            {
                await $fetch("/api/library/upload/chunk", {method: 'POST', body: formData});
                fileData.sentChunk++;
    
                if (fileData.sentChunk === fileData.totalChunkCount) {
                    fileData.status = 'uploaded';
                    await $fetch("/api/library/upload/finalize", { query: {token} });
                    deleteFile(fileData.file);

                    toast.add({
                        title: `${fileData.file.name} updated successfully`,
                        color: "success"
                    });
                }
            }
            catch(caught) {
                if (caught instanceof Error) {
                    fileData.status = "error"
                    fileData.error = caught;
                }
            }
        })
    }
}

</script>