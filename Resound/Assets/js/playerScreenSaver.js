

const SCREEN_SAVER_ELEMENT = document.createElement("section");
SCREEN_SAVER_ELEMENT.id = "screenSaver";
SCREEN_SAVER_ELEMENT.innerHTML = `
<img id="screenSaverBackground">
<section id="screenSaverContent" class="flex-row align-center">
    <section id="vinylSection">
        <canvas class="frequencyRythmCanvas"></canvas>
        <img id="screenSaverCover" style="box-shadow: var(--track-color) 0px 0px 6px">
    </section>
    <section class="flex-column">
        <section class="flex-column align-center gap-0" id="screenSaverInfo"></section>
        <section class="flex-row flex-wrap" id="screenSaverControls">
            <button id="screenSaverPreviousButton" title="Go to previous track">
                ${ svg("chevron-left", 32) }
            </button>
            <button id="screenSaverPauseButton" title="Pause">
                ${ svg("pause-fill", 32) }
            </button>
            <button id="screenSaverPlayButton" title="Play / Resume">
                ${ svg("caret-right-fill", 32) }
            </button>
            <button id="screenSaverNextButton" title="Go to next track">
                ${ svg("chevron-right", 32) }
            </button>
            <button id="screenSaverMoodButton" title="Enable mood mode">
                ${ svg("vinyl-fill", 32) }
            </button>
            <button id="screenSaverUnlockButton" title="Unlock the screen">
                ${ svg("unlock", 32) }
            </button>
        </section>
    </section>
</section>
`
document.body.appendChild(SCREEN_SAVER_ELEMENT);

const SCREEN_SAVER_DELAY_SECONDS = 15;

const SCREEN_SAVER_EVENTS = [
    "mousemove",
    "click",
    "scroll"
];

screenSaver.style.display = "none";

let screenSaverTimeout = null

let screenSaverIsDisplayed = false;
let screenSaverIsEnabled = false;

function displayScreenSaver()
{
    if ((!screenSaverIsEnabled) || screenSaverIsDisplayed)
        return;

    screenSaverIsDisplayed = true;

    if (!isMobile())
    {
        for (const EVENT of SCREEN_SAVER_EVENTS)
            document.addEventListener(EVENT, hideScreenSaverOnMove);
    }

    screenSaver.fadeIn();

    screenSaverPreviousButton.addEventListener("click", _ => {
        playerPreviousButton.click();
    });
    screenSaverPauseButton.addEventListener("click", _ => {
        playerPreviousButton.dispatchEvent(new Event("dblclick"))
    });
    screenSaverPlayButton.addEventListener("click", _ => {
        playerPlayButton.click();
    });
    screenSaverNextButton.addEventListener("click", _ => {
        playerNextButton.click();
    });
    screenSaverMoodButton.addEventListener("click", _ => {
        moodModeButton.click();
    });


    screenSaverUnlockButton.addEventListener("click", _ => {
        hideScreenSaver();
    })

    if (!isMobile())
        screenSaverControls.hide();
}

function hideScreenSaver()
{
    if (!screenSaverIsDisplayed)
        return;

    screenSaverIsDisplayed = false;

    if (!isMobile())
    {
        for (const EVENT of SCREEN_SAVER_EVENTS)
            document.removeEventListener(EVENT, hideScreenSaverOnMove);
    }

    screenSaver.fadeOut();
}

function hideScreenSaverOnMove()
{
    if (screenSaverIsDisplayed)
        hideScreenSaver();
}

function refreshScreeSaverTimeout()
{
    if (screenSaverTimeout)
        clearTimeout(screenSaverTimeout);

    screenSaverTimeout = setTimeout(displayScreenSaver, SCREEN_SAVER_DELAY_SECONDS * 1000);
}


function enableScreenSaver()
{
    screenSaverIsEnabled = true;

    for (const EVENT of SCREEN_SAVER_EVENTS)
        document.addEventListener(EVENT, refreshScreeSaverTimeout);

    if (!screenSaverIsDisplayed)
        refreshScreeSaverTimeout()
}

function disableScreenSaver()
{
    screenSaverIsEnabled = false;

    for (const EVENT of SCREEN_SAVER_EVENTS)
        document.removeEventListener(EVENT, refreshScreeSaverTimeout);
}

document.addEventListener("songStartPlaying", ({ detail }) => {
    let { track } = detail;

    screenSaverBackground.src =
        screenSaverCover.src =
        albumCover(track.data.album);

    screenSaverInfo.innerHTML = `
        <b class="oneliner">${track.data.name}</b>
        <small class="oneliner">${track.data.artist}</small>
        <small class="oneliner">${track.album.data.name}</small>
    `
});

document.addEventListener("DOMContentLoaded", _ => {
    audioPlayer.addEventListener("play", () => {
        screenSaverCover.classList.add("currently-playing")
    })
    audioPlayer.addEventListener("playing", () => {
        screenSaverCover.classList.add("currently-playing")
    })
    audioPlayer.addEventListener("pause", () => {
        screenSaverCover.classList.remove("currently-playing")
    })
    audioPlayer.addEventListener("ended", () => {
        screenSaverCover.classList.remove("currently-playing")
    })
});



