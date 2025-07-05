export default defineEventHandler(async event => {

    const form = await readMultipartFormData(event)

    const chunkNumber = form?.find(f => f.name === 'chunk')?.data.toString().replaceAll(/[^0-9]/g, '');
    if (!chunkNumber)
        throw createError({ statusCode: 400, statusMessage: 'Invalid chunk number' })

    const token = form?.find(f => f.name === 'token')?.data.toString()
    const uploadStorage = useStorage('data/temp/uploads/' + token);
    if (! await uploadStorage.hasItem('infos'))
        throw createError({ statusCode: 400, statusMessage: 'Invalid token' })

    const file = form?.find(f => f.name === 'file')
    if (!file)
        throw createError({ statusCode: 400, statusMessage: 'No file' })

    uploadStorage.setItem(chunkNumber, file.data);

    return { ok: true }
});