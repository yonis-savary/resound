import { defineStore } from "pinia";
import { ref } from "vue";

const likedTracks = ref<number[]>([])

;(async () => {
    likedTracks.value = await $fetch<number[]>('/api/likes');
})();

const like = (track: number) => {
    $fetch(`/api/likes/${track}`, {method: 'POST'});
    likedTracks.value?.push(track);
};

const unlike = (track: number) => {
    $fetch(`/api/likes/${track}`, {method: 'DELETE'});
    likedTracks.value = likedTracks.value?.filter(id => id != track);
};

const isLiked = (track: number) =>
    likedTracks.value?.includes(track);

const initialize = async (tracks: number[])=>{
    likedTracks.value = tracks;
}

export const useLikesStore = defineStore('likes', function(){
    return {
        likedTracks,
        initialize,
        isLiked,
        like,
        unlike
    }
})