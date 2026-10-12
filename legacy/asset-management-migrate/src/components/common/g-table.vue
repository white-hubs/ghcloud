<template>
  <Table
    :columns="props.columns" :data-source="dataSource" :pagination="false" :row-selection="rowSelection!"
    :scroll="scrollInfo!" size="small" bordered :loading="loading"
  />
  <Teleport v-if="gLayoutInitStatus" to=".layout-footer" :disabled="props.disableTeleport">
    <Pagination
      v-model:current="pagination.pageNumber" v-model:pageSize="pagination.pageSize" show-size-changer
      :total="pagination.total" :default-current="1" :show-total="showTotalText" :class="{'disable-teleport':props.disableTeleport}"
      @change="onShowSizeChange"
    />
  </Teleport>
</template>
<script setup lang="ts">
import type { ColumnsType } from 'ant-design-vue/lib/table'
import type { TableRowSelection } from 'ant-design-vue/lib/table/interface'
import { computed, inject, ref } from 'vue'
const gLayoutInitStatus = inject('GLayout-initStatus');
const emit = defineEmits(['changeSize'])

const props = withDefaults(defineProps<{
  title?: string;
  columns: ColumnsType;
  pagination?: {pageSize:number; pageNumber:number; total:number;};
  rowSelection?: TableRowSelection<unknown>;
  showpagination: boolean;
  scrollInfo?: Record<string, number>;
  disableTeleport?:boolean;
}>(), {
  showpagination: true,
  title: '',
  columns: () => [],
  scrollInfo: () => {
    return {
      x: 1000,
      y: 520
    }
  },
  pagination: () => {
    return {
      pageSize: 10,
      pageNumber: 1,
      total: 0
    }
  },
  rowSelection: () => {
    return {}
  },
  disableTeleport: false
})
const pagination = ref(props.pagination ?? {
  pageSize: 10,
  pageNumber: 1,
  total: 0
})
const showTotalText = computed(() => {
  return (total: number) =>
    `共 ${total} 条   第${pagination.value.pageNumber}/${Math.ceil(total / pagination.value.pageSize)}页`
})
const loading = ref(false)
const dataSource = ref<unknown[]>([])
/** 分页数据 */
const onShowSizeChange = (current: number, pageSize: number) => {
  emit('changeSize', { current, pageSize })
}

</script>
<style lang="less" scoped>
:deep(.asset-management-table-cell) {
  white-space: nowrap;
}
.disable-teleport{
  margin-top: 10px;
  float: right;
}
</style>
