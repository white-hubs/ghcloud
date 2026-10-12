<template>
  <ConfigProvider prefix-cls="electronic-patrol" :locale="zhCN">
    <RouterView />
  </ConfigProvider>
</template>
<script setup lang="ts">

import { ConfigProvider } from 'ant-design-vue'
import zhCN from 'ant-design-vue/es/locale/zh_CN'
import 'dayjs/locale/zh-cn'
import dayjs from 'dayjs';
dayjs.locale('zh-cn')
// 动态主题

</script>
