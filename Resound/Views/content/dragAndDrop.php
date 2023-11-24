<script>

    const dragAndDropObserver = new MutationObserver((mutationList, observer) => {
        for (let mutation of mutationList)
        {
            let {target} = mutation;

            let albums = target.querySelectorAll("[album]");
            albums.forEach(x => {
                x.setAttribute("draggable", "true");
                x.addEventListener("dragstart", (event) => {
                    event.dataTransfer.setData("drag-type", "album")
                    event.dataTransfer.setData("album", x.getAttribute("album"))
                    document.dispatchEvent(new CustomEvent("albumDragStart", {detail: event}));
                });
                x.addEventListener("dragend", (event) => {
                    document.dispatchEvent(new CustomEvent("albumDragEnd", {detail: event}));
                });
            });

            let tracks = target.querySelectorAll("[track]");
            tracks.forEach(x => {
                x.setAttribute("draggable", "true");
                x.addEventListener("dragstart", (event) => {
                    event.dataTransfer.setData("drag-type", "track")
                    event.dataTransfer.setData("track", x.getAttribute("track"))
                    document.dispatchEvent(new CustomEvent("trackDragStart", {detail: event}));
                });
                x.addEventListener("dragend", (event) => {
                    document.dispatchEvent(new CustomEvent("trackDragEnd", {detail: event}));
                });
            });
        }

        refreshTrackPlayingClassTracker()
    });

    // Start observing the target node for configured mutations
    dragAndDropObserver.observe(pageContent, {childList: true, subtree: true});

</script>