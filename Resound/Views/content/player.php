<section class="player gap-10 flex-row" id="player">
    <section class="flex-row align-center gap-2" id="playerControls">
        <button id="playerPreviousButton" title="Go to previous track">
            <?= svg("chevron-left") ?>
        </button>
        <button id="playerPauseButton" title="Pause">
            <?= svg("pause-fill") ?>
        </button>
        <button id="playerPlayButton" title="Play / Resume">
            <?= svg("caret-right-fill") ?>
        </button>
        <button id="playerNextButton" title="Go to next track">
            <?= svg("chevron-right") ?>
        </button>
        <button id="moodModeButton" title="Listen to similar tracks !">
            <?= svg("vinyl-fill") ?>
        </button>
    </section>

    <section class="flex-row flex-1">
        <section id="playerTrackCover"></section>
        <section class="flex-column gap-0 flex-1">
            <section class="flex-column gap-0" id="playerTrackInfo"></section>
            <section class="flex-row align-center flex-1" id="playerProgressSection">

                <section class="player-progress">
                    <section id="playerProgress" class="progress-bar"></section>
                </section>

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
<?= script("player.js") ?>