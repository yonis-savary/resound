async function displayLibrary() {
    await changePageContentTo(`
    <section class="flex-column gap-7">

        <section class="flex-column">
            <h2 class="svg-text">${svg("plus-lg")} Last Additions</h2>
            <section class="flex-row scrollable horizontal" id="lastAdditions">
                <section class="album-folder"></section>
            </section>
        </section>

        <section class="flex-column">
            <h2 class="svg-text">${svg("star")} Most listened this month</h2>
            <section class="flex-row scrollable horizontal" id="mostListened">
                <section class="album-folder"></section>
            </section>
        </section>
    </section>

    `)

    apiFetch(`/library/last-additions`).then(additions => {
        let section = pageContent.querySelector("#lastAdditions")
        section.innerHTML = additions.map(renderAlbumPreview).join("")
    })

    apiFetch(`/library/most-listened`).then(mostListened => {
        let section = pageContent.querySelector("#mostListened")
        section.innerHTML = mostListened.length ? mostListened.map(renderAlbumPreview).join("") : "No title played so far"
    })
}

document.addEventListener("DOMContentLoaded", _ => displayLibrary())








/*
    $$$$$$\  $$\       $$$$$$$\  $$\   $$\ $$\      $$\
    $$  __$$\ $$ |      $$  __$$\ $$ |  $$ |$$$\    $$$ |
    $$ /  $$ |$$ |      $$ |  $$ |$$ |  $$ |$$$$\  $$$$ |
    $$$$$$$$ |$$ |      $$$$$$$\ |$$ |  $$ |$$\$$\$$ $$ |
    $$  __$$ |$$ |      $$  __$$\ $$ |  $$ |$$ \$$$  $$ |
    $$ |  $$ |$$ |      $$ |  $$ |$$ |  $$ |$$ |\$  /$$ |
    $$ |  $$ |$$$$$$$$\ $$$$$$$  |\$$$$$$  |$$ | \_/ $$ |
    \__|  \__|\________|\_______/  \______/ \__|     \__|
*/

async function openAlbum(id)
{
    let album = (await apiRead("album", { id }))[0];
    await changePageContentTo(`
        <section class="flex-row flex-column-mobile align-start">
            <img src="${albumCover(id)}" album="${id}" class="album-cover big ${isMobile() ? "fill-left fill-right": ""}">

            <section class="flex-column gap-5 padding-left-5 fill-top fill-bottom">
                <section class="flex-column gap-1">
                    <h1 class="giant">${album.data.name}</h1>
                    <span>
                        Released by
                        <b class="clickable underline" onclick="openArtist('${album.data.artist}')">${album.artist.data.name}</b>
                        in
                        <span class="clickable underline" onclick="openYear(${album.data.release_year})">${album.data.release_year}</span>
                    </span>
                    <span class="clickable underline" onclick="openGenre('${album.data.genre}')">${album.data.genre}</span>
                </section>
                <section class="flex-column gap-0">
                    <span>${prettyDuration(album.data.cached_total_duration_seconds)}</span>
                    <span>${album.data.cached_track_number} tracks</span>
                </section>
            </section>

            <section class="fill-left">
                <!--a class="fg-white" href="/api/library/album/${album.data.id}/download">${svg("download")}</a-->
                <section class="flex-column">
                    <section id="albumBookmarkSection"></section>
                </section>
            </section>

        </section>

        <h2 class="margin-top-3">Tracks</h2>

        <table class="track-list">
            <thead>
                <tr>
                    <th>#</th>
                    <th>Track</th>
                    <th></th>
                    <th>Duration</th>
                </tr>
            </thead>
            <tbody id="albumContent"> </tbody>
        </table>

        <section class="flex-column small margin-top-5">

            <section class="flex-column gap-1">
                <span class="underline clickable" onclick="downloadAlbum(${album.data.id})">Download</span>
                <p>Download a zip file containing this album tracks</p>
            </section>
            <section class="flex-column gap-1">
                <span class="underline clickable" onclick="deleteAlbumData(${album.data.id})">Delete data</span>
                <p>Delete album data but not its files</p>
            </section>
            <section class="flex-column gap-1">
                <span class="underline clickable" onclick="deleteAlbumFiles(${album.data.id})">Delete files</span>
                <p>Completely erase this album from your library</p>
            </section>
        </section>
    `)

    let accentColor = null;
    if (accentColor = album.data.accent_color_hex)
        pageContent.style.setProperty(`--track-color`, accentColor);
    else
        processAlbumVibrantColor(pageContent.querySelector("img"), id, pageContent);

    apiRead("track", { album: id, _ignores: ["track&album&artist"] }).then(tracks => {
        let groupedTracks = tracks.groupByKey(x => x.data.disc_number);
        let discNumbers = Object.keys(groupedTracks).sort();

        tracks = [];
        for (const [discNumber, discTracks] of Object.entries(groupedTracks))
            tracks.push(...discTracks.sortByKey(x => x.data.position));

        const showDisc = discNumbers.length > 1;


        albumContent.innerHTML = tracks.map(x => `
        <tr track="${x.data.id}">
            <td>
                <span>${x.data.position ?? "-"}</span>
            </td>
            <td>
                <section class="flex-row align-center">
                    ${albumCoverImg(x.album, "small")}
                    <section class="flex-column gap-0">
                        <b>${x.data.name}</b>
                        <small>${x.data.artist}</small>
                    </section>
                </section>
            </td>
            <td><span></span></td>
            <td><span>${digitsDuration(x.data.duration_seconds)}</span></td>
            <td>
                ${showDisc ? `
                <span class="svg-text">${x.data.disc_number} ${svg("disc", 18)}</span>
                `: ''}
            </td>
        </tr>
        `).join("")

        let ids = tracks.map(x => x.data.id);

        albumContent.querySelectorAll("[track]").forEach((element, id) => {
            element.addEventListener("click", () => {
                setTracklist(ids, id);
            })
        })
    })
}

