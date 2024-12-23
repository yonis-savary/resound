let instantUserPlaylistDatabase = null;


async function playInstantUserPlaylistDatabaseGenre(genre)
{
    setTracklist(
        instantUserPlaylistDatabase.find(x => x.genre == genre)["tracks"]
    );
}

function stringToColor (string, saturation = 80, lightness = 35)
{
    let hash = 0;
    for (let i = 0; i < string.length; i++)
    {
        hash = string.charCodeAt(i) + ((hash << 5) - hash);
        hash = hash & hash;
    }
    return `hsl(${(hash % 360)}, ${saturation}%, ${lightness}%)`;
}



async function displayLibrary()
{
    changePageFragment(PAGE_HOME);

    await changePageContentTo(`
    <section class="flex-column gap-7">

        <section class="flex-row flex-wrap flex-column-mobile">

            <section class="flex-column flex-1">
                <h2 class="svg-text">${svg("house")} For you</h2>
                <section class="flex-row flex-wrap justify-start" id="instantUserPlaylist">
                    <section class="album-folder"></section>
                </section>
            </section>


            <section class="flex-column flex-1">
                <h2 class="svg-text">${svg("star")} Most listened this month</h2>
                <section class="flex-column" id="mostListened">
                    <section class="album-folder"></section>
                </section>
            </section>
        </section>

        <section class="flex-column">
            <h2 class="svg-text">${svg("plus-lg")} Last additions</h2>
            <section class="flex-row scrollable horizontal" id="lastAdditions">
                <section class="album-folder"></section>
            </section>
        </section>


        <section class="flex-column">
            <h2 class="svg-text">${svg("heart")} Liked tracks & genres</h2>
            <section class="flex-row flex-wrap" id="likedGenresSection"></section>
        </section>
    </section>

    `)

    apiFetch(`/library/most-listened`).then(mostListened => {
        let section = pageContent.querySelector("#mostListened")
        if (!mostListened.length)
                return section.innerHTML = "No title played so far";

        section.innerHTML = mostListened.chunk(2).map(albums => `
            <section class="flex-row">
                ${albums.map(prettyAlbumPlaySection).join("")}
            </section>
        `).join("");
    });

    apiFetch(`/library/last-additions`).then(additions => {
        let section = pageContent.querySelector("#lastAdditions")

        section.innerHTML = additions.length ? additions.map(renderAlbumPreview).join("") : "No title added"
    })

    apiFetch(`/library/instant-playlists`).then(instantUserPlaylist => {
        let section = pageContent.querySelector("#instantUserPlaylist")
        if (!instantUserPlaylist.length)
                return section.innerHTML = "No title to (re)discover";

        instantUserPlaylistDatabase = instantUserPlaylist;

        console.log(instantUserPlaylist);

        section.innerHTML = instantUserPlaylist.map(({genre, tracks}) => `
        <section class="instant-playlist-section" style="background: ${stringToColor(genre)}" onclick="playInstantUserPlaylistDatabaseGenre('${genre}')">
            <section class="title">${genre}</section>
            <section class="vignette"></section>
        </section>
        `).join("")

    });

    apiFetch(`/likes/genres`).then(likedGenres => {
        likedGenresSection.innerHTML =`

        <section class="svg-text">
            <button onclick="shuffleAllLibrary(true)" class="player-button svg-text">${svg("caret-right-fill")}</button>
            <span>Shuffle All Likes</span>
        </section>
        ` +  likedGenres.map(x => `
        <section class="svg-text">
            <button onclick="shuffleGenre('${x.genre}', true)" class="player-button svg-text">${svg("caret-right-fill")}</button>
            <span>${x.genre} (${x.count})</span>
        </section>
        `).join("");
    });
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

async function openAlbum(id, event=null)
{
    if (event)
        event.stopImmediatePropagation();

    changePageFragment(PAGE_ALBUM, id)

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

        <section class="flex-row">
            <h2 class="margin-top-3">Tracks</h2>
            <span onclick="shuffleAlbum(${album.data.id})" class="svg-text svg-link fill-left">${svg("shuffle")} Shuffle</span>
            <span onclick="shuffleAlbum(${album.data.id}, true)" class="svg-text svg-link">${svg("heart-fill")} Shuffle favorites</span>
        </section>

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
            <td class="like-holder" trackId="${x.data.id}">
            </td>
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
        albumContent.querySelectorAll(".like-holder").forEach((element, id) => {
            element.appendChild(likeButton(element.getAttribute("trackId")));
        })
    })
}

