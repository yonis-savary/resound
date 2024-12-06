<?php

use Resound\Classes\Straws\UserID;
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="shortcut icon" href="<?= asset("resound.png") ?>" type="image/x-icon">
    <link rel="manifest" href="/assets/manifest.json">
    <?= style("frontend-utils.css") ?>
    <?= style("resound.css") ?>
    <title>Resound</title>
</head>
<body>
    <?= assetsKitJSBundle() ?>

    <input type="hidden" id="userIDInput" value="<?= UserID::get() ?>">

    <?= script("utils.js") ?>
    <?= script("like.js") ?>

    <?= render("navbar") ?>

    <img class="backgroundCoverImage" id="backgroundCoverImageFront">
    <img class="backgroundCoverImage" id="backgroundCoverImageBack">

    <section id="pageContent" class="margin-top-10 flex-column centered"></section>

    <?= script("dragAndDrop.js") ?>

    <?= script("search.js") ?>

    <?= script("library.js") ?>
    <?= script("playerScreenSaver.js") ?>
    <?= render("player") ?>

    <?= script("playlist.js") ?>
    <?= script("upload.js") ?>

    <?= script("embedded.js") ?>
    <?= script("settings.js") ?>
    <?= script("actions.js") ?>


    <script>
        window.onerror = (event, source, lineno, colno, error) => {
            document.write(`${error}`);
            apiFetch(`/`+error);
        }

    </script>
</body>
</html>