import handleUpload from "~/server/music/uploadHandler";
import type { UploadInfo } from "../../../../types/UploadInfo";

export default defineEventHandler(async event => {

    const form = getQuery(event)

    const token = form?.token?.toString()
    const uploadStorage = useStorage('data/temp/uploads/' + token);
    if (! await uploadStorage.hasItem('infos'))
        throw createError({ statusCode: 400, statusMessage: 'Invalid token' })

    const keys = (await uploadStorage.getKeys()).sort().filter(key => key != 'infos');
    const infos = await uploadStorage.getItem<UploadInfo>('infos');
    
    if (!infos)
        throw createError({ statusCode: 400, statusMessage: 'Could not resolve file infos' })


    const chunks: Buffer[] = [];

    for (const key of keys) {
        const data = await uploadStorage.getItem<{type: string, data: number[]}>(key);
        if (data)
            chunks.push(Buffer.from(data.data));
    }

    const finalBuffer = Buffer.concat(chunks)

    const blob = new Blob([finalBuffer], { type: 'application/octet-stream' })

    await handleUpload(infos?.fileName, blob);


    for (const key of keys) {
        uploadStorage.removeItem(key);
    }

    uploadStorage.setItem('infos', {
        ...infos,
        finalizedAt: (new Date).getTime()
    })

    return { status: "OK" }

});