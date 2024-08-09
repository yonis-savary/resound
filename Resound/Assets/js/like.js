async function trackIsLiked(trackId)
{
    let row = await apiRead("user_like", {user: userID(), track: trackId});
    return row.length > 0;
}

async function likeTrack(trackId)
{
    await apiCreate("user_like", {user: userID(), track: trackId});
}

async function unlikeTrack(trackId)
{
    await apiDelete("user_like", {user: userID(), track: trackId});
}

function likeButton(trackId, svgSize=24)
{
    let button = document.createElement("button");

    button.setAttribute("trackId", trackId);
    button.classList = "like-button player-button"

    button.innerHTML = `
    <span class="svg-text liked-svg">${svg("heart-fill", svgSize)}</span>
    <span class="svg-text not-liked-svg">${svg("heart", svgSize)}</span>
    `

    button.addEventListener("click", event => {
        event.stopImmediatePropagation();
        toggleLikeButton(button)
    })

    refreshButton(button);
    return button;
}

function changeButtonTrackId(button, trackId)
{
    button.setAttribute("trackId", trackId);
    refreshButton(button);
}

async function toggleLikeButton(button)
{
    let trackId = button.getAttribute("trackId");

    let newStatusIsLiked = !(button.hasAttribute("liked"));

    if (newStatusIsLiked)
        likeTrack(trackId)
    else
        unlikeTrack(trackId);

    refreshButton(button, newStatusIsLiked);
}

async function refreshButton(button, cachedResult=null)
{
    let trackId = button.getAttribute("trackId");

    let isLiked = cachedResult ?? await trackIsLiked(trackId);

    if (isLiked)
        button.setAttribute("liked", true);
    else
        button.removeAttribute("liked");
}