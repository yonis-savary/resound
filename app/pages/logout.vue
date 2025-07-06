<template>
  <div>
    <div class="overlay">
      Logging out...
    </div>
  </div>
</template>

<script lang="ts" setup>
  $fetch('/api/logout').then(()=>{
    window.location.href = '/login';
  });
</script>

<style>

</style>