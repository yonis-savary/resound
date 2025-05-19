<template>
    <div class="overlay">
        <div class="max-w-5xl flex flex-col flex-column align-center justify-center gap-5">
            <h1 class="text-3xl mx-auto">Resound</h1>
            <UInput v-model="username" type="text" placeholder="Username"/>
            <UInput v-model="password" type="password" placeholder="Password"/>
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
const errorLabel = ref<string|null>(null)
const loadingIsPending = ref(false);

const loginUser = async () => {
    loadingIsPending.value = true;

    try
    {
        const response = await $fetch<{redirect?: string}>("/api/login", {method: "POST", body: {username: username.value, password: password.value}});

        if (response.redirect) {
            window.location.href = response.redirect;
        }
    } catch (err) {
        console.error(err);
        errorLabel.value = "Invalid username or password"; // Gère les erreurs
    } finally {
        loadingIsPending.value = false;
    }
};



</script>