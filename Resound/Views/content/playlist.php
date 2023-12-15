<script>


    /*
        $$\       $$$$$$\  $$$$$$\ $$$$$$$$\
        $$ |      \_$$  _|$$  __$$\\__$$  __|
        $$ |        $$ |  $$ /  \__|  $$ |
        $$ |        $$ |  \$$$$$$\    $$ |
        $$ |        $$ |   \____$$\   $$ |
        $$ |        $$ |  $$\   $$ |  $$ |
        $$$$$$$$\ $$$$$$\ \$$$$$$  |  $$ |
        \________|\______| \______/   \__|
    */


    async function displayPlaylistMenu()
    {
        await changePageContentTo(`

            <section class="flex-column gap-10">

                <section class="flex-column">
                    <section class="flex-row align-center justify-between">
                        <h2 class="svg-text">${svg("collection")} My Playlists</h2>
                        <button left class="button white secondary" menu="newPlaylistMenu">${svg("plus")} New</button>
                    </section>
                    <section id="userPlaylistList" class="flex-row flex-wrap"></section>
                </section>

                <section class="menu" id="newPlaylistMenu">
                    <section class="form-section">
                        <span>Playlist name</span>
                        <input type="text" id="newPlaylistName">
                    </section>
                    <label class="svg-text">
                        <input type="checkbox" id="newPlaylistIsPrivate">
                        Private playlist
                    </label>
                    <button class="button green" id="saveNewPlaylistButton">Create</button>
                </section>


                <section class="flex-column">
                    <h2 class="svg-text">${svg("star")} Popular playlists</h2>
                    <section id="popularPlaylistList" class="flex-row flex-wrap scrollable horizontal"></section>
                </section>


            </section>
        `);
        addMenuListeners();


        const refreshPlaylistCovers = _ => {
            pageContent.querySelectorAll("[playlist]:not(.rendered)").forEach(async element => {
                element.classList.add("rendered");
                let playlist = element.getAttribute("playlist");
                let folder = element.querySelector(".album-folder");
                if (!folder)
                    return;
                folder.innerHTML = await apiFetch(`/playlists/${playlist}/covers`)
            })
        };

        const renderPlaylist = playlist => `
        <section
            playlist="${playlist.data.uuid}"
            class="flex-column gap-1"
            onclick="openPlaylist('${playlist.data.uuid}')"
        >
            <section class="album-folder"></section>
            <b>${playlist.data.name}</b>
        </section>
        `

        apiRead("playlist").then(playlists => {
            userPlaylistList.innerHTML = playlists.length ? playlists.map(renderPlaylist).join(""): "No playlist created"
            refreshPlaylistCovers();
            refreshPlaylistsDropBoxes(playlists)
        });

        apiFetch("/playlists/popular").then(playlists => {
            popularPlaylistList.innerHTML = playlists.length ? playlists.map(renderPlaylist).join(""): "No playlist listened";
            refreshPlaylistCovers();
        })

        saveNewPlaylistButton.addEventListener("click", ()=>{
            validate({
                name: read(newPlaylistName).error("A playlist name is needed").notNull(),
                private: read(newPlaylistIsPrivate)
            }, async form => {
                await apiCreate("playlist", form);
                displayPlaylistMenu();
            })
        });
    }










    /*
        $$$$$$$\  $$$$$$$$\ $$$$$$$$\  $$$$$$\  $$$$$$\ $$\
        $$  __$$\ $$  _____|\__$$  __|$$  __$$\ \_$$  _|$$ |
        $$ |  $$ |$$ |         $$ |   $$ /  $$ |  $$ |  $$ |
        $$ |  $$ |$$$$$\       $$ |   $$$$$$$$ |  $$ |  $$ |
        $$ |  $$ |$$  __|      $$ |   $$  __$$ |  $$ |  $$ |
        $$ |  $$ |$$ |         $$ |   $$ |  $$ |  $$ |  $$ |
        $$$$$$$  |$$$$$$$$\    $$ |   $$ |  $$ |$$$$$$\ $$$$$$$$\
        \_______/ \________|   \__|   \__|  \__|\______|\________|
     */

    let selectedPlaylistUUID = null;
    let openedPlaylistTracks = []

    async function openPlaylist(uuid)
    {
        selectedPlaylistUUID = uuid;

        let {tracks, playlist} = await apiFetch(`/playlists/${uuid}/content`);

        openedPlaylistTracks = tracks;

        let isAuthor = playlist.data.user === userUUID();

        await changePageContentTo(`
            <section class="flex-row align-center justify-between">
                <section class="flex-column gap-0">
                    <h1 class="giant">${playlist.data.name}</h1>
                    <small>Playlist by ${playlist.user.data.login}</small>
                </section>
                <span class="svg-link" id="shufflePlayListButton">${svg("shuffle")} Shuffle</span>
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
                <tbody id="playlistContent"> </tbody>
            </table>

        `);

        tracks = tracks.sortByKey(x => x.data.position);
        playlistContent.innerHTML = tracks.map(x => `
        <tr track="${x.track.data.uuid}" bind="${x.data.id}">
            <td><span>${x.data.position ?? "-"}</span></td>
            <td>${albumCoverImg(x.track.album, "thumbnail")}</td>
            <td>
                <section class="flex-column gap-0">
                    <b>${x.track.data.name}</b>
                    <small>${x.track.data.artist}</small>
                </section>
            </td>
            <td><span></span></td>
            <td><span>${digitsDuration(x.track.data.duration_seconds)}</span></td>
            ${isAuthor ? `
                <td>
                    <button class="button red secondary icon" onclick="deleteTrackFromPlaylist('${x.data.id}')">
                        ${svg("dash")}
                    </button>
                </td>
            `: ""}
        </tr>
        `).join("")

        let uuids = tracks.map(x => x.track.data.uuid);

        playlistContent.querySelectorAll("[track]").forEach((element, id) => {
            element.addEventListener("click", ()=>{
                setPlaylist(uuids, id, selectedPlaylistUUID);
            })
        })

        shufflePlayListButton.addEventListener("click", async ()=>{
            setPlaylist(
                shuffleArray(openedPlaylistTracks).map(x => x.data.track),
                0,
                selectedPlaylistUUID
            )
        });

        let draggedElement = null;
        let hoveredElement = null;

        playlistContent.querySelectorAll("[bind]").forEach(trackRow => {

            trackRow.setAttribute("draggable", "true");

            trackRow.addEventListener("dragstart", (event)=>{
                draggedElement = trackRow;
            });

            trackRow.addEventListener("dragend", (event)=>{
                if (hoveredElement)
                    hoveredElement.style.borderTop = "";
            });

            trackRow.addEventListener("dragover", event =>{
                event.preventDefault();
            });

            trackRow.addEventListener("dragenter", event =>{
                if (hoveredElement && hoveredElement != trackRow)
                    hoveredElement.style.borderTop = "";

                hoveredElement = trackRow;
                trackRow.style.borderTop = "solid 5px var(--blue)";
            });

            trackRow.addEventListener("drop", async event =>{
                let droppedOn = trackRow
                trackRow.parentNode.insertBefore(draggedElement, droppedOn);

                let binds = Array.from(playlistContent.querySelectorAll("[bind]")).map(x => x.getAttribute("bind"));
                binds = JSON.stringify(binds);

                await apiFetch(`/playlists/${selectedPlaylistUUID}/reorder`, {
                    order: binds
                }, "POST")
            });

        })
    }

    async function deleteTrackFromPlaylist(bindId)
    {
        await apiFetch(`/playlists/${selectedPlaylistUUID}/remove-track/${bindId}`, {}, "POST");

        openPlaylist(selectedPlaylistUUID)
    }


