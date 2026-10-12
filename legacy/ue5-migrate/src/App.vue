<template>
  <a-config-provider :locale="locale">
    <router-view />
  </a-config-provider>
</template>
<script setup lang="ts">
import { onMounted, ref } from "vue";
import zhCN from "ant-design-vue/es/locale/zh_CN";
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
import { antd3LegacyThemeManager, themeManager } from '@ghcloud/cube-theme'

const locale = ref(zhCN);
dayjs.locale('zh-cn')

onMounted(() => {
  themeManager.mount()
  antd3LegacyThemeManager.mount()
})

</script>
<style scoped>
#genericEquipmentMonitorApp {
  width: 100%;
  height: 100%;
}

body {
  font-size: 16px;
}
</style>
