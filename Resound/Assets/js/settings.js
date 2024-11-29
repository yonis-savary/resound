async function displaySettings()
{
    changePageFragment(PAGE_SETTINGS)

    await changePageContentTo(`
        <h1>Settings</h1>

        <hr>

        <h2>Database</h2>

        <section class="flex-row">
            <span class="giant" id="toDiscoverCount"></span>
            <p>Directory to analyze</p>
        </section>

        <section class="flex-row">

            <section class="flex-column flex-1">
                <p>Discover recently added tracks <br>(this task is automatically done every hour)</p>
                <button id="discoverButton" onclick="discover()" class="fill-top button secondary blue">${svg("arrow-repeat")} Discover new tracks !</button>
            </section>
            <section class="flex-column flex-1">
                <p>
                    Clearing the library clears the database of metadata, clicking this button will fully reset the metadata database
                    (Only the data is deleted, not the files)
                </p>
                <button onclick="resetLibrary()" class="fill-top button secondary orange">${svg("trash")} Clear library</button>
            </section>

        </section>

        <hr>

        <section class="flex-row align-center justify-between">
            <span>Artist pictures</span>
            <button class="button orange secondary" onclick="clearArtistPictureCache()">Delete files</button>
        </section>

        <hr>

        <h2>Special actions</h2>

        <p>Some special actions can be triggered when pressing twice the next/previous button on your speaker/bluetooth device</p>

        <section class="flex-row">
            <section class="flex-column flex-1">
                <b>When pressing twice the 'previous' button</b>
                <select id="previousButtonActionSelector">
                    ${Object.entries(ACTIONS_LABEL).map(([code, label]) => `
                    <option value="${code}">${label}</option>
                    `).join("")}
                </select>
            </section>
            <section class="flex-column flex-1">
                <b>When pressing twice the 'next' button</b>
                <select id="nextButtonActionSelector">
                    ${Object.entries(ACTIONS_LABEL).map(([code, label]) => `
                    <option value="${code}">${label}</option>
                    `).join("")}
                </select>
            </section>
        </section>

        <label class="svg-text">
            <input
                type="checkbox"
                id="powerSaveModeToggler"
                ${(localStorage.getItem("power-save-mode") ?? "0") == "1" ? "checked": ""}
            >
            Power saving mode
        </label>

        <hr>

        <h2>Tag anomalies</h2>
        <p>While parsing tags, the system may encounter uncommon situations/informations, they are all listed here</p>
        <section class="scrollable max-vh-40" id="anomalyList"></section>

        <hr>

        <h2>Library location</h2>

        <details>
            <summary>Change Local disk Settings</summary>
            <section class="flex-column">
                <label class="form-section">
                    <span>Path to Music Directory</span>
                    <input type="text" id="libraryPath">
                </label>
                <button class="button orange secondary" id="librarySave" onclick="testAndSaveNewPath()">Test & Save new path</button>
            </section>
        </details>

        <details>
            <summary>Change FTP Settings</summary>
            <section class="flex-column">
                <span id="ftpState"></span>
                <label class="form-section">
                    <span>Host</span>
                    <input type="text" id="ftpHost">
                </label>
                <label class="form-section">
                    <span>Username</span>
                    <input type="text" id="ftpUsername">
                </label>
                <label class="form-section">
                    <span>Password</span>
                    <input type="password" id="ftpPassword">
                </label>
                <label class="form-section">
                    <span>Music Directory (relative to FTP home)</span>
                    <input type="text" id="ftpDirectory">
                </label>
                <label class="form-section">
                    <span>Port (21 by default)</span>
                    <input type="number" id="ftpPort">
                </label>
                <button class="button orange secondary" id="ftpSave" onclick="testAndSaveNewFtp()">Test & Save new configuration</button>
            </section>
        </details>

        <h2>Credits / Licence</h2>

        <dl>
            <dt>Mood mode activation sound (Low-pitch, Shortened)</dt>
            <dd><a class="fg-white" href="https://freesound.org/people/josheb_policarpio/sounds/613402/">josheb_policarpio</a></dd>
        </dl>

    `)

    previousButtonActionSelector.value = localStorage.getItem(PREVIOUS_BUTTON_ACTION_KEY)
    nextButtonActionSelector.value = localStorage.getItem(NEXT_BUTTON_ACTION_KEY)

    previousButtonActionSelector.onchange = _ => setPreviousButtonAction(previousButtonActionSelector.value)
    nextButtonActionSelector.onchange = _ => setNextButtonAction(nextButtonActionSelector.value)

    powerSaveModeToggler.onchange = _ => {
        localStorage.setItem("power-save-mode", powerSaveModeToggler.checked ? "1": "0");
        if (powerSaveModeToggler.checked)
            document.body.classList.add("power-save-mode");
        else
            document.body.classList.remove("power-save-mode");
    }

    refreshAnomalyList()
    refreshToDiscoverCount();

    refreshFtpConnectionState();
    refreshFtpConfiguration();
    refreshLocalConfiguration();
}

