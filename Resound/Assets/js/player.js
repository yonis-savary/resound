
const PLAYER_PROGRESS_RESOLUTION = 20;

if (isMobile())
{
    player.classList.replace("flex-row", "flex-column");
    player.classList.replace("gap-10", "gap-3");

    playerVolumeInput.removeAttribute("orient");

    screenSaverInfo.classList.add("h4");

    playerControls.appendChild(playerVolumeButton)

    const getOrientation = _ => window.innerWidth > window.innerHeight ? "horizontal": "vertical";
    let lastOrientation = null;

    window.addEventListener("resize", _ => {
        let currentOrientation = getOrientation();

        if (currentOrientation == lastOrientation)
            return;

        switch (currentOrientation)
        {
            case "horizontal":
                screenSaverContent.classList.replace("flex-column", "flex-row");
                player.classList.replace("flex-column", "flex-row");
                break;

            case "vertical":
                screenSaverContent.classList.replace("flex-row", "flex-column");
                player.classList.replace("flex-row", "flex-column");
                break;
        }

        lastOrientation = currentOrientation;
    });
    window.dispatchEvent(new Event("resize"));
}


let playerPlaylistID = null;

let tracklistIndex = 0;
let tracklistIdList = [];
let tracklistSize = -1;
let audioPlayer = new Audio();

document.addEventListener("DOMContentLoaded", async () => {
    let volume = localStorage.getItem("player.volume");
    if (volume) {
        playerVolumeInput.value = volume;
        audioPlayer.volume = volume / 100;
    }

    let playerData = await apiFetch("/library/play-list-get")
    if (!playerData)
        return;
    let { songs, playlistID } = playerData;

    let index = 0;
    let time = 0;
    let state = await apiFetch("/library/player-get-state")
    if (state) {
        index = state.index;
        time = state.time;
    }

    // Registered player state may be invalid (ex: index = 30 where songs.length = 10)
    // In this case we keep the tracklist but reset its "progression"
    if (index > songs.length)
    {
        console.error("Invalid player state, reseting playlist");
        index = 0;
        time = 0;
    }

    playerPauseButton.hide();

    setTracklist(songs, index, playlistID, false);
    audioPlayer.pause();

    audioPlayer.oncanplay = _ => {
        audioPlayer.oncanplay = null;
        audioPlayer.currentTime = time;
    }
})






/*

$$$$$$$$\ $$$$$$$\   $$$$$$\   $$$$$$\  $$\   $$\ $$\       $$$$$$\  $$$$$$\ $$$$$$$$\
\__$$  __|$$  __$$\ $$  __$$\ $$  __$$\ $$ | $$  |$$ |      \_$$  _|$$  __$$\\__$$  __|
   $$ |   $$ |  $$ |$$ /  $$ |$$ /  \__|$$ |$$  / $$ |        $$ |  $$ /  \__|  $$ |
   $$ |   $$$$$$$  |$$$$$$$$ |$$ |      $$$$$  /  $$ |        $$ |  \$$$$$$\    $$ |
   $$ |   $$  __$$< $$  __$$ |$$ |      $$  $$<   $$ |        $$ |   \____$$\   $$ |
   $$ |   $$ |  $$ |$$ |  $$ |$$ |  $$\ $$ |\$$\  $$ |        $$ |  $$\   $$ |  $$ |
   $$ |   $$ |  $$ |$$ |  $$ |\$$$$$$  |$$ | \$$\ $$$$$$$$\ $$$$$$\ \$$$$$$  |  $$ |
   \__|   \__|  \__|\__|  \__| \______/ \__|  \__|\________|\______| \______/   \__|

*/

async function setTracklist(songs, startIndex = 0, playlistID = null, autoplay = true)
{
    if (!Array.isArray(songs))
        songs = [songs];

    playerPlaylistID = playlistID;
    tracklistIdList = songs;
    tracklistIndex = startIndex;
    tracklistSize = songs.length;

    await apiFetchJSON(`/library/play-list-register`, { songs, playlistID }, "POST");
    playSong(tracklistIdList[tracklistIndex], autoplay);
}

