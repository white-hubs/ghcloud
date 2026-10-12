<template>
  <Breadcrumb>
    <template v-for="item in tabs">
      <BreadcrumbItem>{{ item.meta.title }}</BreadcrumbItem>
    </template>
  </Breadcrumb>
</template>
<script setup lang="ts">
import { onMounted, ref, type Ref, watch } from 'vue'
import { type RouteLocationMatched, useRoute } from 'vue-router'

const tabs:Ref<RouteLocationMatched[]> = ref([])
const route = useRoute()
const getBreadCom = () => {
  let mached = route.matched.filter(item => item.meta.title)

  if (route?.path === '/') {
    mached = [{ path: '/', meta: { title: '能耗分析' } } as any, { path: '/', meta: { title: '能耗总览' } } as any]
  }

  // 设置面包屑的数据
  tabs.value = mached
}
onMounted(() => {
  getBreadCom()
})

watch(() => route.path, () => getBreadCom())

</script>
<style lang="less">
.template-breadcrumb{
    text-align: left;
    line-height: 40px;
    background-color: #f0f2f5;
    margin-left: 16px;
}
</style>
