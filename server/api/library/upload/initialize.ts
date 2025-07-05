import {v4 as uuidV4 } from 'uuid'
import type { UploadInfo } from '../../../../types/UploadInfo';


export default defineEventHandler(event => {
    let token = ""
    let uploadStorage = useStorage('data/temp/uploads');

    do
    {
        token = uuidV4();
        uploadStorage = useStorage('data/temp/uploads/' + token);
    }
    while (!uploadStorage.getKeys());

    const creationDate = (new Date).getTime()
    const fileName = getQuery(event).fileName ?? (creationDate + '.mp3');
    uploadStorage.setItem('infos', {
        creationDate,
        fileName,
        finalizedAt: null
    } as UploadInfo );

    return {token}
});