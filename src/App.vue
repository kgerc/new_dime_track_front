<template>
  <router-view />
</template>

<script setup>
import { useAuthStore } from 'src/stores/authStore'

const auth = useAuthStore()
auth.init()
</script>
