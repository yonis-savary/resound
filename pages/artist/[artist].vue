<template>

    <div v-if="artist" class="container flex flex-col gap-8">

        <div class="flex flex-row gap-8">
            <ArtistAvatar :artist="artist" size="big" />
            <div class="flex flex-row justify-between items-center flex-grow-1">
                <div class="flex flex-col gap-8 flex-grow-1">
                    <h1 class="text-5xl font-bold">{{ artist.name }}</h1>
                </div>
                <UButton
                    class="justify-center"
                    :loading="apiUpdateIsLoading"
                    severity="contrast"
                    @click="startToUpdateFromApi"
                >
                    {{ apiUpdateIsLoading ? 'This may take a minute': 'Update from Spotify' }}
                </UButton>
            </div>
        </div>

        <AlbumList v-if="artist.album_artists" :albums="artist.album_artists.map(x => x.album_album)" />

        <div class="max-h-100 overflow-auto">
            <Tracklist v-if="artistTracks" :show-year="true" :tracks="artistTracks" @track-clicked="handleTrackListClick" />
        </div>
    </div>

</template>


<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import AlbumList from '~/components/albums/album-list.vue';
import ArtistAvatar from '~/components/artists/artist-avatar.vue';
import Tracklist from '~/components/tracks/tracklist.vue';
import type { Album } from '~/models/Album';
import type { Artist } from '~/models/Artist';
import type { Track } from '~/models/Track';

definePageMeta({middleware: ['authenticated']})

const route = useRoute();

const toast = useToast();
const player = usePlayerStore();

const artist = ref<Artist>();

const artistTracks = computed(()=>

    artist.value?.album_artists?.
    map(x => x.album_album)
    .sort((a: Album, b: Album) => (a.release_date ?? 0) > (b.release_date ?? 0) ? -1:1)
    .reduce(
        (acc: Track[], cur: Album)=> [
            ...acc,
            ...cur.tracks?.sort((a: Track, b: Track) => (a.position??0) > (b.position??0) ? 1:-1) ?? []
        ],
        []
    )
)

const handleTrackListClick = (index: number, tracks:Track[]) => {
    if (!artistTracks.value)
        return;
    player.changeTracklist(tracks, index);
}

const loadArtist = async () => {
    artist.value = (await $fetch<Artist>('/api/artist/' + route.params.artist + "/"));

    artist.value?.album_artists?.forEach(album => {
        album.album_album.tracks?.forEach(track => {
            track.album_album = album.album_album;
        })
    })
}
onMounted(loadArtist)


const apiUpdateIsLoading = ref(false);
const startToUpdateFromApi = ()=>{
    apiUpdateIsLoading.value = true;
    try 
    {
        $fetch(`/api/artist/${route.params.artist}/update-from-api`)
        toast.add({
            title: 'Success !',
            color: "success"
        });
        loadArtist()
    }
    catch (err)
    {
        toast.add({
            title: 'Error !',
            description: 'Error while fetching from Spotify',
            color: "error"
        });
    }
    apiUpdateIsLoading.value = false;
    loadArtist();
}

</script>