import type { Track } from "~/models/Track";
import { defineStore } from "pinia"

export const useSuffleStore = defineStore('shuffle', () => {
    const startShuffle = async function (tracks: Track[], likesOnly: boolean = false) {
        const player = usePlayerStore();
        const likes = useLikesStore();

        let tracksId = tracks.map(track => track.id);

        if (likesOnly)
            tracksId = tracksId.filter(track => likes.isLiked(track));

        const data = await $fetch<Track[]>(`/api/shuffle/tracks`, {
            params: { tracks: tracksId }
        })
        player.changeTracklist(data);
    }


    const likesOnlyOptions = (likesOnly: boolean = false) => (
        likesOnly ? { params: { likesOnly: true } } : {}
    );

    const shuffleCurrentArtist = async (likesOnly: boolean = false) => {
        const { currentTrack } = usePlayerStore();
        const player = usePlayerStore();
        const likes = useLikesStore();

        const artist = currentTrack?.track_artists.at(0) ?? undefined;
        if (!artist)
            return;

        const data = await $fetch<Track[]>(`/api/shuffle/artist/` + artist.artist, likesOnlyOptions(likesOnly));
        if (currentTrack && ((!likesOnly) || (likes.isLiked(currentTrack.id) && likesOnly))) 
            data.unshift(currentTrack);
        player.changeTracklist(data);
    };

    const shuffleCurrentAlbum = async (likesOnly: boolean = false) => {
        const player = usePlayerStore();
        const { currentTrack } = usePlayerStore();
        const likes = useLikesStore();

        const data = await $fetch<Track[]>(`/api/shuffle/album/` + currentTrack?.album, likesOnlyOptions(likesOnly));
        if (currentTrack && ((!likesOnly) || (likes.isLiked(currentTrack.id) && likesOnly))) 
            data.unshift(currentTrack);
        player.changeTracklist(data);
    };

    const shuffleLibrary = async (likesOnly: boolean = false) => {
        const player = usePlayerStore();
        const data = await $fetch<Track[]>(`/api/shuffle/all`, likesOnlyOptions(likesOnly));
        player.changeTracklist(data);
    };

    const shuffleCurrentGenre = async (likesOnly: boolean = false) => {
        const player = usePlayerStore();
        const { currentTrack } = usePlayerStore();
        const likes = useLikesStore();

        const genre = currentTrack?.album_album.album_genres.at(0) ?? undefined;
        if (!genre)
            return;

        const data = await $fetch<Track[]>(`/api/shuffle/genre/` + genre.id, likesOnlyOptions(likesOnly));
        if (currentTrack && ((!likesOnly) || (likes.isLiked(currentTrack.id) && likesOnly))) 
            data.unshift(currentTrack);

        player.changeTracklist(data);

    };

    const shuffleGenre = async (genre: string, likesOnly: boolean = false) => {
        const player = usePlayerStore();

        const data = await $fetch<Track[]>(`/api/shuffle/genre/` + genre, likesOnlyOptions(likesOnly));
        player.changeTracklist(data);
    }

    return {
        startShuffle,
        shuffleCurrentArtist,
        shuffleCurrentAlbum,
        shuffleLibrary,
        shuffleCurrentGenre,
        shuffleGenre
    };
})