</script>











<section class="menu" id="addToPlaylistMenu">
    <section class="flex-column">
        <b>Add to a playlist</b>
        <section id="playlistDropBoxes"></section>
    </section>
</section>

<script>

    /*
        $$$$$$$\  $$$$$$$\   $$$$$$\  $$$$$$$\  $$$$$$$\   $$$$$$\  $$\   $$\
        $$  __$$\ $$  __$$\ $$  __$$\ $$  __$$\ $$  __$$\ $$  __$$\ $$ |  $$ |
        $$ |  $$ |$$ |  $$ |$$ /  $$ |$$ |  $$ |$$ |  $$ |$$ /  $$ |\$$\ $$  |
        $$ |  $$ |$$$$$$$  |$$ |  $$ |$$$$$$$  |$$$$$$$\ |$$ |  $$ | \$$$$  /
        $$ |  $$ |$$  __$$< $$ |  $$ |$$  ____/ $$  __$$\ $$ |  $$ | $$  $$<
        $$ |  $$ |$$ |  $$ |$$ |  $$ |$$ |      $$ |  $$ |$$ |  $$ |$$  /\$$\
        $$$$$$$  |$$ |  $$ | $$$$$$  |$$ |      $$$$$$$  | $$$$$$  |$$ /  $$ |
        \_______/ \__|  \__| \______/ \__|      \_______/  \______/ \__|  \__|
    */

    async function refreshPlaylistsDropBoxes(playlists=null)
    {
        playlists ??= await apiRead("playlist")

        playlistDropBoxes.innerHTML = playlists.map(x => `
        <section class="card" playlist="${x.data.uuid}">
            <section class="flex-row">
                <b>${x.data.name}</b>
            </section>
        </section>
        `).join("");


        playlistDropBoxes.querySelectorAll("[playlist]").forEach(element => {
            let playlist = element.getAttribute("playlist");

            element.addEventListener("dragover", event => {
                event.preventDefault();
            })

            element.addEventListener("drop", async (event) => {
                let type = event.dataTransfer.getData("drag-type");

                if (type === "album")
                {
                    let album = event.dataTransfer.getData("album");
                    await apiFetch(`/playlists/${playlist}/add-album/${album}`, {}, "POST");
                    notifySuccess("Album added to playlist")
                }

                if (type === "track")
                {
                    let track = event.dataTransfer.getData("track")
                    await apiFetch(`/playlists/${playlist}/add-track/${track}`, {}, "POST");
                    notifySuccess("Track added to playlist")
                }
            })
        })
    }

    ([
        "albumDrag",
        "trackDrag"
    ]).forEach(event => {
        document.addEventListener(`${event}Start`, ({detail}) => {
            let screenSize = {w: window.innerWidth, h: window.innerHeight}
            openMenuAtCoord(addToPlaylistMenu, screenSize.w * 0.9, screenSize.h /2 , "left" );
        });

        document.addEventListener(`${event}End`, ({detail}) => {
            closeMenu("addToPlaylistMenu")
        });
    })

    document.addEventListener("DOMContentLoaded", _ => refreshPlaylistsDropBoxes());

</script>