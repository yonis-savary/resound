const albumCover = id => `/api/library/album-cover/${id}`;

const userID = _ => userIDInput.value;


async function playAudioEffect(filename, duration=1000)
{
    let effect = new Audio(`/assets?file=${filename}`);

    let promise = new Promise((res, rej) => {
        effect.addEventListener("canplaythrough", res);
    });

    await promise;

    effect.play();

    await sleep(duration)
}

function albumCoverImg(album, className="")
{
    return html`<img
        style="width: 100%"
        album="${album.data.id}"
        src="${albumCover(album.data.id)}"
        loading="lazy"
        class="album-cover ${className} clickable"
        onclick="openAlbum('${album.data.id}')"
    >`
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
    await pageContent.fadeIn();
    document.dispatchEvent(new Event("PageContentChanged"));
}

if (isMobile())
{
    let navbar = document.querySelector(".navbar")
    navbar.style.background = "black";

    for (let [source, target] of [
        ["fill-left", "fill-top"],
        ["fill-right", "fill-bottom"]
    ]) {
        navbar.querySelectorAll("." + source).forEach(x => x.classList.replace(source, target));
    }

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