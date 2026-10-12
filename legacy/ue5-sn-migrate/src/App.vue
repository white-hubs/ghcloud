<template>
  <a-config-provider :locale="locale" :theme="theme">
    <router-view />
  </a-config-provider>
</template>
<script setup lang="ts">
import zhCN from "ant-design-vue/es/locale/zh_CN";
import dayjs from "dayjs";
import { ref } from "vue";
import "dayjs/locale/zh-cn";

dayjs.locale("zh-cn");

const locale = ref(zhCN);
/** 深色大屏下 placeholder / 浮层对比度，避免筛选控件文字看不见 */
const theme = {
  token: {
    colorTextPlaceholder: "rgba(217, 231, 255, 0.75)",
    colorBgElevated: "#102844",
    colorBgContainer: "rgba(16, 40, 68, 0.9)",
    colorBorder: "rgba(41, 137, 255, 0.4)",
    controlItemBgActive: "rgba(41, 137, 255, 0.35)",
    borderRadius: 4,
    controlHeight: 32,
  },
};
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
