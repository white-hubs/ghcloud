<!-- eslint-disable @typescript-eslint/no-unused-vars -->
<!-- eslint-disable @typescript-eslint/no-unused-vars -->
<!-- eslint-disable vue/no-mutating-props -->
<template>
  <Table
    :columns="columns"
    :data-source="dataSource"
    :pagination="false"
    :scroll="scrollInfo"
    bordered
  />
  <div v-if="showpagination" style="overflow: hidden">
    <Pagination
      v-model:current="pagination.pageNumber"
      v-model:pageSize="pagination.pageSize"
      style="position: absolute; right: 15px; bottom: 0"
      show-size-changer
      :total="pagination.total"
      :show-total="
        total =>
          `共 ${total} 条   第${pagination.pageNumber}/${Math.ceil(
            total / pagination.pageSize,
          )}页`
      "
      @change="onShowSizeChange"
    />
  </div>
</template>
<script lang="ts" setup>
import { Pagination, Table } from 'ant-design-vue'
import { defineEmits } from 'vue'
interface Props {
  /** 标题 */
  title?: string;
  columns?: any;
  dataSource?: any;
  pagination?: any;
  showpagination?: boolean;
  scrollInfo?: any;
}

const emit = defineEmits(['changeSize'])
const props = withDefaults(defineProps<Props>(), {
  showpagination: true,
  title: '',
  columns: [],
  dataSource: [],
  scrollInfo: {},
  pagination: {
    pageSize: 10,
    pageNumber: 1,
    total: 0
  }
})
/** 分页数据 */
const onShowSizeChange = (current: number, pageSize: number) => {
  emit('changeSize', { current, pageSize })
}
</script>
<style lang="less" scoped></style>
