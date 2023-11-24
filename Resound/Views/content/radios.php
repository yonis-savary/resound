<script>
    async function refreshRadioList()
    {
        let radios = await apiRead("web_radio");
        webRadioList.innerHTML = radios.map(x => `
        <section class="" onclick="openWebRadio(${x.data.id})">
            <b>${x.data.name}</b>
        </section>
        `).join("")

    }

    async function displayRadios()
    {
        await changePageContentTo(`

            <section class="flex-row align-start flex-1 gap-5">
                <section class="flex-column">
                    <section class="flex-row align-center gap-10">
                        <h1>Radios</h1>
                        <button class="button secondary white fill-left" bottom menu="addRadioMenu">${svg("plus")} Add</button>
                    </section>
                    <section class="menu-option" id="webRadioList">
                    </section>
                </section>

                <section class="menu" id="addRadioMenu">
                    <section class="form-section">
                        <span>Name</span>
                        <input type="text" id="newRadioName">
                    </section>
                    <section class="form-section">
                        <span>URL</span>
                        <input type="text" id="newRadioUrl">
                    </section>
                    <button id="newRadioAdd" class="button green">Save</button>
                </section>

                <section class="flex-column flex-1" id="radioContent">
                    <section class="flex-row align-center gap-1">
                        <section class="flex-column gap-0 fill-right">
                            <h1 id="webRadioName"></h1>
                            <small id="webRadioUrl"></small>
                        </section>
                        <button onclick="renameRadio()" class="button blue secondary icon">${svg("pencil")}</button>
                        <button onclick="changeRadioURL()" class="button blue secondary icon">${svg("link")}</button>
                        <button onclick="deleteRadio()" class="button red secondary icon">${svg("trash")}</button>
                    </section>
                    <iframe
                        id="webRadioIframe"
                        src=""
                        class="flex-1"
                        frameborder="0"
                    ></iframe>
                </section>
            </section>

        `)

        radioContent.style.display = "none";

        newRadioAdd.addEventListener("click", _ => {
            validate({
                name: read(newRadioName).notNull(),
                url: read(newRadioUrl).notNull()
            }, async form => {
                await apiCreate("web_radio", form);
                refreshRadioList();
                newRadioName.value = "";
                newRadioUrl.value = "";
            });
        })

        refreshRadioList()
    }
















    let openedRadioId = null;

    async function openWebRadio(id)
    {
        openedRadioId = id;

        let radio = (await apiRead("web_radio", {id}))[0];

        webRadioName.innerText = radio.data.name;
        webRadioUrl.innerText = radio.data.url;
        webRadioIframe.src = radio.data.url

        radioContent.style.display = "";
    }

    async function renameRadio()
    {
        let radio = (await apiRead("web_radio", {id: openedRadioId}))[0];

        let newName = prompt("New radio name", radio.data.name);
        if (!newName)
            return;

        await apiUpdate("web_radio", {id: openedRadioId, name: newName});
        refreshRadioList();
    }

    async function changeRadioURL()
    {
        let radio = (await apiRead("web_radio", {id: openedRadioId}))[0];

        let newURL = prompt("New radio URL", radio.data.url);
        if (!newURL)
            return;

        await apiUpdate("web_radio", {id: openedRadioId, url: newURL});
        refreshRadioList();
    }

    async function deleteRadio()
    {
        if (!confirm("This action cannot be undone ? Delete this web radio from the list ?"))
            return

        await apiDelete("web_radio", {id: openedRadioId});
        displayRadios();
    }



</script>