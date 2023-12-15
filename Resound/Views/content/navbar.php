<nav class="navbar">
    <section class="svg-text">
        <img src="<?= asset("resound.png") ?>" style="width: 1.75em">
        <h1 class="margin-right-5">Resound</h1>
    </section>

    <section class="svg-text" onclick="displaySearchPage()"><?= svg("search") ?></section>

    <a class="svg-link" onclick="displayLibrary()">Library</a>
    <a class="svg-link" onclick="displayPlaylistMenu()">Playlists</a>

    <a class="svg-link" onclick="displayEmbeddedMedias()">Web</a>

    <section class="fill-left fill-right"></section>



    <a class="svg-link" onclick="displaySettings()">Settings</a>
    <a class="svg-link" href="/logout">Logout</a>
</nav>
