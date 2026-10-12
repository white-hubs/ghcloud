<template>
  <component :is="loginStyle" />
</template>
<script setup>
import { onMounted } from 'vue'
import AsyncLoginTemplate from './login-template/template-1/template-1.vue'
import PoliceLoginTemplate from './login-template/template-2/template-2.vue'

const config = {
  asyncLoginTemplate: AsyncLoginTemplate,
  policeLoginTemplate: PoliceLoginTemplate,
}
// 其他平台登录认证路径
const otherPlatformLoginPath = window?.config?.feature?.otherPlatformLoginPath ?? ''
onMounted(() => {
  if(otherPlatformLoginPath && otherPlatformLoginPath.startsWith('http')){
    window.location.href = otherPlatformLoginPath
  }
})

const loginStyle = config[window.config.feature.loginStyle || 'asyncLoginTemplate']
</script>
<style>
:root{
  --design-width: 1920;
}
</style>