async function downloadAlbum(albumId)
{
    notifyInfo("Your download will begin in a few seconds", "A ZIP file containing your album is being generated")
    location.href = `/api/library/album/${albumId}/download`;
}

async function deleteAlbumData(albumId)
{
    if (!confirm("Delete this album from your library ? Files will be kept"))
        return;

    await apiFetch(`/api/library/album/${albumId}/delete-data`);
    displayLibrary();
}

async function deleteAlbumFiles(albumId)
{
    if (!confirm("Delete this album's files ? This action cannot be undone"))
        return;

    await apiFetch(`/api/library/album/${albumId}/delete-files`);
    displayLibrary();
}














/*
    $$$$$$\  $$$$$$$\ $$$$$$$$\ $$$$$$\  $$$$$$\ $$$$$$$$\
    $$  __$$\ $$  __$$\\__$$  __|\_$$  _|$$  __$$\\__$$  __|
    $$ /  $$ |$$ |  $$ |  $$ |     $$ |  $$ /  \__|  $$ |
    $$$$$$$$ |$$$$$$$  |  $$ |     $$ |  \$$$$$$\    $$ |
    $$  __$$ |$$  __$$<   $$ |     $$ |   \____$$\   $$ |
    $$ |  $$ |$$ |  $$ |  $$ |     $$ |  $$\   $$ |  $$ |
    $$ |  $$ |$$ |  $$ |  $$ |   $$$$$$\ \$$$$$$  |  $$ |
    \__|  \__|\__|  \__|  \__|   \______| \______/   \__|
*/

let openedArtistTrackList = [];

async function openArtist(id)
{
    let artist = (await apiRead("artist", { id }))[0];
    await changePageContentTo(`
        <section class="flex-column gap-0">
            <h1 class="giant">${artist.data.name}</h1>
            <span>Artist</span>
        </section>
        <section class="flex-column ">
            <h2>Releases</h2>
            <section class="flex-row flex-wrap" id="albumList"></section>
        </section>

        <section class="flex-column">
            <section class="flex-row justify-between align-center">
                <h2>Tracks</h2>
                <span class="svg-link" onclick="shuffleArtistTrackList()">${svg("shuffle")} Shuffle</span>
            </section>
            <section class="flex-column scrollable max-vh-50" id="artistTrackList"></section>
        </section>
    `)

    apiRead("album", { artist: id }).then(async albums => {
        pageContent.querySelector("#albumList").innerHTML = albums.map(renderAlbumPreview).join("");
    });


    apiFetch(`/library/artist/${id}/tracks`).then(tracks => {

        openedArtistTrackList = tracks;

        artistTrackList.innerHTML = `
        <table class="track-list">
            <thead>
                <tr>
                    <th>#</th>
                    <th>Title</th>
                    <th>Duration</th>
                </tr>
            </thead>
            <tbody>
            ${tracks.map((track, i) => `
                <tr track="${track.data.id}" onclick="playArtistTrackList(${i})">
                    <td>${track.data.position}</td>
                    <td>
                        <section class="flex-row align-center">
                            ${albumCoverImg(track.album, "small")}
                            <section class="flex-column gap-0">
                                <b>${track.data.name}</b>
                                <small>${track.album.data.name}</small>
                            </section>
                        </section>
                    </td>
                    <td>${prettyDuration(track.data.duration_seconds)}</td>
                </tr>
            `).join("")}
            </tbody>
        </table>
        `
    });
}

async function playArtistTrackList(index = 0)
{
    setTracklist(openedArtistTrackList.map(x => x.data.id), index);
}

async function shuffleArtistTrackList()
{
    setTracklist(shuffleArray(openedArtistTrackList).map(x => x.data.id));
}













