<script>


    async function displayLibrary()
    {
        await changePageContentTo(`
        <section class="flex-column gap-7">
            <section class="flex-row gap-7">
                <span
                    class="svg-link"
                    onclick="displayFullGallery()"
                > Gallery ${svg("collection")} </span>

                <span
                    class="svg-link"
                    onclick="shuffleAllLibrary()"
                > Shuffle ${svg("shuffle")} </span>

                <span
                    class="svg-link"
                    onclick="displayGenreGallery()"
                > Genres ${svg("palette")} </span>

                <span
                    class="svg-link"
                    onclick="displayYearsGallery()"
                > Years ${svg("clock-history")} </span>


            </section>

            <section class="flex-column">
                <h2 class="svg-text">${svg("star")} Last Additions</h2>
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
            section.innerHTML = mostListened.length ? mostListened.map(renderAlbumPreview).join(""): "No title played so far"
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

    async function openAlbum(uuid)
    {
        let album = (await apiRead("album", {uuid}))[0];
        await changePageContentTo(`
            <section class="flex-row align-start">
                <img src="${albumCover(uuid)}" album="${uuid}" class="album-cover big">

                <section class="flex-column gap-5 padding-left-5 fill-top fill-bottom">
                    <section class="flex-column gap-1">
                        <h1 class="giant">${album.data.name}</h1>
                        <span>
                            Album by <b class="clickable underline" onclick="openArtist('${album.data.artist}')">${album.artist.data.name}</b>
                        </span>
                        <span class="clickable underline" onclick="openGenre('${album.data.genre}')">${album.data.genre}</span>
                    </section>
                    <section class="flex-column gap-0">
                        <span>${prettyDuration(album.data.cached_total_duration_seconds)}</span>
                        <span>${album.data.cached_track_number} tracks</span>
                        <span>${album.data.release_year}</span>
                    </section>
                </section>

                <section class="fill-left">
                    <!--a class="fg-white" href="/api/library/album/${album.data.uuid}/download">${svg("download")}</a-->
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
        `)

        let accentColor = null;
        if (accentColor = album.data.accent_color_hex)
            pageContent.style.setProperty(`--track-color`, accentColor);
        else
            processAlbumVibrantColor(pageContent.querySelector("img"), uuid, pageContent);

        apiRead("track", {album: uuid, _ignores: ["track&album&artist"]}).then(tracks => {
            tracks = tracks.sortByKey(x => x.data.position);
            albumContent.innerHTML = tracks.map(x => `
            <tr track="${x.data.uuid}">
                <td><span>${x.data.position ?? "-"}</span></td>
                <td>
                    <section class="flex-row align-center">
                        ${albumCoverImg(x.album, "small")}
                        <section class="flex-column gap-0">
                            <b>${x.data.name}</b>
                            <small>${x.album.data.name}</small>
                        </section>
                    </section>
                </td>
                <td><span></span></td>
                <td><span>${digitsDuration(x.data.duration_seconds)}</span></td>
            </tr>
            `).join("")

            let uuids = tracks.map(x => x.data.uuid);

            albumContent.querySelectorAll("[track]").forEach((element, id) => {
                element.addEventListener("click", ()=>{
                    setPlaylist(uuids, id);
                })
            })
        })

        refreshFavoriteSection()
    }


    async function refreshFavoriteSection()
    {
        albumBookmarkSection
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

    async function openArtist(uuid)
    {
        let artist = (await apiRead("artist", {uuid}))[0];
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

        apiRead("album", {artist: uuid}).then(async albums => {
            pageContent.querySelector("#albumList").innerHTML = albums.map(renderAlbumPreview).join("");

            let tracks = [];

            albums = albums.sortByKey(x => x.data.release_year);

            for (let album of albums)
            {
                let albumTracks = await apiRead("track", {album: album.data.uuid})
                tracks.push(...albumTracks.sortByKey(x => x.data.position));
            }

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
                ${tracks.map((track,i) => `
                    <tr track="${track.data.uuid}" onclick="playArtistTrackList(${i})">
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

    async function playArtistTrackList(index=0)
    {
        setPlaylist(openedArtistTrackList.map(x => x.data.uuid), index);
    }

    async function shuffleArtistTrackList()
    {
        setPlaylist(shuffleArray(openedArtistTrackList).map(x => x.data.uuid));
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
        await changePageContentTo(`
            <h1>'${genre}' releases</h1>

            <section class="flex-row flex-wrap" id="albumList">
            </section>
        `);

        let albums = await apiRead("album", {genre})

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

        let albums = await apiRead("album", {release_year: year})

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
            <h1 class="giant">Releases</h1>
            <small>Sorted by artist</small>
            <section class="flex-row gap-0 flex-wrap" id="albumList"></section>
        `)

        apiRead("album").then(albums => {

            let groupedByArtist = albums.groupByKey(x => x.artist.data.name);

            for (let [key, albums] of Object.entries(groupedByArtist))
                groupedByArtist[key] = albums.sortByKey(x => x.data.name)

            let sortedKeys = Object.keys(groupedByArtist).sort();

            albumList.innerHTML = sortedKeys.map(artist => groupedByArtist[artist].map(album => `
            <section album="${album.data.uuid}">
                ${albumCoverImg(album, "no-radius")}
            </section>
            `).join("")).join("")
        })
    }

    async function shuffleAllLibrary()
    {
        setPlaylist(
            await apiFetch("/library/random-all")
        );
    }



</script>