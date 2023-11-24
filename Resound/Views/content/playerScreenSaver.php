<section id="screenSaver">
    <img id="screenSaverBackground">
    <section id="screenSaverContent" class="flex-column align-center">
        <img id="screenSaverCover" style="box-shadow: var(--track-color) 0px 0px 6px">
        <section class="flex-column align-center gap-0" id="screenSaverInfo"></section>

    </section>
</section>

<script>

    const SCREEN_SAVER_DELAY_SECONDS = 7;

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
        if (!screenSaverIsEnabled)
            return;

        screenSaverIsDisplayed = true;

        for (const EVENT of SCREEN_SAVER_EVENTS)
            document.addEventListener(EVENT, hideScreenSaverOnMove);

        screenSaver.fadeIn();
    }

    function hideScreenSaver()
    {
        screenSaverIsDisplayed = false;

        for (const EVENT of SCREEN_SAVER_EVENTS)
            document.removeEventListener(EVENT, hideScreenSaverOnMove);

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

        screenSaverTimeout = setTimeout(displayScreenSaver, SCREEN_SAVER_DELAY_SECONDS*1000);
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

    document.addEventListener("songStartPlaying", ({detail}) => {
        let {track} = detail;

        screenSaverBackground.src =
        screenSaverCover.src =
            albumCover(track.data.album);

        screenSaverInfo.innerHTML = `
            <b>${track.data.name}</b>
            <small>${track.album.data.name}</small>
            <small>${track.data.artist}</small>
        `
    })

</script>