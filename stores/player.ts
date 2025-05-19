import { useDebounceFn, useStorageAsync } from "@vueuse/core";
import { defineStore } from "pinia";
import type { Track } from "~/models/Track";



const lightenHex = (hex: string) => {
    const rgb = hexToRgb(hex);

    if (!rgb)
        return hex;

    let { r, g, b } = rgb

    r = Math.round(r * 3);
    g = Math.round(g * 3);
    b = Math.round(b * 3);

    return rgbToHex(r, g, b);
}


const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

const componentToHex = (c: number) => {
    c = Math.min(c, 255);

    const hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}

const rgbToHex = (r: number, g: number, b: number) => {
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}



export const usePlayerStore = defineStore('player', () => {

    const nuxtApp = useNuxtApp();

    const player = nuxtApp.$audioElement as HTMLAudioElement;

    const currentTracklist = ref<Track[]>([]);
    const currentIndex = ref(0);
    const currentTrack = computed<Track | null>(() => currentTracklist.value[currentIndex.value] ?? null);
    const currentColor = computed<string>(() => lightenHex(currentTrack.value?.album_album.color ?? "#FFFFFF"));
    const currentDuration = computed(() => player.duration);
    const volume = useStorageAsync<number>('player-volume', 0.5);

    const isPlaying = ref(false);
    const currentTime = ref(0.0);

    watch(currentTrack, () => {
        if (!currentTrack.value)
            return;

        changeURL(currentTrack.value.id)
    })

    const refreshMediaSessionPositionState = () => {
        if (!player)
            return;

        if (!Number.isFinite(player.duration))
            return console.warn('Ignoring non finite value ', player.duration);

        navigator.mediaSession.setPositionState({ duration: Math.floor(player.duration), position: player.currentTime, playbackRate: player.playbackRate });
    };
    const refreshMediaSessionPositionStateDebounce = useDebounceFn(refreshMediaSessionPositionState, 1000);


    if (player)
        player.volume = volume.value
    watch(volume, (v) => {
        if (player)
            player.volume = v
    });

    const pause = () => { player?.pause(); isPlaying.value = false };
    const play = () => { player?.play(); isPlaying.value = true };

    const resetTime = () => goToTime(0);
    const goToNext = () => gotoIndex(currentIndex.value + 1, true);

    if (player)
        player.addEventListener('ended', goToNext);

    const goToPrevious = () => gotoIndex(currentIndex.value - 1, true);

    const stopLoading = () => {
        if (!player)
            return;

        player.src = "";
        player.load();
    }

    const changeURL = (trackId: number) => {
        stopLoading();
        if (!player)
            return;

        player.src = `/api/track/${trackId}/play`;
        player.load();
    }

    const changeTracklist = (newTracklist: Track[], startIndex: number = 0, autoplay: boolean = true) => {
        $fetch('/api/player/playlist', { method: "POST", body: { tracks: newTracklist.map(x => x.id) } });

        currentTracklist.value = newTracklist.filter(x => x.path !== null);
        const trueIndex = currentTracklist.value.findIndex(
            track => track.slug === newTracklist[startIndex].slug
        )
        gotoIndex(trueIndex, autoplay);
    };

    const gotoIndex = (index: number, autoplay: boolean = true) => {
        index = Math.max(index, 0);
        currentIndex.value = index
        resetTime();
        if (autoplay && player) {
            player.onloadeddata = play;
        }
    }

    const goToTime = async (seconds: number, useDebounce: boolean = true) => {
        if (!player || !player.src)
            return;

        seconds = Math.floor(seconds);

        player.currentTime = seconds;
        setTimeout(() => {
            if ('mediaSession' in navigator) {
                if (useDebounce)
                    refreshMediaSessionPositionStateDebounce();
                else
                    refreshMediaSessionPositionState();
            }
        }, 200)

    }

    $fetch('/api/player/player-state').then(async state => {
        const lastPlayslist = await $fetch('/api/player/playlist')
        changeTracklist(lastPlayslist, state?.index ?? 0, false);
        goToTime(state.currentTime ?? 0);
    })

    const prettyDuration = (timeInSeconds: number, hoursToo: boolean = false) => {
        timeInSeconds = Math.round(timeInSeconds);
        const hours = Math.floor(timeInSeconds / 3600).toString().padStart(2, '0')
        const minutes = Math.floor(timeInSeconds % 3600 / 60).toString().padStart(2, '0')
        const seconds = Math.floor(timeInSeconds % 60).toString().padStart(2, '0')

        return hoursToo
            ? `${hours}:${minutes}:${seconds}`
            : `${minutes}:${seconds}`
    }

    player?.addEventListener('timeupdate', () => {
        currentTime.value = player.currentTime
    })

    callOnce(() => {
        setInterval(() => {
            if (!isPlaying.value)
                return;

            refreshMediaSessionPositionState();
        }, 5000);
        // setInterval(()=>{
        // if (!isPlaying.value)
        // return;
        //         
        // $fetch('/api/player/player-state', {method:"POST", body: {index: currentIndex.value, currentTime: currentTime.value}});
        // }, 3000);
    })





    return {
        volume,
        currentTime,
        currentTrack,
        currentIndex,
        currentTracklist,
        currentDuration,
        isPlaying,
        currentColor,
        prettyDuration,
        changeTracklist,
        goToNext,
        goToPrevious,
        goToTime,
        resetTime,
        gotoIndex,
        pause,
        play,
        refreshMediaSessionPositionState
    }
})