let discoverInterval = null;

document.addEventListener("PageContentChanged", _ =>
{
    clearInterval(discoverInterval);
})

async function refreshToDiscoverCount()
{
    let count = await apiFetch("/settings/to-discover")
    let old = parseInt(toDiscoverCount.innerText);

    if (count && count === old)
        return;

    if (old)
    {
        let range = count > old ?
            Math.range(count, old, true) :
            Math.range(old, count, true).reverse();

        for (let i of range) {
            toDiscoverCount.innerText = i;
            await sleep(50)
        }
    }
    else
    {
        toDiscoverCount.innerText = count;
    }

    if (!count)
    {
        discoverButton.fadeIn();
        if (discoverInterval)
        {
            notifyInfo("End of analyse", "New tracks added");
            clearInterval(discoverInterval);
            discoverInterval = null;
        }
    }
}


async function discover()
{
    await apiFetch("/settings/discover");

    notifySuccess("Discovery launched", "Your new tracks should appear in a few seconds");
    discoverInterval = setInterval(refreshToDiscoverCount, 2000);
    discoverButton.fadeOut();

    await apiFetch("/settings/parse-tags");

}

async function resetLibrary()
{
    if (!confirm("Clear the database ?"))
        return;

    await apiFetch("/settings/reset-library");
    notifySuccess("Database reset", "Database fully cleared")
}

async function refreshAnomalyList()
{
    let anomalies = await apiRead("tag_anomaly");
    anomalyList.innerHTML = `
    <table class="table striped">
    ${anomalies.map(x => `
        <tr>
            <td class="padding-1"><span class="one-liner">${x.data.description}</span></td>
            <td><span class="one-liner">${x.data.filename}</span></td>
        </tr>
    `).join("")}
    </table>`
}


async function refreshFtpConnectionState()
{
    let feedback = await apiFetch(`/settings/ftp-test`);

    if (feedback === true)
    {
        ftpState.classList = "fg-MediumSpringGreen bold"
        ftpState.innerText = "FTP Connection is OK !";
    }
    else
    {
        ftpState.classList = "fg-OrangeRed bold"
        ftpState.innerText = `Got an error ! (${feedback})`;
    }
}

async function refreshFtpConfiguration()
{
    let configuration = await apiFetch(`/settings/ftp-get-configuration`);
    ftpHost.value = configuration.url ?? "";
    ftpUsername.value = configuration.username ?? "";
    ftpDirectory.value = configuration.path ?? "";
}


async function testAndSaveNewFtp()
{
    ftpSave.disabled = true;

    validate({
        url: read(ftpHost).error("A Host is needed").notNull(),
        username: read(ftpUsername).error("A Username is needed").notNull(),
        password: read(ftpPassword).error("A Password is needed").notNull(),
        path: read(ftpDirectory).error("A Directory is needed").notNull(),
        port: read(ftpPort)
    }, async form => {
        let feedback = await apiFetch("/settings/ftp-register-configuration", form, "POST");
        ftpSave.disabled = false;

        if (feedback === true)
            return notifySuccess("New configuration saved !");

        return alert("Could not register the configuration : " + feedback);

    }, _ => ftpSave.disabled = false)

}


async function refreshLocalConfiguration()
{
    let config = await apiFetch(`/settings/local-get-configuration`);
    libraryPath.value = config.path ?? "";
}

async function testAndSaveNewPath()
{
    librarySave.disabled = true;

    validate({
        path: read(libraryPath).error("A Directory is needed").notNull(),
    }, async form => {
        let feedback = await apiFetch("/settings/local-register-configuration", form, "POST");
        librarySave.disabled = false;

        if (feedback === true)
            return notifySuccess("New configuration saved !");

        return alert("Could not register the configuration : " + feedback);

    }, _ => librarySave.disabled = false)
}



async function clearArtistPictureCache()
{
    if (!confirm("Clear all artist pictures ?"))
        return;

    await apiFetch("/api/artist/clear-picture-cache");
    notifySuccess("Artists pictures removed");
}