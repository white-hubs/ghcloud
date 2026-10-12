<template>
  <ThemeConfigProvider :theme="theme">
    <RouterView />
  </ThemeConfigProvider>
</template>
<script setup lang="ts">
import { ThemeConfigProvider } from '@ghcloud/cube-app-generic-component'

import { cubeAppService } from '@ghcloud/cube-app-js-sdk'
import { onMounted, ref } from 'vue'
const theme = ref('')
onMounted(async () => {
  theme.value = await cubeAppService.getAppTheme() ?? 'lightBlue'
})
</script>
