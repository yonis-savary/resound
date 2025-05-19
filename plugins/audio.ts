export default defineNuxtPlugin(() => {
  let audio: HTMLAudioElement | null = null;

  if (import.meta.client)
  {
    audio = new Audio();
    audio.preload = 'auto'
  }
  // Configuration initiale si nécessaire
  return {
    provide: {
      audioElement: audio
    }
  }
})