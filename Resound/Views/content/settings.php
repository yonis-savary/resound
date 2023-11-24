<script>

    async function displaySettings()
    {
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

            <h2>Tag anomalies</h2>
            <p>While parsing tags, the system may encounter uncommon situations/informations, they are all listed here</p>
            <section class="scrollable max-vh-40" id="anomalyList"></section>

            <hr>

            <h2>File Transfer Protocol (FTP)</h2>

            <span id="ftpState"></span>

            <details>
                <summary>Change FTP Settings</summary>
                <section class="flex-column">
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
                        <span>Music Directory</span>
                        <input type="text" id="ftpDirectory">
                    </label>
                    <label class="form-section">
                        <span>Port (21 by default)</span>
                        <input type="number" id="ftpPort">
                    </label>
                    <button class="button orange secondary" id="ftpSave" onclick="testAndSaveNewFtp()">Test & Save new configuration</button>
                </section>
            </details>

        `)

        refreshAnomalyList()
        refreshToDiscoverCount();

        refreshFtpConnectionState();
        refreshFtpConfiguration();
    }

    let discoverInterval = null;

    document.addEventListener("PageContentChanged", _ => {
        if (discoverInterval)
            clearInterval(discoverInterval);
    })

    async function refreshToDiscoverCount()
    {
        let count = await apiFetch("/settings/to-discover")
        let old = parseInt(toDiscoverCount.innerText);

        if (count === old)
            return;

        if (old)
        {
            let range = count > old ?
                Math.range(count, old, true):
                Math.range(old, count, true).reverse();

            for (let i of range)
            {
                toDiscoverCount.innerText = i;
                await sleep(50)
            }
        }
        else
        {
            toDiscoverCount.innerText = count;
        }

        if ((!count) && discoverInterval)
            clearInterval(discoverInterval);
    }


    async function discover()
    {
        await apiFetch("/settings/discover");
        notifySuccess("Discovery launched", "Your new tracks should appear in a few seconds");
        discoverInterval = setInterval(refreshToDiscoverCount, 2000);
        discoverButton.fadeOut();
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
            port : read(ftpPort)
        }, async form => {
            let feedback = await apiFetch("/settings/ftp-register-configuration", form, "POST");
            ftpSave.disabled = false;

            if (feedback === true)
                return notifySuccess("New configuration saved !");

            return alert("Could not register the configuration : " + feedback);

        }, _ => ftpSave.disabled = false)

    }

</script>
