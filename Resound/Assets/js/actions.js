const ACTIONS = {
    SHUFFLE_ALL: "SHUFFLE_ALL",
    SHUFFLE_ALL_FAVORITE: "SHUFFLE_ALL_FAVORITE",
    SHUFFLE_SIMILAR: "SHUFFLE_SIMILAR",
    SHUFFLE_ARTIST: "SHUFFLE_ARTIST",
    SHUFFLE_ARTIST_FAVORITE: "SHUFFLE_ARTIST_FAVORITE",
    SHUFFLE_ALBUM: "SHUFFLE_ALBUM",
    SHUFFLE_ALBUM_FAVORITE: "SHUFFLE_ALBUM_FAVORITE",
    SHUFFLE_GENRE: "SHUFFLE_GENRE",
    SHUFFLE_GENRE_FAVORITE: "SHUFFLE_GENRE_FAVORITE",
    PLAY_ALBUM_FROM_START: "PLAY_ALBUM_FROM_START",
    PLAY_ALBUM_FROM_CURRENT:"PLAY_ALBUM_FROM_CURRENT"
};

const ACTIONS_LABEL = {
    SHUFFLE_ALL: 'Shuffle all library',
    SHUFFLE_ALL_FAVORITE: 'Shuffle all favorites',
    SHUFFLE_SIMILAR: "Shuffle similar tracks",
    SHUFFLE_ARTIST: "Shuffle current artist's tracks",
    SHUFFLE_ARTIST_FAVORITE: "Shuffle current artist favorite tracks",
    SHUFFLE_ALBUM: "Shuffle current album",
    SHUFFLE_ALBUM_FAVORITE: "Shuffle current album favorite tracks",
    SHUFFLE_GENRE: "Shuffle current genre tracks",
    SHUFFLE_GENRE_FAVORITE: "Shuffle current genre favorite tracks",
    PLAY_ALBUM_FROM_START: "Play current album from start",
    PLAY_ALBUM_FROM_CURRENT: "Play next tracks from current album",
};

const ACTIONS_HANDLERS = {
    SHUFFLE_ALL: shuffleAllLibrary,
    SHUFFLE_ALL_FAVORITE: shuffleAllLibraryFavorites,
    SHUFFLE_SIMILAR: launchMoodMode,
    SHUFFLE_ARTIST: shuffleCurrentArtist,
    SHUFFLE_ARTIST_FAVORITE: shuffleCurrentArtistFavorite,
    SHUFFLE_ALBUM: shuffleCurrentAlbum,
    SHUFFLE_ALBUM_FAVORITE: shuffleCurrentAlbumFavorite,
    SHUFFLE_GENRE: shuffleCurrentGenre,
    SHUFFLE_GENRE_FAVORITE: shuffleCurrentGenreFavorite,
    PLAY_ALBUM_FROM_START: playAlbumFromStart,
    PLAY_ALBUM_FROM_CURRENT: playAlbumFromCurrent,
}

async function shuffleAllLibraryFavorites() 
{ 
    shuffleAllLibrary(true) 
}

async function launchMoodMode(favoritesOnly=false)
{
    let playlist = await apiFetch("/artist/generate-mood/" + playedSongID, {favoritesOnly});
    playlist = playlist.map(x => x.id);
    playlist.unshift(playedSongID);

    setTracklist(playlist);

}

async function shuffleCurrentArtist()         { shuffleArtistTracks(playedSongData.album.artist.data.id, false, true) }
async function shuffleCurrentArtistFavorite() { shuffleArtistTracks(playedSongData.album.artist.data.id, true, true); }
async function shuffleCurrentAlbum()          { shuffleAlbum(playedSongData.data.album, false, true); }
async function shuffleCurrentAlbumFavorite()  { shuffleAlbum(playedSongData.data.album, true, true); }
async function shuffleCurrentGenre()          { shuffleGenre(playedSongData.album.data.genre, false, true); }
async function shuffleCurrentGenreFavorite()  { shuffleGenre(playedSongData.album.data.genre, true, true); }

async function playAlbumFromStart(albumId=null)           
{
    let tracks = await apiFetch("track", {album: albumId ?? playedSongData.data.album});
    let groupedTracks = tracks.groupByKey(x => x.data.disc_number);

    let allTracks = Object.values(groupedTracks)
    .map(x => x.sortByKey(y => y.data.position))
    .flat()
    .map(x => x.data.id);

    setTracklist(allTracks);
}

async function playAlbumFromCurrent()         
{
    let tracks = await apiFetch("track", {album: playedSongData.data.album});
    let groupedTracks = tracks.groupByKey(x => x.data.disc_number);

    let allTracks = Object.values(groupedTracks)
    .map(x => x.sortByKey(y => y.data.position))
    .flat()
    .map(x => x.data.id);

    let currentIndex = allTracks.findIndex(x => x == playedSongID);

    setTracklist(allTracks, currentIndex);
}


const PREVIOUS_BUTTON_ACTION_KEY = "previous-button.double-click-action";
const NEXT_BUTTON_ACTION_KEY = "next-button.double-click-action";

function setNextButtonAction(action)
{
    localStorage.setItem(NEXT_BUTTON_ACTION_KEY, action)
}

function setPreviousButtonAction(action)
{
    localStorage.setItem(PREVIOUS_BUTTON_ACTION_KEY, action)
}

async function triggerActionFromName(action)
{
    await playAudioEffect("mode-mode-activation.wav");

    let callback = ACTIONS_HANDLERS[action] ?? null;
    if (!callback)
    {
        console.error("Invalid action name", action);
        callback = ACTIONS_HANDLERS[ACTIONS.SHUFFLE_ALL_FAVORITE];
    }
    (callback)();
}

function triggerNextButtonAction()
{
    triggerActionFromName(localStorage.getItem(NEXT_BUTTON_ACTION_KEY))
}

function triggerPreviousButtonAction()
{
    triggerActionFromName(localStorage.getItem(PREVIOUS_BUTTON_ACTION_KEY))
}

if (localStorage.getItem(PREVIOUS_BUTTON_ACTION_KEY) == null)
    setPreviousButtonAction(ACTIONS.SHUFFLE_ALL);

if (localStorage.getItem(NEXT_BUTTON_ACTION_KEY) == null)
    setNextButtonAction(ACTIONS.SHUFFLE_ARTIST);
