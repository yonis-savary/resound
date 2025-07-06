import { useStorage } from '@vueuse/core'
import { defineStore } from 'pinia'
import { defaultUserSettings } from '~/app/types/LocalUserSettings'

export const useSettingsStore = defineStore('settings', ()=>{

  const settings = useStorage('resound-settings', defaultUserSettings, undefined, {
    initOnMounted: true,
    mergeDefaults: true
  });

  return {
    settings
  };
})
