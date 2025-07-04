<template>
  <div>
    <div class="overlay">
      Logging out...
    </div>
  </div>
</template>

<script lang="ts" setup>
  await $fetch('/api/logout');
</script>

<style>

</style>