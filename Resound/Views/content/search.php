<script>

    async function displaySearchPage()
    {
        await changePageContentTo(`
            <h1>Search</h1>
            <input type="search" name="resound-search" id="searchInput" placeholder="Search an album, artist, track...">

            <section class="flex-column" id="searchResults"></section>
        `);

        searchInput.focus();
        searchInput.addEventListener("keyup", async ()=>{
            let object = searchInput.value;

            if (object.length < 3)
                return;

            let {artists, albums, tracks} = await apiFetch(`/search`, {object});

            searchResults.innerHTML =
                (artists.length == 0 ? "": `
                <h1>Artists</h1>
                <section class="flex-column scrollable max-vh-40">
                    ${artists.sortByKey(x => x.data.name).map(x => `
                        <b onclick="openArtist('${x.data.uuid}')" class="svg-text">${svg("person-fill")} ${x.data.name}</b>
                    `).join("")}
                </section>
                `) +

                (albums.length == 0 ? "": `
                <h1>Albums</h1>
                <section class="flex-row scrollable horizontal">
                    ${albums.sortByKey(x => x.data.name).map(renderAlbumPreview).join("")}
                </section>
                `) +

                (tracks.length == 0 ? "": `
                <h1>Tracks</h1>
                <section class="flex-column scrollable max-vh-40">
                    <table>
                    ${tracks.map(x => `
                        <tr>
                            <td>${albumCoverImg(x.album, "small")}</td>
                            <td>
                                <section track="${x.data.uuid}" class="flex-column gap-0">
                                    <b class="clickable" onclick="setPlaylist('${x.data.uuid}')">${x.data.name}</b>
                                    <small class="clickable" onclick="openArtist('${x.album.data.artist}')">${x.album.artist.data.name}</small>
                                </section>
                            </td>
                        </tr>
                    `).join("")}
                    </table>
                </section>
                `)

        })
    }



</script>