async function playAlbum(albumId)
{

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

async function shuffleAlbum(albumId, favoritesOnly=false, keepCurrentTrackFirst=false)
{
    let tracklist = await apiFetch(`/library/album/${albumId}/shuffle`, {favoritesOnly});
    if (keepCurrentTrackFirst && playedSongID)
        tracklist.unshift(playedSongID);

    setTracklist(tracklist);
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
    changePageFragment(PAGE_ARTIST, id)

    let artist = (await apiRead("artist", { id }))[0];
    await changePageContentTo(`
        <section class="flex-row align-center gap-6">
            <img class="artist-picture" src='/api/artist/${artist.data.id}/picture'>
            <h1 class="giant">${artist.data.name}</h1>
        </section>

        <hr>

        <section class="flex-column">
            <h2>Releases</h2>
            <section class="flex-row flex-wrap" id="albumList"></section>
        </section>

        <hr>
        <section class="flex-column">
            <section class="flex-row align-center">
                <h2>Tracks</h2>
                <span class="svg-link fill-left" onclick="shuffleArtistTracks(${id})">${svg("shuffle")} Shuffle</span>
                <span class="svg-link" onclick="shuffleArtistTracks(${id}, true)">${svg("heart-fill")} Shuffle Favorites</span>
            </section>
            <section class="flex-column scrollable max-vh-50" id="artistTrackList"></section>
        </section>
    `)

    apiRead("album", { artist: id }).then(async albums => {
        pageContent.querySelector("#albumList").innerHTML = albums
        .sortByKey(x => x.data.release_year)
        .reverse()
        .map(renderAlbumPreview).join("");
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
                    <td class="like-holder" trackId="${track.data.id}">
                </tr>
            `).join("")}
            </tbody>
        </table>
        `
        artistTrackList.querySelectorAll(".like-holder").forEach((element, id) => {
            element.appendChild(likeButton(element.getAttribute("trackId")));
        })
    });
}

async function playArtistTrackList(index = 0)
{
    setTracklist(openedArtistTrackList.map(x => x.data.id), index);
}

async function playArtistTracks(artistId, favoritesOnly=false, keepCurrentTrackFirst=false)
{
    let trackList = (await apiFetch(`/library/artist/${artistId}/tracks`, {favoritesOnly})).map(x => x.data.id);
    if (keepCurrentTrackFirst && playedSongID)
        trackList.unshift(playedSongID);

    setTracklist(trackList);
}

async function shuffleArtistTracks(artistId, favoritesOnly=false, keepCurrentTrackFirst=false)
{
    let trackList = await apiFetch(`/library/artist/${artistId}/shuffle`, {favoritesOnly});
    if (keepCurrentTrackFirst && playedSongID)
        trackList.unshift(playedSongID);

    setTracklist(trackList);
}

async function displayArtistsLibrary()
{
    changePageFragment(PAGE_ARTIST_MENU)

    let artists = await apiRead("artist");
    let groupedArtists = artists.sortByKey(x => x.data.name).groupByKey(x => x.data.name.substring(0, 1).toUpperCase());
    await changePageContentTo(`
        <h1 class="giant">Artists (${artists.length})</h1>
        <hr>
        <section class="flex-column">
            ${Object.entries(groupedArtists).map(([letter, artists]) => `
                <h2>${letter}</h2>
                <section class="flex-row flex-wrap gap-6">
                    ${artists.map(x => `
                        <section class="flex-column align-center gap-2 clickable" onclick="openArtist(${x.data.id})">
                            <img class="artist-picture" src='/api/artist/${x.data.id}/picture'>
                            <b style="max-width: 6em; white-space: nowrap; text-overflow: ellipsis; overflow: hidden;" >${x.data.name}</b>
                        </section>
                    `).join("")}
                </section>
            `).join("<hr>")}
        </section>
    `);
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
    changePageFragment(PAGE_GENRE, genre)

    await changePageContentTo(html`
        <section class="flex-row align-center">
            <h1>'${genre}' releases</h1>
            <span class="svg-link fill-left" onclick="shuffleGenre('${genre}')">${svg("shuffle")} Shuffle</span>
            <span class="svg-link" onclick="shuffleGenre('${genre}')">${svg("heart-fill")} Shuffle Favorites</span>
        </section>

        <section class="flex-row flex-wrap" id="albumList">
        </section>
    `);

    let albums = await apiRead("album", { genre })

    albumList.innerHTML = albums.map(x => renderAlbumPreview(x)).join("")
}

async function displayGenreGallery()
{
    changePageFragment(PAGE_GENRE_MENU);

    let genres = await apiFetch("/library/genres-list");

    await changePageContentTo(genres);

    pageContent.querySelectorAll("[genre]").forEach(x => {
        let genre = x.getAttribute("genre");

        x.addEventListener("click", _ => {
            openGenre(genre);
        })
    })
}


async function shuffleGenre(genre, favoritesOnly=false, keepCurrentTrackFirst=false)
{
    let tracklist = await apiFetch(`/library/shuffle-genre/` + genre, {favoritesOnly});
    if (keepCurrentTrackFirst && playedSongID)
        tracklist.unshift(playedSongID);

    setTracklist(tracklist);
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
    changePageFragment(PAGE_YEAR, year)

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
    changePageFragment(PAGE_YEAR_MENU);

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
    changePageFragment(PAGE_GALLERY)

    await changePageContentTo(`
        <section class="flex-row align-center justify-between">
            <h1 class="giant">Albums</h1>
            <button class="button white secondary" onclick="displayFullTrackLibrary()">Browse Tracks</button>
        </section>
        <small>Sorted by artist</small>
        <section class="flex-row gap-0 justify-center flex-wrap" id="albumList"></section>
    `)

    apiRead("album").then(albums => {

        let groupedByArtist = albums.groupByKey(x => x.artist.data.name);

        for (let [key, albums] of Object.entries(groupedByArtist))
            groupedByArtist[key] = albums.sortByKey(x => x.data.name)

        let sortedKeys = Object.keys(groupedByArtist).sort();

        albumList.innerHTML = sortedKeys.map(artist => groupedByArtist[artist].map(album => `
        <section album="${album.data.id}" class="full-gallery-album">
            ${albumCoverImg(album, "stretch no-radius")}
        </section>
        `).join("")).join("")
    })
}

async function shuffleAllLibrary(favoritesOnly=false)
{
    setTracklist(
        await apiFetch("/library/random-all", {favoritesOnly})
    );
}








/*
88888888888 8888888b.         d8888  .d8888b.  888    d8P
    888     888   Y88b       d88888 d88P  Y88b 888   d8P
    888     888    888      d88P888 888    888 888  d8P
    888     888   d88P     d88P 888 888        888d88K
    888     8888888P"     d88P  888 888        8888888b
    888     888 T88b     d88P   888 888    888 888  Y88b
    888     888  T88b   d8888888888 Y88b  d88P 888   Y88b
    888     888   T88b d88P     888  "Y8888P"  888    Y88b

 .d8888b.         d8888 888      888      8888888888 8888888b. Y88b   d88P
d88P  Y88b       d88888 888      888      888        888   Y88b Y88b d88P
888    888      d88P888 888      888      888        888    888  Y88o88P
888            d88P 888 888      888      8888888    888   d88P   Y888P
888  88888    d88P  888 888      888      888        8888888P"     888
888    888   d88P   888 888      888      888        888 T88b      888
Y88b  d88P  d8888888888 888      888      888        888  T88b     888
 "Y8888P88 d88P     888 88888888 88888888 8888888888 888   T88b    888
*/

let trackListPageCount = 0;
let fetchNextTrackListIsAllowed = true;

async function displayFullTrackLibrary()
{
    changePageFragment(PAGE_FULL_TRACK_GALLERY);

    trackListPageCount = 0;
    fetchNextTrackListIsAllowed = true
    await changePageContentTo(`
    <h1>Full list of tracks</h1>
    <section id="fullTrackListHolder" class="scrollable max-vh-50">
        <table id="fullTrackListTable" class="track-list">
            <thead>
                <tr>
                    <th>#</th>
                    <th>Title</th>
                    <th>Duration</th>
                    <th></th>
                </tr>
            </thead>
        </table>
    </section>
    `);

    fullTrackListHolder.addEventListener("scroll", event => {
        if (!fetchNextTrackListIsAllowed)
            return;

        let outerHeight = fullTrackListHolder.getBoundingClientRect().height;
        let innerHeight = fullTrackListHolder.scrollHeight;
        let scrolled = fullTrackListHolder.scrollTop;

        if (scrolled + outerHeight >= (innerHeight*0.9))
            fetchNextBatchOfTracks();

    });

    fetchNextBatchOfTracks()
}


async function fetchNextBatchOfTracks()
{
    fetchNextTrackListIsAllowed = false;

    let tracks = await apiFetch(`/track-batch/` + trackListPageCount);

    let newSection = document.createElement("tbody");
    newSection.innerHTML = tracks.map((track, i) => `
        <tr track="${track.data.id}" onclick="setTracklist([${track.data.id}]);">
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
            <td class="like-holder" trackId="${track.data.id}">
        </tr>
    `).join("")


    fullTrackListTable.appendChild(newSection);
    fullTrackListTable.querySelectorAll(".like-holder").forEach((element, id) => {
        element.classList.remove("like-holder");
        element.appendChild(likeButton(element.getAttribute("trackId")));
    })

    trackListPageCount++;
    fetchNextTrackListIsAllowed = (tracks.length >= 100);
}