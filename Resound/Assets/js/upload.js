let currentUploadToken = null;

async function displayUploadMenu()
{
    await changePageContentTo(`
        <h1>Upload new Music</h1>

        <section class="flex-row align-center">
            <section class="flex-column gap-0">
                <progress id="uploadProgress"></progress>
                <small id="uploadProgressLabel"></small>
            </section>
            <input type="file" id="uploadFile">
        </section>

        <table class="table" id="fileList"></table>

        <section style="display: none" class="flex-row align-center" id="uploadDecisionControls">
            <button id="cancelUploadButton" class="button red secondary">Cancel Upload</button>
            <button id="confirmUploadButton" class="button green">Confirm Upload</button>
        </section>
    `);

    uploadFile.onchange = async _ => {
        let file = uploadFile.files[0];
        let fileSize = file.size;

        let progressTracker = {
            sent: 0,

            addSent: function(bytes) {
                this.sent += bytes;
                uploadProgress.value = this.sent;
                uploadProgressLabel.innerText = ((100*this.sent) / file.size ).toFixed(0) + "%";
            }
        }

        uploadProgress.setAttribute("max", fileSize);

        const CHUNK_SIZE = 1024*1024*2;
        let chunkNumbers = Math.ceil(fileSize / CHUNK_SIZE);

        if (currentUploadToken)
            apiFetch(`/upload/cancel-upload/${currentUploadToken}`);

        let token = currentUploadToken = await apiFetch("/upload/start-upload");

        let promises = new Array(chunkNumbers).fill(0).map(async (_, i)  => {
            let chunkData = file.slice(i*CHUNK_SIZE, (i*CHUNK_SIZE)+CHUNK_SIZE);
            await fetch(`/api/upload/upload-chunk/${token}/${i}`, {method: "POST", body: chunkData});

            progressTracker.addSent(chunkData.size);
        })

        await Promise.all(promises);

        let files = await apiFetch(`/upload/process-upload/${token}`);

        fileList.innerHTML = `
        <tr>
            <th>Filename</th>
            <th>Import this file</th>
        </tr>
        ` + files.map(([filename, exists]) => `
        <tr>
            <td>
                <section class="flex-column gap-0">
                    <section class="svg-text">
                        ${filename.split("/").filter(x => x).map(x => `<span class="badge darkgray">${x}</span>`).join("/")}
                    </section>
                    <span class="hide-empty fg-orange">${exists ? "A file with this name already exists in your libary": ""}</span>
                </section>
            </td>
            <td>
                <label class="switch">
                    <input type="checkbox" path="${filename}" checked>
                    <section class="slider"></section>
                </label>
            </td>
        </tr>
        `).join("")

        uploadDecisionControls.show();
        uploadFile.value = ""
    }

    cancelUploadButton.addEventListener("click", async _ => {
        if (currentUploadToken)
            await apiFetch(`/upload/cancel-upload/${currentUploadToken}`);

        displayUploadMenu()
    })
    confirmUploadButton.addEventListener("click", async _ => {
        cancelUploadButton.disabled = true;
        confirmUploadButton.disabled = true;

        await apiFetch(`/upload/move-upload/${currentUploadToken}`, {}, "POST");

        displayUploadMenu();
        notifySuccess("New tracks were added to your library !");
    })

}