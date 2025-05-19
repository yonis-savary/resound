import type { Track } from "~/models/Track";
import type { UserSpecialActions } from "~/types/LocalUserSettings";

const startShuffle = async function(tracks: Track[], likesOnly: boolean = false){
    const player = usePlayerStore();
    const likes = useLikesStore();

    let tracksId = tracks.map(track => track.id);

    if (likesOnly)
        tracksId = tracksId.filter(track => likes.isLiked(track));

    const data = await $fetch<Track[]>(`/api/shuffle/tracks`, {
        params: { tracks: tracksId }
    })
    player.changeTracklist(data);
};


export const userSpecialActionsCallbacks: Record<UserSpecialActions,()=>void> = {
    'shuffleArtist': ()=>{ shuffleCurrentArtist(false) },
    'shuffleArtistLikes': ()=>{ shuffleCurrentArtist(true) },
    'shuffleAlbum': ()=>{ shuffleCurrentAlbum(false) },
    'shuffleAlbumLikes': ()=>{ shuffleCurrentAlbum(true) },
    'shuffleLibrary': ()=>{ shuffleLibrary(false) },
    'shuffleLibraryLikes': ()=>{ shuffleLibrary(true) },
    'shuffleGenre': ()=>{ shuffleCurrentGenre(false) },
    'shuffleGenreLikes': ()=>{ shuffleCurrentGenre(true) },
}


const likesOnlyOptions = (likesOnly: boolean = false) => (
    likesOnly ? {params: {likesOnly: true}}: {}
);

const shuffleCurrentArtist = async (likesOnly:boolean=false) => {
    const { currentTrack } = usePlayerStore();
    const player = usePlayerStore();

    const artist = currentTrack?.track_artists.at(0) ?? undefined;
    if (!artist)
        return;

    const data = await $fetch<Track[]>(`/api/shuffle/artist/` + artist.artist, likesOnlyOptions(likesOnly));
    player.changeTracklist(data);
};

const shuffleCurrentAlbum = async (likesOnly:boolean=false) => {
    const player = usePlayerStore();
    const { currentTrack } = usePlayerStore();

    const data = await $fetch<Track[]>(`/api/shuffle/album/` + currentTrack?.album, likesOnlyOptions(likesOnly));
    player.changeTracklist(data);
};

const shuffleLibrary = async (likesOnly:boolean=false) => {
    const player = usePlayerStore();
    const data = await $fetch<Track[]>(`/api/shuffle/all`, likesOnlyOptions(likesOnly));
    player.changeTracklist(data);
};

const shuffleCurrentGenre = async (likesOnly:boolean=false) => {
    const player = usePlayerStore();
    const { currentTrack } = usePlayerStore();

    const genre = currentTrack?.album_album.album_genres.at(0) ?? undefined;
    if (!genre)
        return;

    const data = await $fetch<Track[]>(`/api/shuffle/genre/` + genre.id, likesOnlyOptions(likesOnly));
    player.changeTracklist(data);

};

export {startShuffle, shuffleLibrary}