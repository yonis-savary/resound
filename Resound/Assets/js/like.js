let userLikes = [];

apiFetch(`/likes/list`).then(likes => {
    userLikes = likes.split(",").map(x => parseInt(x));
})

function trackIsLiked(trackId)
{
    return userLikes.includes(trackId);
}

function likeTrack(trackId)
{
    apiCreate("user_like", {user: userID(), track: trackId});
    userLikes.push(trackId);
}

function unlikeTrack(trackId)
{
    apiDelete("user_like", {user: userID(), track: trackId});
    userLikes = userLikes.filter(x => x != trackId);
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

function toggleLikeButton(button)
{
    let trackId = parseInt(button.getAttribute("trackId"));

    let newStatusIsLiked = !(button.hasAttribute("liked"));

    if (newStatusIsLiked)
        likeTrack(trackId)
    else
        unlikeTrack(trackId);

    refreshButton(button, newStatusIsLiked);
}

function refreshButton(button, cachedResult=null)
{
    let trackId = parseInt(button.getAttribute("trackId"));

    let isLiked = cachedResult ?? trackIsLiked(trackId);

    if (isLiked)
        button.setAttribute("liked", true);
    else
        button.removeAttribute("liked");
}