export type UploadFileState = {
    file: File,
    status: 'pending' | 'uploading' | 'uploaded' | 'error',
    totalChunkCount: number,
    sentChunk: number
    error: Error|null
}