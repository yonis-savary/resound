import { useDebounceFn, useStorageAsync, useWakeLock } from "@vueuse/core";
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
    const effects = nuxtApp.$effects as Record<string,HTMLAudioElement>;

    const currentTracklist = ref<Track[]>([]);
    const currentIndex = ref(0);
    const currentTrack = computed<Track | null>(() => currentTracklist.value[currentIndex.value] ?? null);
    const currentColor = computed<string>(() => lightenHex(currentTrack.value?.album_album.color ?? "#FFFFFF"));
    const currentDuration = computed(() => player.duration);
    const volume = useStorageAsync<number>('player-volume', 0.5);

    const { request: wakeLockRequest, release: wakeLockRelease } = useWakeLock();

    const isPlaying = ref(false);
    const currentTime = ref(0.0);

    watch(currentTrack, () => {
        if (!currentTrack.value)
        {
            if (player)
            {
                player.src = '';
                player.load();
            }
            return;
        }

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
    {
        player.volume = volume.value
    }
    watch(volume, (v) => {
        if (player)
            player.volume = v
    });

    const pause = () => { player?.pause() };
    const play = () => { player?.play() };

    if (player)
    {
        player.onplay = ()=> { 
            isPlaying.value = true; 
            wakeLockRequest('screen')
        }
        player.onpause = ()=> { 
            isPlaying.value = false; 
            wakeLockRelease()
        }


    }
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
        if (!(player?.src ?? false))
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

        player.oncanplay = ()=> {
            goToTime(state.currentTime ?? 0);
            player.oncanplay = null;
        }
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

    if (import.meta.client)
    {
        setInterval(() => {
            if (!isPlaying.value)
                return;

            refreshMediaSessionPositionState();
        }, 5000);
        setInterval(()=>{
            if (!isPlaying.value)
                return;

            $fetch('/api/player/player-state', {method:"POST", body: {index: currentIndex.value, currentTime: currentTime.value}});
        }, 3000);
    }


    const fadeDownVolume = async (ms: number , resolveAfter : number|null = null) =>{
        resolveAfter ??= ms;
        const volume = player.volume;
        const timeStep = ms/10;

        let c = 0;
        for (let i=1; i>=0; i-=0.1)
        {
            setTimeout(()=> player.volume = volume * i , timeStep*c)
            c++
        }

        return new Promise((resolve) => setTimeout(resolve, resolveAfter))
    }

    const fadeUpVolume = async (volume: number, ms: number, resolveAfter : number|null = null)=>
    {
        resolveAfter ??= ms;
        const timeStep = ms/10;

        let c = 0;
        for (let i=0; i<=1; i+=0.1)
        {
            setTimeout(()=> player.volume = volume * i , timeStep*c)
            c++
        }

        return new Promise((resolve) => setTimeout(resolve, resolveAfter))
    }

    const playEffect = async (effectName: string) => {
        if (!(effectName in effects))
            return;

        const currentTime = player.currentTime;
        const effect = effects[effectName];
        const durationMs = effect.duration * 1000;
        const currentVolume = player.volume;

        await fadeDownVolume(100, 100*0.75)

        effect.currentTime = 0
        effect.play();

        setTimeout(()=>{
            player.currentTime = currentTime-2;
            fadeUpVolume(currentVolume, 100);
        }, durationMs*0.6);

    };

    return {
        volume,
        currentTime,
        currentTrack,
        currentIndex,
        currentTracklist,
        currentDuration,
        isPlaying,
        currentColor,
        playEffect,
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