let playedSongID = null;
async function playSong(id, autoplay = true)
{
    if (playedSongID === id)
        return;
    playedSongID = id;

    // When downloading a long track, the network is blocked until the file is completely sent
    // Stop the current media download, useful if skiping a long track
    // https://developer.mozilla.org/en-US/docs/Web/Media/Audio_and_video_delivery#other_tips_for_audiovideo
    audioPlayer.removeAttribute("src");
    audioPlayer.load();

    let track = (await apiRead("track", { id }))[0];
    apiFetch("/song/listen", { track: id, playlist: playerPlaylistID });

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

    document.dispatchEvent(new CustomEvent("songStartPlaying", { detail: { track } }));
    audioPlayer.src = `/api/song/read/` + id;

    if (autoplay)
    {
        await audioPlayer.play();
        audioPlayer.currentTime = 0;
    }

    let accentColor = null;
    if (accentColor = track.album.data.accent_color_hex)
        document.body.style.setProperty(`--track-color`, accentColor);
    else
        processAlbumVibrantColor(playerTrackCover.querySelector("img"), track.data.album);

    document.dispatchEvent(new Event("songChanged"));
}

async function gotoNextSong()
{
    if (tracklistIndex === tracklistSize - 1)
        return false;

    tracklistIndex++;
    playSong(tracklistIdList[tracklistIndex])
    return true;
}

async function gotoPreviousSong()
{
    if (tracklistIndex === 0)
        return false;

    tracklistIndex--;
    playSong(tracklistIdList[tracklistIndex])
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

audioPlayer.addEventListener("play", () => {
    if ('mediaSession' in navigator)
        navigator.mediaSession.playbackState = "playing";

    refreshPlayButtonVisibility();
    enableScreenSaver();
});

audioPlayer.addEventListener("pause", () => {
    if ('mediaSession' in navigator)
        navigator.mediaSession.playbackState = "paused";

    refreshPlayButtonVisibility();
    disableScreenSaver();
});

audioPlayer.addEventListener("ended", _ => {
    console.log("SONG ENDED", audioPlayer.currentTime, audioPlayer.duration);
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

async function processAlbumVibrantColor(img, albumID, target = document.body)
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
        await new Promise((res) => img.addEventListener("load", res));

    let vibrant = new Vibrant(img);
    let swatches = vibrant.swatches()

    let colors = Object.values(swatches)
        .filter(x => x)
        .map(x => x.getHsl())
        .sortByKey(([h, s, l]) => (s + l) / 2)
        .reverse()

    if (!colors.length)
        return console.warn("No color found for album " + albumID);

    let accentColorHSL = `hsl(${colors[0][0] * 360}, 80%, 60%)`
    let accentColorHex = hslToHex(colors[0][0] * 360, 80, 60);

    apiUpdate("album", { id: albumID, accent_color_hex: accentColorHex });

    if (colors.length)
        target.style.setProperty(`--track-color`, accentColorHex);
    else
        target.style.removeProperty(`--track-color`);
}

async function setPageBackground(albumID)
{
    // Front fades into back image (new image)

    let front = backgroundCoverImageFront
    let back = backgroundCoverImageBack

    let loadPromise = new Promise(
        (resolve) => back.onload = _ => resolve()
    )
    back.src = albumCover(albumID)
    await loadPromise;

    await front.animateAsync([
        { opacity: 1 },
        { opacity: 0 }
    ], { duration: 800, easing: "ease" });

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
        index: tracklistIndex,
        time: audioPlayer.currentTime
    }, "POST");

}, 10000);


async function refreshPlayerState()
{
    if (!audioPlayer.src)
        return;

    let duration = Math.round(audioPlayer.duration)
    let currentTime = Math.round(audioPlayer.currentTime)

    playerProgress.style.width = (( currentTime * 100 ) / duration) + "%"
    playerProgressInfo.innerText = `${digitsDuration(currentTime)} / ${digitsDuration(duration)}`

    if (!('mediaSession' in navigator))
        return alert("Could not start the thing !");

    if ((!audioPlayer.src) || audioPlayer.paused)
        return;

    if (!audioPlayer.duration)
        return;

    try
    {
        let data = {
            duration: audioPlayer.duration,
            position: audioPlayer.currentTime
        };
        navigator.mediaSession.setPositionState(data);
    }
    catch(error)
    {
        notifyInfo(error);
        apiFetch(error);
    }
}

