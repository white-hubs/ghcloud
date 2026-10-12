<template>
  <a-config-provider :locale="locale">
    <RouterView></RouterView>
  </a-config-provider>
</template>
<script setup lang="ts">
import { ConfigProvider } from "ant-design-vue";
import zh_CN from "ant-design-vue/es/locale/zh_CN";
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
import { ref } from "vue";
dayjs.locale('en');
//动态主题
ConfigProvider.config({
  theme: {
    primaryColor: "#00ba8b",
  },
});
const locale = ref(zh_CN);
</script>
<style>
#governmentManagement {
  width: 100%;
  height: 100%;
}
</style>
