<section class="player align-center gap-10 flex-row" id="player">
    <section class="flex-row align-center gap-2" id="playerControls">
        <button id="playerPreviousButton">
            <?= svg("chevron-left") ?>
        </button>
        <button id="playerPauseButton">
            <?= svg("pause-fill") ?>
        </button>
        <button id="playerPlayButton">
            <?= svg("caret-right-fill") ?>
        </button>
        <button id="playerNextButton">
            <?= svg("chevron-right") ?>
        </button>
    </section>

    <section class="flex-row flex-1">
        <section id="playerTrackCover"></section>
        <section class="flex-column gap-0 flex-1">
            <section class="flex-column gap-0" id="playerTrackInfo"></section>
            <section class="flex-row align-center flex-1" id="playerProgressSection">
                <progress style="width: 100%" id="playerProgress"></progress>
                <small class="flex-shrink-0" id="playerProgressInfo"></small>
            </section>
        </section>
    </section>

    <button menu="playerVolumeMenu" top id="playerVolumeButton">
        <?= svg("volume-up") ?>
    </button>

</section>

<section class="menu" id="playerVolumeMenu">
    <section class="flex-column">
        <input type="range" id="playerVolumeInput" min="0" max="100" value="50" orient="vertical">

    </section>
</section>

<?= script("Vibrant.js") ?>

