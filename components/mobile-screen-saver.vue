<template>
    <div v-if="currentTrack" ref="screenSaver" class="screen-saver">
        <img
            v-if="currentTrack && currentTrack.album_album.id"
            class="background"
            :src="'/api/album/' + currentTrack.album_album.id + '/picture'"
        >
        <div class="content flex gap-6 items-center justify-center">
            <div class="flex flex-col gap-4 my-5 items-center sm:flex-grow-1 justify-center">
                <AlbumCoverLink :album="currentTrack.album_album" size="big" :show-title="false" />
            </div>
            <div class="flex flex-col justify-center flex-grow-1 gap-6">
                <div class="flex flex row justify-between items-center">
                    <div class="flex flex-col sm:justify-between w-full ">
                        <span class="font-bold text-3xl md:text-xl">{{ currentTrack.name }}</span>
                        <span class="opacity-75 text-xl md:text-xl">
                            <div v-if="currentTrack.track_artists && currentTrack.track_artists.length" class="flex flex-row gap-3">
                                {{ currentTrack.track_artists.map(artist => artist.artist_artist.name).join(", ") }}
                            </div>
                            <div v-else-if="currentTrack.album_album.album_artists">
                                {{ currentTrack.album_album.album_artists.map(x => x.artist_artist.name).join(", ") }}
                            </div>
                            <div v-else>
                                No artist found
                            </div>
                        </span>
                        <span class="opacity-75 text-xl album-name">
                            {{ currentTrack.album_album.name }}
                        </span>
                    </div>
                    <div class="flex flex-row gap-2">
                        <span>{{ playerStore.prettyDuration(currentTime) }}</span> /
                        <span v-if="currentTrack?.duration_milliseconds">{{ playerStore.prettyDuration(currentTrack.duration_milliseconds/1000) }}</span>
                    </div>
                </div>
                <div class="flex flex-row flex-wrap gap-4 justify-between">
                    <button class="player-button big" @click="playerStore.goToPrevious"><Icon name="ic:baseline-skip-previous" size="30"/></button>
                    <button v-if="playerStore.isPlaying" class="player-button big" @click="playerStore.pause" ><Icon name="ic:baseline-pause" size="30" /> </button>
                    <button v-else class="player-button big" @click="playerStore.play"><Icon name="ic:baseline-play-arrow" size="30" /> </button>
                    <button class="player-button big" @click="playerStore.goToNext"><Icon name="ic:baseline-skip-next" size="30" /> </button>
                    <Like :track="currentTrack" :size="30" button-class="big" />
                    <button class="player-button big" @click="unlockScreenSaver"><Icon name="ic:baseline-lock-open" size="30"/></button>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { onMounted, onUnmounted, ref, watch } from 'vue';
import { usePlayerStore } from '../stores/player';
import AlbumCoverLink from './albums/album-cover-link.vue';
import Like from './tracks/like.vue';

const playerStore = usePlayerStore();
const { currentTrack, currentTime, currentColor }= storeToRefs(playerStore);
const screenSaver = ref<HTMLElement>();

const screenSaverDisplayDelaySeconds = 2;

const isEnabled = true;// || navigator.userAgent.toLowerCase().includes('mobile');
let displayTimeout : null|NodeJS.Timeout = null;

if (isEnabled)
    watch(() => playerStore.isPlaying, isPlaying => isPlaying ? startTimeout(): clearDisplayTimeout())

const startTimeout = () => displayTimeout = setTimeout(displayScreenSaver, screenSaverDisplayDelaySeconds * 1000);

const clearDisplayTimeout = ()=> {
    if (!displayTimeout)
        return ;

    clearTimeout(displayTimeout);
    displayTimeout = null;
}

const handleScrollEvent = ()=>{
    console.log("SCROLL!");
    clearDisplayTimeout()
    if (!playerStore.isPlaying)
        return;
    startTimeout()
}

onMounted(()=>{
    document.addEventListener('scroll', handleScrollEvent);
})

onUnmounted(()=>{
    document.removeEventListener('scroll', handleScrollEvent);
})

const displayScreenSaver = ()=>{
    if (!screenSaver.value) return;
    screenSaver.value.style.display = 'flex';
}

const unlockScreenSaver = ()=>{
    if (!screenSaver.value) return;
    screenSaver.value.style.display = '';
    if (playerStore.isPlaying)
        startTimeout();
}


</script>

<style lang="css" scoped>

:deep(.p-slider-range),
:deep(.p-slider-handle)
{
    --p-slider-range-background: v-bind(currentColor) !important;
    --p-slider-handle-background: v-bind(currentColor) !important;
    --p-slider-handle-content-background: v-bind(currentColor) !important;
    --p-slider-handle-content-hover-background: v-bind(currentColor) !important;
}

.screen-saver
{
    display: none;
    position: absolute;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    z-index: 999;
    overflow: hidden;
}
.screen-saver .content,
.screen-saver .background
{
    position: absolute;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
}

.screen-saver .background
{
    z-index: 1;
    object-fit: cover;
    width: 120vw;
    height: 120vh;
    transform: translate(-10%,-10%);
    max-width: none !important;
    filter: blur(12px) brightness(50%);
}
.screen-saver .content
{
    z-index: 2;
    width: 100%;
    padding: 0 5vw;
}


:deep(.p-button)
{
    --p-button-icon-only-width: 4em;
    --p-icon-size: 1.3em;
    border-color: white !important;
    border: 2px solid white !important;
    color: white !important;
    background: transparent;
}

:deep(.p-button:hover)
{
    background: rgba(255,255,255,0.2) !important;
}

@media only screen and (max-width: 500px) {
    .screen-saver .content
    {
        flex-direction: column;
    }
}
@media only screen and (max-height: 500px) {
    .album-name 
    {
        display: none;
    }
}

</style>
