
<template>
  <ConfigProvider :locale="zhCN" prefix-cls="asset-management">
    <RouterView />
  </ConfigProvider>
</template>
<script setup lang="ts">
import { ConfigProvider } from 'ant-design-vue'
import zhCN from 'ant-design-vue/es/locale/zh_CN'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'

dayjs.locale('zh-cn')

// 动态主题
ConfigProvider.config({
  prefixCls: 'asset-management',
  theme: {
    primaryColor: '#00ba8b'
  }
})

</script>
<style>
#asset-management {
  width: 100%;
  height: 100%;
}
</style>