<script>

    const PLAYER_PROGRESS_RESOLUTION = 20;

    if (isMobile())
    {
        player.classList.replace("flex-row", "flex-column");
        player.classList.replace("gap-10", "gap-0");

        playerVolumeInput.removeAttribute("orient");

        playerTrackCover.style.display = "none";
        playerControls.appendChild(playerVolumeButton);
        player.appendChild(playerProgressSection);
        Array.from(player.childNodes)
        .filter(x => 'innerHTML' in x)
        .slice(1)
        .forEach(x => x.style.width= "100%")
    }


    let playerPlaylistUUID = null;

    let playlistIndex = 0;
    let playlistUUIDList = [];
    let playlistSize = -1;
    let audioPlayer = new Audio();

    document.addEventListener("DOMContentLoaded", async ()=> {
        let volume = localStorage.getItem("player.volume");
        if (volume)
        {
            playerVolumeInput.value = volume;
            audioPlayer.volume = volume/100;
        }

        let playerData = await apiFetch("/library/play-list-get")
        if (!playerData)
            return;
        let {songs, playlistUUID} = playerData;

        let index = 0;
        let time = 0;
        let state = await apiFetch("/library/player-get-state")
        if (state)
        {
            index = state.index;
            time = state.time;
        }

        playerPauseButton.hide();

        setPlaylist(songs, index, playlistUUID, false);
        audioPlayer.pause();

        audioPlayer.oncanplay = _ => {
            audioPlayer.oncanplay = null;
            audioPlayer.currentTime = time;
        }
    })















    /*
        $$$$$$$\  $$\        $$$$$$\ $$\     $$\ $$\       $$$$$$\  $$$$$$\ $$$$$$$$\
        $$  __$$\ $$ |      $$  __$$\\$$\   $$  |$$ |      \_$$  _|$$  __$$\\__$$  __|
        $$ |  $$ |$$ |      $$ /  $$ |\$$\ $$  / $$ |        $$ |  $$ /  \__|  $$ |
        $$$$$$$  |$$ |      $$$$$$$$ | \$$$$  /  $$ |        $$ |  \$$$$$$\    $$ |
        $$  ____/ $$ |      $$  __$$ |  \$$  /   $$ |        $$ |   \____$$\   $$ |
        $$ |      $$ |      $$ |  $$ |   $$ |    $$ |        $$ |  $$\   $$ |  $$ |
        $$ |      $$$$$$$$\ $$ |  $$ |   $$ |    $$$$$$$$\ $$$$$$\ \$$$$$$  |  $$ |
        \__|      \________|\__|  \__|   \__|    \________|\______| \______/   \__|

    */

    async function setPlaylist(songs, startIndex=0, playlistUUID=null, autoplay=true)
    {
        if (!Array.isArray(songs))
            songs = [songs];

        playerPlaylistUUID = playlistUUID;
        playlistUUIDList = songs;
        playlistIndex = startIndex;
        playlistSize = songs.length;

        await apiFetchJSON(`/library/play-list-register`, {songs, playlistUUID}, "POST");
        playSong(playlistUUIDList[playlistIndex], autoplay);
    }

    async function playSong(uuid, autoplay=true)
    {
        let track = (await apiRead("track", {uuid}))[0];
        apiFetch("/song/listen", {track: uuid, playlist: playerPlaylistUUID});

        playerTrackCover.innerHTML = albumCoverImg(track.album, "small");
        playerTrackInfo.innerHTML = `
        <b>${track.data.name}</b>
        <small>
            <span class="clickable" onclick="openArtist('${track.album.data.artist}')">${track.data.artist}</span> -
            <span class="clickable" onclick="openAlbum('${track.data.album}')">${track.album.data.name}</span>
        </small>
        `

        setMediaSession(track);
        setPageBackground(track.data.album);

        document.dispatchEvent(new CustomEvent("songStartPlaying", {detail: {track}}));
        audioPlayer.currentTime = 0;
        audioPlayer.src = `/api/song/read/` + uuid;

        if (autoplay)
            await audioPlayer.play();

        let accentColor = null;
        if (accentColor = track.album.data.accent_color_hex)
            document.body.style.setProperty(`--track-color`, accentColor);
        else
            processAlbumVibrantColor(playerTrackCover.querySelector("img"), track.data.album);
    }

    async function gotoNextSong()
    {
        if (playlistIndex === playlistSize-1)
            return false;

        playlistIndex++;
        playSong(playlistUUIDList[playlistIndex])
        return true;
    }

    async function gotoPreviousSong()
    {
        if (playlistIndex === 0)
            return false;

        playlistIndex--;
        playSong(playlistUUIDList[playlistIndex])
        return true;
    }













    /*
        $$$$$$$\  $$\        $$$$$$\ $$\     $$\ $$$$$$$$\ $$$$$$$\
        $$  __$$\ $$ |      $$  __$$\\$$\   $$  |$$  _____|$$  __$$\
        $$ |  $$ |$$ |      $$ /  $$ |\$$\ $$  / $$ |      $$ |  $$ |
        $$$$$$$  |$$ |      $$$$$$$$ | \$$$$  /  $$$$$\    $$$$$$$  |
        $$  ____/ $$ |      $$  __$$ |  \$$  /   $$  __|   $$  __$$<
        $$ |      $$ |      $$ |  $$ |   $$ |    $$ |      $$ |  $$ |
        $$ |      $$$$$$$$\ $$ |  $$ |   $$ |    $$$$$$$$\ $$ |  $$ |
        \__|      \________|\__|  \__|   \__|    \________|\__|  \__|

    */

    audioPlayer.addEventListener("play", ()=>
    {
        if ('mediaSession' in navigator)
            navigator.mediaSession.playbackState = "playing";

        refreshPlayButtonVisibility();
        enableScreenSaver();
    });

    audioPlayer.addEventListener("pause", ()=>
    {
        if ('mediaSession' in navigator)
            navigator.mediaSession.playbackState = "paused";

        refreshPlayButtonVisibility();
        disableScreenSaver();
    });

    audioPlayer.addEventListener("ended", _ => {
        console.log("SONG ENDED");
        if (!gotoNextSong())
            audioPlayer.pause();
    });












    /*
         $$$$$$\   $$$$$$\  $$\    $$\ $$$$$$$$\ $$$$$$$\
        $$  __$$\ $$  __$$\ $$ |   $$ |$$  _____|$$  __$$\
        $$ /  \__|$$ /  $$ |$$ |   $$ |$$ |      $$ |  $$ |
        $$ |      $$ |  $$ |\$$\  $$  |$$$$$\    $$$$$$$  |
        $$ |      $$ |  $$ | \$$\$$  / $$  __|   $$  __$$<
        $$ |  $$\ $$ |  $$ |  \$$$  /  $$ |      $$ |  $$ |
        \$$$$$$  | $$$$$$  |   \$  /   $$$$$$$$\ $$ |  $$ |
        \______/  \______/     \_/    \________|\__|  \__|
    */

    async function processAlbumVibrantColor(img, albumUUID, target=document.body)
    {
        function hslToHex(h, s, l) {
            l /= 100;
            const a = s * Math.min(l, 1 - l) / 100;
            const f = n => {
                const k = (n + h / 30) % 12;
                const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
                return Math.round(255 * color).toString(16).padStart(2, '0');   // convert to Hex and prefix "0" if needed
            };
            return `#${f(0)}${f(8)}${f(4)}`;
        }

        if (!img.complete)
            await new Promise( (res) => img.addEventListener("load", res));

        let vibrant = new Vibrant(img);
        let swatches = vibrant.swatches()

        let colors = Object.values(swatches)
        .filter(x => x)
        .map(x => x.getHsl())
        .sortByKey(([h,s,l]) => (s+l)/2 )
        .reverse()

        if (!colors.length)
            return console.warn("No color found for album " + albumUUID);

        let accentColorHSL = `hsl(${colors[0][0]*360}, 80%, 60%)`
        let accentColorHex = hslToHex(colors[0][0]*360, 80, 60);

        apiUpdate("album", {uuid: albumUUID, accent_color_hex: accentColorHex});

        if (colors.length)
            target.style.setProperty(`--track-color`, accentColorHex);
        else
            target.style.removeProperty(`--track-color`);
    }

    async function setPageBackground(albumUUID)
    {
        // Front fades into back image (new image)

        let front = backgroundCoverImageFront
        let back = backgroundCoverImageBack

        let loadPromise = new Promise(
            (resolve) => back.onload = _ => resolve()
        )
        back.src = albumCover(albumUUID)
        await loadPromise;

        await front.animateAsync([
            {opacity: 1},
            {opacity: 0}
        ], {duration: 500, easing: "ease"});

        back.style.zIndex = 3;
        front.style.zIndex = 2;

        front.src = back.src;

        back.style.zIndex = 2;
        front.style.zIndex = 3;
    }
    backgroundCoverImageBack.style.zIndex = 2;
    backgroundCoverImageFront.style.zIndex = 3;














    /*
        $$$$$$\   $$$$$$\  $$\   $$\ $$$$$$$$\ $$$$$$$\   $$$$$$\  $$\       $$$$$$\
        $$  __$$\ $$  __$$\ $$$\  $$ |\__$$  __|$$  __$$\ $$  __$$\ $$ |     $$  __$$\
        $$ /  \__|$$ /  $$ |$$$$\ $$ |   $$ |   $$ |  $$ |$$ /  $$ |$$ |     $$ /  \__|
        $$ |      $$ |  $$ |$$ $$\$$ |   $$ |   $$$$$$$  |$$ |  $$ |$$ |     \$$$$$$\
        $$ |      $$ |  $$ |$$ \$$$$ |   $$ |   $$  __$$< $$ |  $$ |$$ |      \____$$\
        $$ |  $$\ $$ |  $$ |$$ |\$$$ |   $$ |   $$ |  $$ |$$ |  $$ |$$ |     $$\   $$ |
        \$$$$$$  | $$$$$$  |$$ | \$$ |   $$ |   $$ |  $$ | $$$$$$  |$$$$$$$$\\$$$$$$  |
        \______/  \______/ \__|  \__|   \__|   \__|  \__| \______/ \________|\______/
    */


    async function rewind()
    {
        if (!audioPlayer.src)
            return;

        audioPlayer.currentTime = 0;
    }


    async function refreshPlayButtonVisibility()
    {
        if (audioPlayer.paused)
        {
            playerPlayButton.show()
            playerPauseButton.hide()
        }
        else
        {
            playerPauseButton.show()
            playerPlayButton.hide()
        }
    }



    playerPreviousButton.addEventListener("click", _ => rewind());
    playerPreviousButton.addEventListener("dblclick", _ => gotoPreviousSong());
    playerPauseButton.addEventListener("click", _ => audioPlayer.pause());
    playerPlayButton.addEventListener("click", _ => audioPlayer.play());
    playerNextButton.addEventListener("click", _ => gotoNextSong());

    setInterval(async _ => {
        if (audioPlayer.paused)
            return;

        await apiFetchJSON("/library/player-register-state", {
            index: playlistIndex,
            time: audioPlayer.currentTime
        }, "POST");

    }, 10000);


    async function refreshPlayerState()
    {
        if (!audioPlayer.src)
            return;

        let duration = Math.round(audioPlayer.duration)
        let currentTime = Math.round(audioPlayer.currentTime)

        let progressTime = Math.round(audioPlayer.currentTime * PLAYER_PROGRESS_RESOLUTION);

        playerProgress.setAttribute("value", progressTime)
        playerProgressInfo.innerText = `${digitsDuration(currentTime)} / ${digitsDuration(duration)}`

        if (!('mediaSession' in navigator))
            return alert("Could not start the thing !");

        if ((!audioPlayer.src) || audioPlayer.paused)
            return;

        if (!(
            audioPlayer.duration &&
            audioPlayer.playbackRate &&
            audioPlayer.currentTime
        )) return;

        navigator.mediaSession.setPositionState({
            duration: audioPlayer.duration,
            playbackRate: audioPlayer.playbackRate,
            position: audioPlayer.currentTime
        });
    }

    playerProgress.addEventListener("click", (event)=>{
        let box = playerProgress.getBoundingClientRect();
        let x = event.clientX;

        let toGoto = Math.map(event.clientX, box.x, box.x + box.width, 0, audioPlayer.duration)

        audioPlayer.pause();
        audioPlayer.currentTime = Math.floor(toGoto);
        audioPlayer.play();

        playerProgress.setAttribute("value", toGoto * PLAYER_PROGRESS_RESOLUTION)
    })

    audioPlayer.addEventListener("canplaythrough", _ => {
        playerProgress.setAttribute("max", Math.floor(audioPlayer.duration) * PLAYER_PROGRESS_RESOLUTION);
    });

    setInterval(refreshPlayerState, 200);
    playerProgress.setAttribute("max", 1);
    playerProgress.setAttribute("value", 0);








    function updatePlayerVolume()
    {
        audioPlayer.volume = parseInt(playerVolumeInput.value)/100;
    }

    updatePlayerVolume();
    playerVolumeInput.addEventListener("mousemove", updatePlayerVolume)

    playerVolumeInput.addEventListener("change", ()=>{
        updatePlayerVolume()
        localStorage.setItem("player.volume", playerVolumeInput.value);
    })


    audioPlayer.addEventListener("volumechange", _ => {
        playerVolumeInput.value = Math.round(audioPlayer.volume * 100);
    })

    document.addEventListener("keydown", (event)=>{
        if (event.code != "Space")
            return;

        if (document.activeElement != document.body)
            return;

        event.preventDefault();
        event.stopPropagation();

        audioPlayer.paused ?
            audioPlayer.play():
            audioPlayer.pause();

        return false;
    })


    audioPlayer.pause()

















    /*
        $$\      $$\ $$$$$$$$\ $$$$$$$$\  $$$$$$\  $$$$$$$\   $$$$$$\ $$$$$$$$\  $$$$$$\
        $$$\    $$$ |$$  _____|\__$$  __|$$  __$$\ $$  __$$\ $$  __$$\\__$$  __|$$  __$$\
        $$$$\  $$$$ |$$ |         $$ |   $$ /  $$ |$$ |  $$ |$$ /  $$ |  $$ |   $$ /  $$ |
        $$\$$\$$ $$ |$$$$$\       $$ |   $$$$$$$$ |$$ |  $$ |$$$$$$$$ |  $$ |   $$$$$$$$ |
        $$ \$$$  $$ |$$  __|      $$ |   $$  __$$ |$$ |  $$ |$$  __$$ |  $$ |   $$  __$$ |
        $$ |\$  /$$ |$$ |         $$ |   $$ |  $$ |$$ |  $$ |$$ |  $$ |  $$ |   $$ |  $$ |
        $$ | \_/ $$ |$$$$$$$$\    $$ |   $$ |  $$ |$$$$$$$  |$$ |  $$ |  $$ |   $$ |  $$ |
        \__|     \__|\________|   \__|   \__|  \__|\_______/ \__|  \__|  \__|   \__|  \__|
    */

    async function setMediaSession(track)
    {
        if (!('mediaSession' in navigator))
            return alert("Could not start the thing !")

        let metadata = new MediaMetadata({
            title: track.data.name,
            artist: track.data.artist,
            album: track.album.data.name,
            artwork: [{ src: location.origin + albumCover(track.data.album)}]
        })
        navigator.mediaSession.metadata = metadata

        navigator.mediaSession.setActionHandler('play', _ => audioPlayer.play());
        navigator.mediaSession.setActionHandler('pause', _ => audioPlayer.pause());
        navigator.mediaSession.setActionHandler('previoustrack', _ => gotoPreviousSong());
        navigator.mediaSession.setActionHandler('nexttrack', _ => gotoNextSong());
        //navigator.mediaSession.setActionHandler('seekbackward', function() );
        //navigator.mediaSession.setActionHandler('seekforward', function() {});
    }


    function refreshTrackPlayingClassTracker()
    {
        let uuid = playlistUUIDList[playlistIndex]

        pageContent.querySelectorAll(".playing").forEach(x => {
            x.classList.remove("playing");
        })

        pageContent.querySelectorAll(`[track='${uuid}']`).forEach(x => {
            x.classList.add("playing");
        })
    }

    document.addEventListener("songStartPlaying", refreshTrackPlayingClassTracker)
    document.addEventListener("pageContentEdited", refreshTrackPlayingClassTracker)


</script>