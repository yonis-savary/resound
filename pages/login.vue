<template>
    <div class="overlay">
        <div class="max-w-5xl flex flex-col flex-column align-center justify-center gap-5">
            <h1 class="text-3xl mx-auto">Resound</h1>
            <UInput v-model="username" type="text" placeholder="Username" />
            <UInput v-model="password" type="password" placeholder="Password" />
            <label class="flex flex-row items-center gap-3">
                <USwitch v-model="rememberMe" />
                Remember Me
            </label>
            <p v-if="errorLabel" class="text-red-400 font-bold">{{ errorLabel }}</p>
            <UButton class="justify-center" :disabled="loadingIsPending" @click="loginUser">Login</UButton>
        </div>
    </div>

</template>

<script setup lang="ts">
import { UButton, UInput } from '#components';
import { ref } from 'vue';

const username = ref('');
const password = ref('');
const rememberMe = ref(false);
const errorLabel = ref<string | null>(null)
const loadingIsPending = ref(false);

useHead({ title: 'Resound Login' })

const loginUser = async () => {
    loadingIsPending.value = true;

    const { redirect } = await $fetch<{ redirect?: string, token: string | null }>("/api/login", {
        method: "POST",
        body: {
            username: username.value,
            password: password.value,
            rememberMe: rememberMe.value
        }
    });

    if (redirect) {
        window.location.href = redirect;
    }
};



</script>