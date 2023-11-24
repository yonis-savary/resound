<nav class="navbar">
    <section class="svg-text">
        <img src="<?= asset("resound.png") ?>" style="width: 1.75em">
        <h1 class="margin-right-5">Resound</h1>
    </section>

    <section class="svg-text" onclick="displaySearchPage()"><?= svg("search") ?></section>

    <a onclick="displayLibrary()">Library</a>
    <a onclick="displayPlaylistMenu()">Playlists</a>
    <a onclick="displayRadios()">Radios</a>

    <section class="fill-left fill-right"></section>

    <a onclick="displaySettings()">Settings</a>
    <a href="/logout">Logout</a>
</nav>