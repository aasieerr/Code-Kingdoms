<script setup>
import { RouterView } from 'vue-router'
</script>

<template>
  <router-view />
</template>

<style>
html, body {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  touch-action: none; 
  user-select: none; 
}

#app {
  width: 100%;
  height: 100%;
}
</style>
