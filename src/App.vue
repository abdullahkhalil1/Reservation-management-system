<script setup lang="ts">
import { RouterView } from 'vue-router'
import ToastNotification from '@/shared/components/ToastNotification.vue'
</script>

<template>
  <RouterView />
  <ToastNotification />
</template>