/*
     $$$$$$\  $$$$$$$$\ $$\   $$\ $$$$$$$\  $$$$$$$$\
    $$  __$$\ $$  _____|$$$\  $$ |$$  __$$\ $$  _____|
    $$ /  \__|$$ |      $$$$\ $$ |$$ |  $$ |$$ |
    $$ |$$$$\ $$$$$\    $$ $$\$$ |$$$$$$$  |$$$$$\
    $$ |\_$$ |$$  __|   $$ \$$$$ |$$  __$$< $$  __|
    $$ |  $$ |$$ |      $$ |\$$$ |$$ |  $$ |$$ |
    \$$$$$$  |$$$$$$$$\ $$ | \$$ |$$ |  $$ |$$$$$$$$\
    \______/ \________|\__|  \__|\__|  \__|\________|
*/

async function openGenre(genre)
{
    await changePageContentTo(html`
        <section class="flex-row align-center justify-between">
            <h1>'${genre}' releases</h1>
            <span class="svg-text" onclick="shuffleGenre('${genre}')">${svg("shuffle")} Shuffle</span>
        </section>

        <section class="flex-row flex-wrap" id="albumList">
        </section>
    `);

    let albums = await apiRead("album", { genre })

    albumList.innerHTML = albums.map(x => renderAlbumPreview(x)).join("")
}

async function displayGenreGallery()
{
    let genres = await apiFetch("/library/genres-list");

    await changePageContentTo(genres);

    pageContent.querySelectorAll("[genre]").forEach(x => {
        let genre = x.getAttribute("genre");

        x.addEventListener("click", _ => {
            openGenre(genre);
        })
    })
}


async function shuffleGenre(genre)
{
    let playlist = await apiFetch(`/library/random-from-genre/` + genre);
    setTracklist(playlist);
}








/*
    $$\     $$\ $$$$$$$$\  $$$$$$\  $$$$$$$\
    \$$\   $$  |$$  _____|$$  __$$\ $$  __$$\
     \$$\ $$  / $$ |      $$ /  $$ |$$ |  $$ |
      \$$$$  /  $$$$$\    $$$$$$$$ |$$$$$$$  |
       \$$  /   $$  __|   $$  __$$ |$$  __$$<
        $$ |    $$ |      $$ |  $$ |$$ |  $$ |
        $$ |    $$$$$$$$\ $$ |  $$ |$$ |  $$ |
        \__|    \________|\__|  \__|\__|  \__|

*/

async function openYear(year)
{
    await changePageContentTo(`
        <h1>'${year}' releases</h1>

        <section class="flex-row flex-wrap" id="albumList">
        </section>
    `);

    let albums = await apiRead("album", { release_year: year })

    albumList.innerHTML = albums.map(x => renderAlbumPreview(x)).join("")
}

async function displayYearsGallery()
{
    let years = await apiFetch("/library/years-list");

    await changePageContentTo(years);

    pageContent.querySelectorAll("[year]").forEach(x => {
        let year = x.getAttribute("year");

        x.addEventListener("click", _ => {
            openYear(year);
        })
    })
}













/*
     $$$$$$\   $$$$$$\  $$\       $$\       $$$$$$$\ $$\     $$\
    $$  __$$\ $$  __$$\ $$ |      $$ |      $$  __$$\\$$\   $$  |
    $$ /  \__|$$ /  $$ |$$ |      $$ |      $$ |  $$ |\$$\ $$  /
    $$ |$$$$\ $$$$$$$$ |$$ |      $$ |      $$$$$$$  | \$$$$  /
    $$ |\_$$ |$$  __$$ |$$ |      $$ |      $$  __$$<   \$$  /
    $$ |  $$ |$$ |  $$ |$$ |      $$ |      $$ |  $$ |   $$ |
    \$$$$$$  |$$ |  $$ |$$$$$$$$\ $$$$$$$$\ $$ |  $$ |   $$ |
     \______/ \__|  \__|\________|\________|\__|  \__|   \__|
*/

async function displayFullGallery()
{
    await changePageContentTo(`
        <h1 class="giant">Albums</h1>
        <small>Sorted by artist</small>
        <section class="flex-row gap-0 justify-between flex-wrap" id="albumList"></section>
    `)

    apiRead("album").then(albums => {

        let groupedByArtist = albums.groupByKey(x => x.artist.data.name);

        for (let [key, albums] of Object.entries(groupedByArtist))
            groupedByArtist[key] = albums.sortByKey(x => x.data.name)

        let sortedKeys = Object.keys(groupedByArtist).sort();

        albumList.innerHTML = sortedKeys.map(artist => groupedByArtist[artist].map(album => `
        <section album="${album.data.id}">
            ${albumCoverImg(album, "no-radius")}
        </section>
        `).join("")).join("")
    })
}

async function shuffleAllLibrary()
{
    setTracklist(
        await apiFetch("/library/random-all")
    );
}


