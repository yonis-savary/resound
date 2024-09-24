const albumCover = id => `/api/library/album-cover/${id}`;

const userID = _ => userIDInput.value;


async function playAudioEffect(filename, duration=1000)
{
    let effect = new Audio(`/assets?file=${filename}`);

    let promise = new Promise((res, rej) => {
        effect.addEventListener("canplaythrough", res);
    });

    await promise;

    audioPlayer.pause();

    effect.volume = audioPlayer.volume/2 ;
    effect.play();
    await sleep(duration)

    audioPlayer.play();
}

function albumCoverImg(album, className="")
{
    return html`<img
        style="width: 100%"
        album="${album.data.id}"
        src="${albumCover(album.data.id)}"
        loading="lazy"
        class="album-cover ${className} clickable"
        onclick="openAlbum('${album.data.id}', event)"
    >`
}

function prettyAlbumPlaySection(album)
{
    return html`
    <section class="album-play-section" onclick="playAlbumFromStart(${album.data.id})">
        <img
        class="cover"
        src="${albumCover(album.data.id)}"
        loading="lazy"
        >
        <section class="vignette"></section>
        <span class="title">${album.data.name}</span>
    </section>
    `
}

function prettyDuration(seconds)
{
    if (seconds === null)
        return "???";

    if (seconds < 60)
        return `${seconds}s`;

    if (seconds < 3600)
        return `${Math.floor(seconds/60)}m ${seconds%60}s`;

    let hours = Math.floor(seconds / 3600);
    let minutes = Math.floor((seconds % 3600) / 60);
    seconds %= 60;

    return `${hours}h ${minutes}m ${seconds}s`;
}

const digitsDuration = seconds => {
    let hours = Math.floor(seconds / 3600);
    let minutes = Math.floor(seconds / 60);
    seconds %= 60;

    if (hours)
        return [hours, minutes, seconds].map(x => x.toString().padStart(2, "0")).join(":");

    return [minutes, seconds].map(x => x.toString().padStart(2, "0")).join(":");
}

const changePageContentTo = async (content)=>
{
    await pageContent.fadeOut()
    pageContent.style.removeProperty("--track-color")
    pageContent.innerHTML = content;
    addOverlayListeners();
    addMenuListeners();
    window.scrollTo(0,0)
    await pageContent.fadeIn();
    document.dispatchEvent(new Event("PageContentChanged"));
}


/**
 * edited version of https://stackoverflow.com/a/12646864
 * return a clone of the array
 */
function shuffleArray(original) {
    let array = [].concat(...original);

    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }

    return array;
}

function renderAlbumPreview(album)
{
    return html`
    <section
        album="${album.data.id}"
        class="flex-column gap-1 album-container"
        title="${album.data.name} by ${album.artist.data.name}"
    >
        ${albumCoverImg(album)}
        <section class="flex-column gap-0">
            <b class="clickable one-liner" title="${album.data.name}" onclick="openAlbum('${album.data.id}')">${album.data.name}</b>
            <small class="clickable one-liner" onclick="openArtist('${album.data.artist}')">${album.artist.data.name}</small>
        </section>
    </section>
    `
}












const PAGE_ALBUM = "album";
const PAGE_FULL_TRACK_GALLERY = "full_track_gallery";
const PAGE_HOME = "home";
const PAGE_ARTIST = "artist";
const PAGE_ARTIST_MENU = "artist_menu";
const PAGE_GENRE = "genre";
const PAGE_GENRE_MENU = "genre_menu";
const PAGE_YEAR = "year";
const PAGE_YEAR_MENU = "year_menu";
const PAGE_GALLERY = "galley";
const PAGE_PLAYLIST_MENU = "playlist_menu";
const PAGE_PLAYLIST = "playlist";
const PAGE_WEB = "web";
const PAGE_SETTINGS = "settings";
const PAGE_ADD_MUSIC = "add_music";

if (!('lasthash' in window.location))
    window.location.lasthash = [];


let ignoreNextChangePageFragment = false;

function interpretFragment(fragment)
{
    let [type, dataId] = fragment.split("-", 2);
    type = type.replace(/^\#/, "");

    ignoreNextChangePageFragment = true;
    switch (type)
    {
        case PAGE_HOME          : displayLibrary(dataId);        break;
        case PAGE_ALBUM         : openAlbum(dataId);             break;
        case PAGE_ARTIST        : openArtist(dataId);            break;
        case PAGE_ARTIST_MENU   : displayArtistsLibrary(dataId);     break;
        case PAGE_GENRE         : openGenre(dataId);             break;
        case PAGE_GENRE_MENU    : displayGenreGallery(dataId);   break;
        case PAGE_YEAR          : openYear(dataId);              break;
        case PAGE_YEAR_MENU     : displayYearsGallery(dataId);   break;
        case PAGE_GALLERY       : displayFullGallery(dataId);    break;
        case PAGE_PLAYLIST      : openPlaylist(dataId);          break;
        case PAGE_PLAYLIST_MENU : displayPlaylistMenu(dataId);   break;
        case PAGE_WEB           : displayEmbeddedMedias(dataId); break;
        case PAGE_SETTINGS      : displaySettings(dataId);       break;
        case PAGE_ADD_MUSIC     : displayUploadMenu(dataId);     break;
        case PAGE_FULL_TRACK_GALLERY : displayFullTrackLibrary(dataId); break;
        default:
            console.warn("Type not recognized", type, dataId);
    }
}

/**
 * Manually change by page scripts
 * @param {*} newHash
 * @param {*} dataId
 */
function changePageFragment(newHash, dataId=null)
{
    if (ignoreNextChangePageFragment)
        return ignoreNextChangePageFragment = false;
    ignoreNextChangePageFragment = false;

    newHash = newHash + (dataId ?  "-" + dataId: "");
    changePageHash(newHash, true);
}

function changePageHash(newHash, ignore=false)
{
    if (ignore)
        ignoreNextChangeEvent = true;

    window.location.hash = newHash;
}





let ignoreNextChangeEvent = false;

document.addEventListener("DOMContentLoaded", _ => {
    const navbar = document.querySelector(".navbar");

    window.addEventListener("hashchange", event => {
        event.preventDefault();

        if (ignoreNextChangeEvent)
            return ignoreNextChangeEvent = false;
        ignoreNextChangeEvent = false;

        if (isMobile() && navbar.classList.contains("active"))
        {
            navbar.classList.remove("active")
            changePageHash((new URL(event.oldURL)).hash, true);
            return;
        }

        interpretFragment(window.location.hash);
    })

})
