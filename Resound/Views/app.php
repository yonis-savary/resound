<?php

use Resound\Classes\Straws\UserUUID;
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="shortcut icon" href="<?= asset("resound.png") ?>" type="image/x-icon">
    <?= style("assets-kit/style.css") ?>
    <?= style("resound.css") ?>
    <title>Resound</title>
</head>
<body>
    <?= assetsKitJSBundle() ?>

    <input type="hidden" id="userUUIDInput" value="<?= UserUUID::get() ?>">


    <script>

        const albumCover = uuid => `/api/library/album-cover/${uuid}`;

        const userUUID = _ => userUUIDInput.value;

        function albumCoverImg(album, className="") {
            return `<img
                style="width: 100%"
                album="${album.data.uuid}"
                src="${albumCover(album.data.uuid)}"
                loading="lazy"
                class="album-cover ${className} clickable"
                onclick="openAlbum('${album.data.uuid}')"
            >`
        }

        const prettyDuration = seconds => {
            if (seconds < 60)
                return `${seconds}s`;

            if (seconds < 3600)
                return `${Math.floor(seconds/60)}m ${seconds%60}s`;

            let hours = Math.floor(seconds / 3600);
            let minutes = Math.floor((seconds % 3600) / 60);
            seconds %= 60;

            return `${hours}h ${minutes}m ${seconds}s`;
        }

        const digitsDuration = seconds => {
            let hours = Math.floor(seconds / 3600);
            let minutes = Math.floor(seconds / 60);
            seconds %= 60;

            if (hours)
                return [hours, minutes, seconds].map(x => x.toString().padStart(2, "0")).join(":");

            return [minutes, seconds].map(x => x.toString().padStart(2, "0")).join(":");
        }

        const changePageContentTo = async (content)=>
        {
            await pageContent.fadeOut()
            pageContent.style.removeProperty("--track-color")
            pageContent.innerHTML = content;
            addOverlayListeners();
            addMenuListeners();
            await pageContent.fadeIn();
            document.dispatchEvent(new Event("PageContentChanged"));
        }

        if (isMobile())
        {
            let navbar = document.querySelector(".navbar")
            navbar.style.background = "black";

            for (let [source, target] of [
                ["fill-left", "fill-top"],
                ["fill-right", "fill-bottom"]
            ]) {
                navbar.querySelectorAll("." + source).forEach(x => x.classList.replace(source, target));
            }

        }

        /**
         * edited version of https://stackoverflow.com/a/12646864
         * return a clone of the array
         */
        function shuffleArray(original) {
            let array = [].concat(...original);

            for (let i = array.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [array[i], array[j]] = [array[j], array[i]];
            }

            return array;
        }

        function renderAlbumPreview(album)
        {
            return `
            <section
                album="${album.data.uuid}"
                class="flex-column gap-0 album-container"
                title="${album.data.name} by ${album.artist.data.name}"
            >
                ${albumCoverImg(album)}
                <b class="clickable" onclick="openAlbum('${album.data.uuid}')">${album.data.name}</b>
                <small class="clickable" onclick="openArtist('${album.data.artist}')">${album.artist.data.name}</small>
            </section>
            `
        }
    </script>
    <?= render("navbar") ?>

    <img class="backgroundCoverImage" id="backgroundCoverImageFront">
    <img class="backgroundCoverImage" id="backgroundCoverImageBack">

    <section id="pageContent" class="margin-top-10 flex-column centered"></section>

    <?= render("dragAndDrop") ?>

    <?= render("search") ?>

    <?= render("library") ?>
    <?= render("playerScreenSaver") ?>
    <?= render("player") ?>

    <?= render("playlist") ?>

    <?= render("radios") ?>
    <?= render("settings") ?>
</body>
</html>