export default defineNuxtPlugin(() => {
  let effects: Record<string,HTMLAudioElement> | null = null;

  if (import.meta.client)
  {
    effects = {
        radar: new Audio("/assets/radar-sound.mp3"),
    };
  }
  // Configuration initiale si nécessaire
  return {
    provide: {
      effects
    }
  }
})