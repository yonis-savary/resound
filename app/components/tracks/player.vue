<template>

    <div v-if="currentTrack" class="player" >
        <div class="flex flex-row gap-3 items-center">
            <button class="player-button" @click="playerStore.goToPrevious"><Icon name="ic:baseline-skip-previous" /></button>
            <button v-if="isPlaying" class="player-button" @click="playerStore.pause"><Icon name="ic:baseline-pause" /></button>
            <button v-else class="player-button" @click="playerStore.play"><Icon name="ic:baseline-play-arrow" /></button>
            <button class="player-button" @click="playerStore.goToNext"><Icon name="ic:baseline-skip-next" /></button>
            
            
            <UPopover ref="op">
                <button class="player-button">
                    <Icon name="ic:baseline-menu"/>
                </button>

                <template #content>
                    <Tracklist :tracks="playerStore.currentTracklist" @track-clicked="handlePopoverPlayEvent"/>
                </template>
            </UPopover>

            <Like :track="currentTrack" />
        </div>

        <div v-if="currentTrack" class="flex flex-row flex-grow-1 items-center gap-3">
            <AlbumCoverLink :album="currentTrack.album_album" size="small" :show-title="false" />
            <div class="flex flex-col flex-grow-1 gap-1">
                <div class="flex flex-col gap-0">
                    <span class="font-bold">{{ currentTrack.name }}</span>
                    <span class="opacity-75">
                        <div v-if="currentTrack.track_artists && currentTrack.track_artists.length" class="flex flex-row gap-3">
                            {{ currentTrack.track_artists.map(artist => artist.artist_artist.name).join(", ") }}
                        </div>
                        <div v-else-if="currentTrack.album_album.album_artists.length">
                            {{ currentTrack.album_album.album_artists?.map(x => x.artist_artist.name).join(", ") }}
                        </div>
                        <div v-else>
                            No artist found
                        </div>
                    </span>
                </div>
                <div class="flex flex-row items-center gap-3">
                    <USlider
                        v-if="currentDuration || currentTrack?.duration_milliseconds"
                        class="flex-grow-1"
                        :min="0"
                        :max="currentTrack?.duration_milliseconds ? ((currentTrack.duration_milliseconds) / 1000) : currentDuration"
                        :model-value="currentTime"
                        @update:model-value="playerStore.goToTime($event as number)"
                    />
                    <div class="flex flex-row gap-2 track-timer">
                        <span>{{ playerStore.prettyDuration(currentTime) }}</span> /
                        <span v-if="currentTrack?.duration_milliseconds">{{ playerStore.prettyDuration(currentTrack.duration_milliseconds/1000) }}</span>
                        <span v-else-if="currentDuration">{{ playerStore.prettyDuration(currentDuration) }}</span>
                    </div>
                </div>
            </div>
        </div>

        <div class="w-30">
            <USlider
                v-model="volume"
                :min="0"
                :step="0.01"
                :max="1"
            />
        </div>
    </div>
</template>

<script setup lang="ts">
import { usePlayerStore } from '~/app/stores/player';
import { storeToRefs } from 'pinia';
import Like from './like.vue';
import AlbumCoverLink from '../albums/album-cover-link.vue';
import Tracklist from './tracklist.vue';

const playerStore = usePlayerStore();

const {
    isPlaying,
    currentTrack,
    volume,
    currentTime,
    currentColor,
    currentDuration
} = storeToRefs(playerStore);

console.log("Initial volume " + volume.value);

const handlePopoverPlayEvent = (index: number) => {
    playerStore.gotoIndex(index);
}

</script>


<style scoped>

    :deep(.p-slider-range),
    :deep(.p-slider-handle)
    {
        --p-slider-range-background: v-bind(currentColor) !important;
        --p-slider-handle-background: v-bind(currentColor) !important;
        --p-slider-handle-content-background: v-bind(currentColor) !important;
        --p-slider-handle-content-hover-background: v-bind(currentColor) !important;
    }

    .p-button
    {
        --p-button-icon-only-width: 2.5em;
        --p-icon-size: 1em;
        border-color: white !important;
        border: 2px solid white !important;
        color: white !important;
        background: transparent;
    }

    .p-button:hover
    {
        background: rgba(255,255,255,0.2) !important;
    }

    .player
    {
        position: fixed;
        bottom: 0;
        display: flex;
        flex-direction: row;
        align-items: center;
        width: 100%;
        background: rgba(0,0,0,0.5);
        backdrop-filter: blur(3px);
        padding: .5em;
        padding-left: 1em;
        padding-right: 1em;
        gap: 2em;
    }

    @media only screen and (max-width: 500px) {
        .player
        {
            flex-wrap: wrap;
            gap: .5em;
        }

        .p-slider 
        {
            display: none;
        }
    }
</style>