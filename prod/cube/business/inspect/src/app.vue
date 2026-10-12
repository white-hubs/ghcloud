<template>
  <ConfigProvider prefix-cls="inspection" :locale="zhCN">
    <RouterView />
  </ConfigProvider>
</template>
<script setup lang="ts">
import { ConfigProvider } from 'ant-design-vue'
import zhCN from 'ant-design-vue/es/locale/zh_CN'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'

dayjs.locale('zh-cn')

const activeKey = ref('1')
const router = useRouter()

watch(activeKey, () => {
  const routePath = activeKey.value === '1' ? '/static-route' : '/dynamic-route'
  router.push({
    path: routePath
  })
})

// 动态主题
ConfigProvider.config({
  theme: {
    primaryColor: '#00ba8b'
  },
  prefixCls: 'inspection'
})

</script>
