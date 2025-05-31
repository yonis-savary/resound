<template>
  <div ref="pageRoot" class="dark">
    <NuxtRouteAnnouncer/>
    <ResoundBackground/>
    <div ref="pageContent" class="page-content" >
      <UApp>
        <ResoundNavbar/>
        <NuxtPage />
        <Player/>
      </Uapp>
    </div>
    <MobileScreenSaver/>
    <Toast/>
  </div>
</template>


<script setup lang="ts">
import Player from './components/tracks/player.vue';
import { UserSpecialActionsConfigs } from './types/LocalUserSettings';

const playerStore = usePlayerStore();
const settings = useSettingsStore();
const pageRoot = useTemplateRef('pageRoot');
const specialActionsSettings = UserSpecialActionsConfigs

useHead({ 
  link: [{
    rel: 'manifest',
    href: '/manifest.json'
  }]
})

watch(()=> playerStore.currentTrack, (currentTrack)=>{
  const color = currentTrack?.album_album.color
  if (!color)
    return;

  pageRoot.value?.style.setProperty('--ui-primary', color)
})

const triggerPreviousButtonAction = ()=>{
  (specialActionsSettings[settings.settings.specialActions.previous].callback)();

  const effect = specialActionsSettings[settings.settings.specialActions.previous].effect;
  if (effect) playerStore.playEffect(effect);
}
const triggerNextButtonAction = ()=>{
  (specialActionsSettings[settings.settings.specialActions.next].callback)();

  const effect = specialActionsSettings[settings.settings.specialActions.next].effect;
  if (effect) playerStore.playEffect(effect);
}

let handleShuffleLauncherTimeout: ReturnType<typeof setTimeout>|null = null;
async function handleShuffleLauncher()
{
  if (!settings.settings.enableSpecialButtons){
    return playerStore.goToPrevious();
  }

  if (handleShuffleLauncherTimeout) {
      clearTimeout(handleShuffleLauncherTimeout);
      handleShuffleLauncherTimeout = null;
      triggerPreviousButtonAction()
      return;
  }

  handleShuffleLauncherTimeout = setTimeout(() => {
      if(handleShuffleLauncherTimeout)
        clearTimeout(handleShuffleLauncherTimeout);
      handleShuffleLauncherTimeout = null;
      playerStore.goToPrevious();
  }, 1000);
}



let handleNextButtonActionTimeout: ReturnType<typeof setTimeout>|null = null;
async function handleNextButtonAction()
{
  if (!settings.settings.enableSpecialButtons)
    return playerStore.goToNext();

  if (handleNextButtonActionTimeout) {
      clearTimeout(handleNextButtonActionTimeout);
      handleNextButtonActionTimeout = null;
      triggerNextButtonAction();
      return;
  }

  handleNextButtonActionTimeout = setTimeout(() => {
      if(handleNextButtonActionTimeout)
        clearTimeout(handleNextButtonActionTimeout);
      handleNextButtonActionTimeout = null;
      playerStore.goToNext();
  }, 1000);
}



if (navigator && ("mediaSession" in navigator) ){

    watch(()=>playerStore.currentTrack, (currentTrack) => {
        if (!currentTrack)
            return;

        navigator.mediaSession.metadata = new MediaMetadata({
            title: currentTrack.name,
            artist: currentTrack.track_artists?.map((artist) => artist.artist_artist.name).join(", "),
            album: currentTrack.album_album.name,
            artwork: [
                {
                    src: '/api/album/' + currentTrack.album_album.id + '/picture',
                    sizes: "128x128",
                    type: "image/png",
                },
            ],
        });
        playerStore.refreshMediaSessionPositionState();
    })

    navigator.mediaSession.setActionHandler("play", playerStore.play);
    navigator.mediaSession.setActionHandler("pause", playerStore.pause);
    navigator.mediaSession.setActionHandler("stop", playerStore.pause);
    navigator.mediaSession.setActionHandler("seekto", (event) => {
        const seekTime = event.seekTime;
        if (!seekTime)
            return;

        playerStore.goToTime(seekTime, false)
    });
    navigator.mediaSession.setActionHandler("previoustrack", handleShuffleLauncher);
    navigator.mediaSession.setActionHandler("nexttrack", handleNextButtonAction);
}
</script>