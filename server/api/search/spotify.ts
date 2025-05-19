import { spotifyApi } from "~/server/integrations/spotify/api";

export default defineEventHandler(async event => {
    const query = (getQuery(event).q ?? null) as string|null;
    if (!query)
        return createError({statusMessage: "'q' parameter needed", statusCode: 400});

    return await spotifyApi.search(query);
})