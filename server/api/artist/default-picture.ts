import { createReadStream } from "fs"

export default defineEventHandler(event => {
    const fileStream = createReadStream("public/assets/default-artist-picture.png");

    event.node.res.setHeader('Content-Type', 'image/png');
    event.node.res.setHeader('Cache-control', 'max-age:' + (3600 * 24 * 31))

    return fileStream.pipe(event.node.res);
})