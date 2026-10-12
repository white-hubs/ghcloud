<template>
  <g-layout :title="`${nameTitle}详情`">
    <!-- <template #header-btn>

    </template> -->
    <template #content-table>
      <a-table :dataSource="tableSource" :columns="tableColumns" :scroll="{x: 1000, y: scrollY }" :loading="isLoading"
        :pagination="false" bordered size="middle"></a-table>
    </template>
    <template #footer-page>
      <a-pagination show-size-changer v-if="page.total > 0" v-model:pageSize="page.pageSize"
        v-model:current="page.pageNumber" :total="page.total" @change="pageChange" :default-current="1"
        :show-total="(total: number) => `共 ${total} 条数据`"></a-pagination>
      <a-button @click="back"
        style="margin-left: auto;display: flex;margin-top: 10px;margin-bottom: 10px;margin-right: 8px;">返回</a-button>
    </template>

  </g-layout>
</template>

<script setup lang="ts">
import gLayout from '@/components/common/gLayout.vue'
import { TableColumnsType } from 'ant-design-vue'
import { onMounted, onUnmounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { typeForColumnsMap, typeForMethods, typeForNameMap } from './index'
const route = useRoute()
const router = useRouter()
const { id, period, type } = route.query
const tableColumns: TableColumnsType = typeForColumnsMap.get(type as string) as TableColumnsType;
const nameTitle = typeForNameMap.get(type as string)
const tableSource = ref([])
const isLoading = ref(false)
const scrollY=ref(800)
const page = ref({
  pageNumber: 1,
  pageSize: 10,
  total: 0
})
const getScrollY = () => {
  const layoutContentHeight = document.getElementsByClassName(
    "layout-content"
  )[0] as HTMLDivElement;
  const contentSearchHeight = document.getElementsByClassName(
    "content-search"
  )[0] as HTMLDivElement;

  scrollY.value =
    layoutContentHeight.offsetHeight - contentSearchHeight.offsetHeight - 50;
};
const pageChange = (pageNumber: number, pageSize: number) => {
  page.value.pageNumber = pageNumber;
  page.value.pageSize = pageSize;
  getData();
};
const getData = async () => {
  isLoading.value = true
  try {
    const result = await typeForMethods.get(type as string)(id, { period, pageSize: page.value.pageSize, pageNumber: page.value.pageNumber })
    tableSource.value = result.data.records
    page.value.total = result.data.total
    isLoading.value = false
  } catch (error) {
    isLoading.value = false
  }
}
const back = () => {
  router.back()
}
onMounted(() => {
  getScrollY()
  getData()
  window.addEventListener("resize", getScrollY);
})
onUnmounted(()=>{
  window.removeEventListener("resize", getScrollY);
})
</script>

<style lang="less" scoped>
:deep(.layout-content) {
  height: calc(100% - 185px) !important;
  flex: 1;
}

:deep(.layout-footer) {
  height: auto !important;
}
</style>