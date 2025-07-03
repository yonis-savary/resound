<template>
    <div class="container flex flex-col gap-8">
        <h1 class="text-5xl">Setting</h1>


        <h2 class="text-3xl">Your configuration</h2>

        <label class="flex items-center gap-3">
            Enable special actions on previous/next buttons
            <USwitch v-model="settings.settings.enableSpecialButtons" />
        </label>


        <div v-if="settings.settings.enableSpecialButtons" class="flex flex-row w-full gap-3">
            <div class="flex flex-col gap-1 flex-1">
                <span>Previous button special action</span>
                <USelect v-model="settings.settings.specialActions.previous" :items="actionsItems"/>
            </div>
            <div class="flex flex-col gap-1 flex-1">
                <span>Next button special action</span>
                <USelect v-model="settings.settings.specialActions.next" :items="actionsItems"/>
            </div>
        </div>

        <h2 class="text-3xl">Library</h2>

        <div class="flex">
            <UButton class="justify-center flex flex-col" @click="launchSynchronization">
                <Icon class="spinning-arrows" :class="{'spinning': syncIsLoading }" name="ic:baseline-sync" size="110"/>
                Launch synchronization
            </UButton>
        </div>
    </div>
</template>


<script setup lang="ts">
import { UserSpecialActionsConfigs } from '~/types/LocalUserSettings';

const toast = useToast();
const settings = useSettingsStore()

const syncIsLoading = ref(false);

useHead({ title: 'Settings' })

const actionsItems = Object.entries(UserSpecialActionsConfigs).map(([key, config]) => ({
    label: config.label,
    value: key
}));

const launchSynchronization = async ()=>{
    syncIsLoading.value = true;
    toast.add({
        title: 'Synchronization launched',
        description: 'Synchronization launched successfully'
    })
    await $fetch<string>('/api/library/explore');
    toast.add({
        title: 'Successful synchronization',
        description: 'Synchronization ended successfully'
    })
    syncIsLoading.value = false;
}

watch(()=>settings, ()=>{
    toast.add({
        title: 'Setting saved'
    });
}, {deep: true})
</script>

<style>

@keyframes spinning {
    from { rotate: 0; }
    to { rotate: 360deg; }
}

.spinning-arrows {
    transform: scaleX(-1);
}

.spinning 
{
    animation: spinning 1s infinite linear;
}

</style>