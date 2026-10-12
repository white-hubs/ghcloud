<template>
  <a-config-provider :locale="zhCN" prefix-cls="template">
    <RouterView></RouterView>
  </a-config-provider>
</template>
<script setup lang="ts">
import { ConfigProvider } from "ant-design-vue"
import zhCN from 'ant-design-vue/es/locale/zh_CN'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
dayjs.locale('zh-cn')

//动态主题
ConfigProvider.config({
  prefixCls: 'template',
  theme: {
    primaryColor: "#00ba8b",
  },
});
</script>
<style scoped></style>
