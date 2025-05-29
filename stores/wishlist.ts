import { defineStore } from "pinia";
import { ref } from "vue";

const wishedAlbums = ref<number[]>([]);

;(async () => {
    wishedAlbums.value = await $fetch<number[]>('/api/wishlist')
})();

const wish = (album: number) => {
    $fetch(`/api/wishlist/${album}`, {method: 'POST'});
    wishedAlbums.value?.push(album);
};

const unwish = (album: number) => {
    $fetch(`/api/wishlist/${album}`, {method: 'DELETE'});
    wishedAlbums.value = wishedAlbums.value?.filter(id => id != album);
};

const isWished = (album: number) =>
    wishedAlbums.value?.includes(album);

const initialize = async (album: number[])=>{
    wishedAlbums.value = album;
}

export const useWishListStore = defineStore('wishlist', function(){
    return {
        initialize,
        isWished,
        wish,
        unwish
    }
})