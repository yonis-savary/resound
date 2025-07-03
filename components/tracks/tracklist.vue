<template>
    <div class="flex flex-grow-1 justify-between align-center mb-3">
        <slot name="title">
            <h1 class="text-3xl">Tracks</h1>
        </slot>
        <div class="flex flex-row gap-5">
            <label class="flex flex-row  items-center gap-3">
                Only in library
                <USwitch v-model="onlyTracksInLibrary"/>
            </label>
            <ShuffleButtons type="tracks" :elements="tracks" />
        </div>
    </div>

    <div class="overflow-auto">
        <table style="width: 100%">
            <thead>
                <tr>
                    <th>#</th>
                    <th>Name</th>
                    <th>Duration</th>
                    <th v-if='showYear'>Year</th>
                    <th><i class="pi pi-heart" /></th>
                </tr>
            </thead>
            <tbody>
                <tr 
                    v-for="(track, index) in tracksToShow" 
                    :key="index"
                    :class="{'inexistent': track.path === null}"
                    @click="$emit('track-clicked', index, tracksToShow)" 
                >
                    <td>
                        <div v-if="(track.disc_number ?? 0) > 1" class="flex flex-row items-center gap-2" >
                            <i class="pi pi-bullseye" />
                            <span>{{ track.disc_number }}</span>
                        </div>
                        <div v-if="track.position" class="flex flex-row items-center gap-2" >
                            <i class="pi pi-hashtag" />
                            <span>{{ track.position }}</span>
                        </div>
                    </td>
                    <td>
                        <div class="flex flex-row gap-3">
                            <AlbumCoverLink :show-title="false" size="small" :album="track.album_album"/>
                            <div class="flex flex-col ">
                                <span class="font-medium">{{ track.name }}</span>
                                <span class="opacity-75">
                                    <div v-if="track.track_artists?.length" class="flex flex-row gap-3">
                                        {{ track.track_artists.map(artist => artist.artist_artist.name).join(", ") }}
                                    </div>
                                    <div v-else-if="track.album_album.album_artists.length">
                                        {{ track.album_album.album_artists?.map(x => x.artist_artist.name).join(', ') }}
                                    </div>
                                </span>
                            </div>
                        </div>
                    </td>
                    <td>
                        <span v-if="track.duration_milliseconds">
                            {{ prettyDuration(track.duration_milliseconds/1000)  }}
                        </span>
                    </td>
                    <td v-if="showYear">
                        {{ track.album_album.release_date ? new Date(track.album_album.release_date).getFullYear() : '?' }}
                    </td>
    
                    <td>
                        <Like :track="track" />
                    </td>
                </tr>
            </tbody>
        </table>
    </div>

</template>



<script setup lang="ts">
import { computed } from 'vue';
import type { PropType } from 'vue';
import { usePlayerStore } from '../../stores/player';
import { useStorage } from '@vueuse/core';
import type { Track } from '~/models/Track';
import AlbumCoverLink from '../albums/album-cover-link.vue';
import Like from './like.vue';

const { prettyDuration } = usePlayerStore();

const onlyTracksInLibrary = useStorage('track-list-only-in-library', true);

const tracksToShow = computed(()=>
    onlyTracksInLibrary.value ? 
        tracks.filter(track => track.path != null):
        tracks
)

defineEmits<{
    (e: 'track-clicked', index: number, tracks: Track[]): void
}>()

const {tracks} = defineProps({
    showYear: {
        type: Boolean,
        default: false,
        required: false
    },
    tracks: {
        type: Array as PropType<Track[]>,
        required: true
    }
});

</script>


<style scoped>

.inexistent:not(:hover)
{
    opacity: .5;
    filter: grayscale(50%);
}

.inexistent
{
    transition: all 200ms ease;
}

@media only screen and (max-width: 1000px) {
    table 
    {
        font-size: 12px;
    }
}


td, th
{
    padding: .5em 1em;
}

th
{
    border-bottom: .1em solid white;
    text-align: left;
}

tr
{
    cursor: pointer;
}

tr:hover
{
    background: rgba(255,255,255, 0.1);
}

</style>