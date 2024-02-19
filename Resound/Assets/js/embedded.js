async function refreshEmbeddedMediaList()
{
    let medias = await apiRead("embedded_media");
    webEmbeddedMediaList.innerHTML = medias.map(x => `
    <section class="" onclick="openWebEmbeddedMedia(${x.data.id})">
        <b>${x.data.name}</b>
    </section>
    `).join("")
}

async function displayEmbeddedMedias()
{
    await changePageContentTo(`

        <section class="flex-row flex-wrap align-start flex-1 gap-5">
            <section class="flex-column flex-1">
                <section class="flex-row align-center gap-10">
                    <h1>Embedded Medias</h1>
                    <button class="button secondary white fill-left" bottom menu="addEmbeddedMediaMenu">${svg("plus")} Add</button>
                </section>
                <section class="menu-option" id="webEmbeddedMediaList">
                </section>
            </section>

            <section class="menu" id="addEmbeddedMediaMenu">
                <section class="form-section">
                    <span>Name</span>
                    <input type="text" id="newEmbeddedMediaName">
                </section>
                <section class="form-section">
                    <span>URL</span>
                    <input type="text" id="newEmbeddedMediaUrl">
                </section>
                <button id="newEmbeddedMediaAdd" class="button green">Save</button>
            </section>

            <section class="flex-column flex-1" id="embeddedContent">
                <section class="flex-row align-center gap-1">
                    <section class="flex-column gap-0 fill-right">
                        <h1 id="webEmbeddedMediaName"></h1>
                        <small style="max-width: 50ch" class="one-liner" id="webEmbeddedMediaUrl"></small>
                    </section>
                    <button onclick="renameEmbeddedMedia()" class="button blue secondary icon">${svg("pencil")}</button>
                    <button onclick="changeEmbeddedMediaURL()" class="button blue secondary icon">${svg("link")}</button>
                    <button onclick="deleteEmbeddedMedia()" class="button red secondary icon">${svg("trash")}</button>
                </section>
                <iframe
                    width="560"
                    height="315"
                    src=""
                    title="Embedded video player"
                    frameborder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowfullscreen
                    id="webEmbeddedMediaIframe"
                ></iframe>
            </section>
        </section>

    `)

    embeddedContent.style.display = "none";

    newEmbeddedMediaAdd.addEventListener("click", _ => {
        validate({
            name: read(newEmbeddedMediaName).notNull(),
            url: read(newEmbeddedMediaUrl).notNull()
        }, async form => {

            let link = form.url.match(/(https?:\/\/.+?)(?:$|")/)
            if (!link)
                return alert("link not found");

            form.url = link[1];

            await apiCreate("embedded_media", form);
            refreshEmbeddedMediaList();
            newEmbeddedMediaName.value = "";
            newEmbeddedMediaUrl.value = "";
        });
    })

    refreshEmbeddedMediaList()
}
















let openedEmbeddedMediaId = null;

async function openWebEmbeddedMedia(id)
{
    openedEmbeddedMediaId = id;

    let embedded = (await apiRead("embedded_media", { id }))[0];

    webEmbeddedMediaName.innerText = embedded.data.name;
    webEmbeddedMediaUrl.innerText = embedded.data.url;
    webEmbeddedMediaUrl.setAttribute("title", embedded.data.url);
    webEmbeddedMediaIframe.src = embedded.data.url

    embeddedContent.style.display = "";
}

async function renameEmbeddedMedia()
{
    let embedded = (await apiRead("embedded_media", { id: openedEmbeddedMediaId }))[0];

    let newName = prompt("New embedded name", embedded.data.name);
    if (!newName)
        return;

    await apiUpdate("embedded_media", { id: openedEmbeddedMediaId, name: newName });
    refreshEmbeddedMediaList();
}

async function changeEmbeddedMediaURL()
{
    let embedded = (await apiRead("embedded_media", { id: openedEmbeddedMediaId }))[0];

    let newURL = prompt("New embedded URL", embedded.data.url);
    if (!newURL)
        return;

    await apiUpdate("embedded_media", { id: openedEmbeddedMediaId, url: newURL });
    refreshEmbeddedMediaList();
}

async function deleteEmbeddedMedia()
{
    if (!confirm("This action cannot be undone ? Delete this web embedded from the list ?"))
        return

    await apiDelete("embedded_media", { id: openedEmbeddedMediaId });
    displayEmbeddedMedias();
}