playerProgress.parentNode.addEventListener("click", (event) => {
    let box = playerProgress.parentNode.getBoundingClientRect();
    let toGoto = Math.map(event.clientX, box.x, box.x + box.width, 0, audioPlayer.duration)

    audioPlayer.pause();
    audioPlayer.currentTime = Math.floor(toGoto);
    audioPlayer.play();
})

setInterval(refreshPlayerState, 200);








function updatePlayerVolume()
{
    audioPlayer.volume = parseInt(playerVolumeInput.value) / 100;
}

updatePlayerVolume();
playerVolumeInput.addEventListener("mousemove", updatePlayerVolume)

playerVolumeInput.addEventListener("change", () => {
    updatePlayerVolume()
    localStorage.setItem("player.volume", playerVolumeInput.value);
})


audioPlayer.addEventListener("volumechange", _ => {
    playerVolumeInput.value = Math.round(audioPlayer.volume * 100);
})

document.addEventListener("keydown", (event) => {
    if (event.code != "Space")
        return;

    if (document.activeElement != document.body)
        return;

    event.preventDefault();
    event.stopPropagation();

    audioPlayer.paused ?
        audioPlayer.play() :
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

let handleMoodLauncherTimeout
let lastHandleMoodLauncher = null
async function handleMoodLauncher()
{
    if (handleMoodLauncherTimeout) {
        clearTimeout(handleMoodLauncherTimeout);
        handleMoodLauncherTimeout = null;
        moodModeButton.click();

        audioPlayer.pause();
        await playAudioEffect("mode-mode-activation.wav")
        audioPlayer.play();

        return;
    }

    handleMoodLauncherTimeout = setTimeout(_ => {
        clearTimeout(handleMoodLauncherTimeout);
        handleMoodLauncherTimeout = null;
        gotoNextSong();
    }, 1000);
}


let handleShuffleLauncherTimeout
let lastHandleShuffleLauncher = null
async function handleShuffleLauncher()
{
    if (handleShuffleLauncherTimeout) {
        clearTimeout(handleShuffleLauncherTimeout);
        handleShuffleLauncherTimeout = null;
        shuffleAllLibrary()
        return;
    }

    handleShuffleLauncherTimeout = setTimeout(_ => {
        clearTimeout(handleShuffleLauncherTimeout);
        handleShuffleLauncherTimeout = null;
        gotoPreviousSong();
    }, 1000);
}


async function setMediaSession(track)
{
    if (!('mediaSession' in navigator))
        return alert("Could not start the thing !")

    let metadata = new MediaMetadata({
        title: track.data.name,
        artist: track.data.artist,
        album: track.album.data.name,
        artwork: [{ src: location.origin + albumCover(track.data.album) }]
    })

    navigator.mediaSession.metadata = metadata

    const handlers = [
        ['play', _ => audioPlayer.play()],
        ['pause', _ => audioPlayer.pause()],
        ['previoustrack', _ => handleShuffleLauncher()],
        ['nexttrack', _ => handleMoodLauncher()],
        ['seekto', (details) => {
            audioPlayer.currentTime = details.seekTime;
        }],
        //["seekbackward", (data) => { console.log('seekBackward: data: ', data);}],
        //["seekforward", (data) => { console.log('seekForward: data: ', data);}],
    ];

    for (const [action, handler] of handlers) {
        try {
            navigator.mediaSession.setActionHandler(action, event => {
                console.log(action, event);
                (handler)(event);
                refreshPlayerState();
            });
        } catch (error) {
            console.warn("Action not supported : " + action);
        }
    }


}


function refreshTrackPlayingClassTracker()
{
    let id = tracklistIdList[tracklistIndex]

    pageContent.querySelectorAll(".playing").forEach(x => {
        x.classList.remove("playing");
    })

    pageContent.querySelectorAll(`[track='${id}']`).forEach(x => {
        x.classList.add("playing");
    })
}

document.addEventListener("songStartPlaying", refreshTrackPlayingClassTracker)
document.addEventListener("pageContentEdited", refreshTrackPlayingClassTracker)




















/*
$$\      $$\  $$$$$$\   $$$$$$\  $$$$$$$\
$$$\    $$$ |$$  __$$\ $$  __$$\ $$  __$$\
$$$$\  $$$$ |$$ /  $$ |$$ /  $$ |$$ |  $$ |
$$\$$\$$ $$ |$$ |  $$ |$$ |  $$ |$$ |  $$ |
$$ \$$$  $$ |$$ |  $$ |$$ |  $$ |$$ |  $$ |
$$ |\$  /$$ |$$ |  $$ |$$ |  $$ |$$ |  $$ |
$$ | \_/ $$ | $$$$$$  | $$$$$$  |$$$$$$$  |
\__|     \__| \______/  \______/ \_______/
*/


moodModeButton.addEventListener("click", async _ => {
    let playlist = await apiFetch("/mood/generate/" + playedSongID);
    playlist = playlist.map(x => x.id);
    playlist.unshift(playedSongID);
    setTracklist(playlist);

    let vinyl = moodModeButton.querySelector("svg")
    vinyl.style.transition = "all 300ms";
    vinyl.style.color = "#F99";
    await sleep(300);
    await vinyl.animateAsync([
        { filter: "hue-rotate(0deg)" },
        { filter: "hue-rotate(360deg)" },
    ], { duration: 500 });
    vinyl.style.color = "white";
});






















/*
$$$$$$$$\ $$$$$$$\  $$$$$$$$\  $$$$$$\  $$\   $$\ $$$$$$$$\ $$\   $$\  $$$$$$\ $$\     $$\
$$  _____|$$  __$$\ $$  _____|$$  __$$\ $$ |  $$ |$$  _____|$$$\  $$ |$$  __$$\\$$\   $$  |
$$ |      $$ |  $$ |$$ |      $$ /  $$ |$$ |  $$ |$$ |      $$$$\ $$ |$$ /  \__|\$$\ $$  /
$$$$$\    $$$$$$$  |$$$$$\    $$ |  $$ |$$ |  $$ |$$$$$\    $$ $$\$$ |$$ |       \$$$$  /
$$  __|   $$  __$$< $$  __|   $$ |  $$ |$$ |  $$ |$$  __|   $$ \$$$$ |$$ |        \$$  /
$$ |      $$ |  $$ |$$ |      $$ $$\$$ |$$ |  $$ |$$ |      $$ |\$$$ |$$ |  $$\    $$ |
$$ |      $$ |  $$ |$$$$$$$$\ \$$$$$$ / \$$$$$$  |$$$$$$$$\ $$ | \$$ |\$$$$$$  |   $$ |
\__|      \__|  \__|\________| \___$$$\  \______/ \________|\__|  \__| \______/    \__|
                                   \___|
*/

// https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Visualizations_with_Web_Audio_API#creating_a_frequency_bar_graph
// https://stackoverflow.com/a/61090373
// 🙏

const audioContext = new(window.AudioContext || window.webkitAudioContext)();

audioPlayer.addEventListener("play", _ => audioContext.resume());
const source = audioContext.createMediaElementSource(audioPlayer);

// Create an analyser
const analyser = audioContext.createAnalyser();
analyser.fftSize = 256;

const bufferLength = analyser.frequencyBinCount;
const dataArray = new Uint8Array(bufferLength);

// Connect parts
source.connect(analyser);
analyser.connect(audioContext.destination);

const usualBytesRange = bufferLength * .6;

const bassSamplesSize = [Math.round(usualBytesRange*.0), Math.round(usualBytesRange*.1)];
const mediumSamplesSize = [Math.round(usualBytesRange*.1)+1, Math.round(usualBytesRange*.5)];
const highSamplesSize = [Math.round(usualBytesRange*.5)+1, bufferLength];

const frequencyCanvas = document.querySelector(".frequencyRythmCanvas");

frequencyCanvas.width = 256;
frequencyCanvas.height = 256;

const frequencyContext = frequencyCanvas.getContext("2d");
frequencyContext.fillStyle = "#FFFFFF55";

let blockedFrequencyCircles = false;


async function drawFrequencyCircles()
{
    if (blockedFrequencyCircles)
        return;

    analyser.getByteFrequencyData(dataArray);

    const size = frequencyCanvas.width;
    const halfSize = size/2;

    const MAX_BASS = Math.max(...dataArray.slice(...bassSamplesSize));
    const BASS_RADIUS = (MAX_BASS * (halfSize * .9 )) / 256;

    const MAX_MEDIUM = Math.max(...dataArray.slice(...mediumSamplesSize));
    const MEDIUM_RADIUS = (MAX_MEDIUM * (halfSize * .8) ) / 256;

    const MAX_HIGH = Math.max(...dataArray.slice(...highSamplesSize));
    const HIGH_RADIUS = (MAX_HIGH * (halfSize * 1)) / 200;

    frequencyContext.clearRect(0, 0, size, size);

    frequencyContext.beginPath();
    frequencyContext.arc(size/2, size/2, BASS_RADIUS, 0, Math.PI*2);
    frequencyContext.fill();

    frequencyContext.beginPath();
    frequencyContext.arc(size/2, size/2, MEDIUM_RADIUS, 0, Math.PI*2);
    frequencyContext.fill();

    frequencyContext.beginPath();
    frequencyContext.arc(size/2, size/2, HIGH_RADIUS, 0, Math.PI*2);
    frequencyContext.fill();

    if (!audioPlayer.paused)
        requestAnimationFrame(drawFrequencyCircles);
}

document.addEventListener("songChanged", _ => {
    frequencyContext.fillStyle = document.body.style.getPropertyValue("--track-color") + "33";
})

if ('getBattery' in navigator)
{
    setInterval(async _ => {
        let battery = await navigator.getBattery()

        if (battery.level >= .5)
        {
            blockedFrequencyCircles = false;
        }
        else if (!blockedFrequencyCircles)
        {
            blockedFrequencyCircles = true;
            const size = frequencyCanvas.width;
            frequencyContext.clearRect(0, 0, size, size);
            console.info("Blocking frequency circles to save battery")
        }
    }, 1000*120);
}

audioPlayer.addEventListener("play", drawFrequencyCircles);



















/*
 $$$$$$\   $$$$$$\  $$$$$$$\  $$$$$$$$\ $$$$$$$$\ $$\   $$\ $$\       $$$$$$\   $$$$$$\  $$\   $$\
$$  __$$\ $$  __$$\ $$  __$$\ $$  _____|$$  _____|$$$\  $$ |$$ |     $$  __$$\ $$  __$$\ $$ | $$  |
$$ /  \__|$$ /  \__|$$ |  $$ |$$ |      $$ |      $$$$\ $$ |$$ |     $$ /  $$ |$$ /  \__|$$ |$$  /
\$$$$$$\  $$ |      $$$$$$$  |$$$$$\    $$$$$\    $$ $$\$$ |$$ |     $$ |  $$ |$$ |      $$$$$  /
 \____$$\ $$ |      $$  __$$< $$  __|   $$  __|   $$ \$$$$ |$$ |     $$ |  $$ |$$ |      $$  $$<
$$\   $$ |$$ |  $$\ $$ |  $$ |$$ |      $$ |      $$ |\$$$ |$$ |     $$ |  $$ |$$ |  $$\ $$ |\$$\
\$$$$$$  |\$$$$$$  |$$ |  $$ |$$$$$$$$\ $$$$$$$$\ $$ | \$$ |$$$$$$$$\ $$$$$$  |\$$$$$$  |$$ | \$$\
 \______/  \______/ \__|  \__|\________|\________|\__|  \__|\________|\______/  \______/ \__|  \__|
*/

if  ('wakeLock' in navigator)
{
    let screenLock = null;

    audioPlayer.addEventListener("play", async _ => {
        try {
           screenLock = await navigator.wakeLock.request('screen');
        } catch(err) {
            console.error(err);
           return;
        }
    });

    audioPlayer.addEventListener("pause", async _ => {
        if (!screenLock)
            return;

        screenLock.release();
        screenLock = null;
    });
}