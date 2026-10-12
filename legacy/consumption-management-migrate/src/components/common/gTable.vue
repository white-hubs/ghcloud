<template>
  <Table
    :columns="columns"
    :data-source="dataSource"
    :pagination="false"
    :scroll="scrollInfo"
    bordered
  ></Table>
  <div style="overflow: hidden" v-if="showpagination">
    <Pagination
      style="position: absolute; right: 15px; bottom: 0"
      show-size-changer
      v-model:current="pagination.pageNumber"
      v-model:pageSize="pagination.pageSize"
      :total="pagination.total"
      :showTotal="
        total =>
          `共 ${total} 条   第${pagination.pageNumber}/${Math.ceil(
            total / pagination.pageSize,
          )}页`
      "
      @change="onShowSizeChange"
    />
  </div>
</template>
<script setup lang="ts">
import { Table, Pagination } from "ant-design-vue";

interface Props {
  /** 标题 */
  title?: string;
  columns?: any;
  dataSource?: any;
  pagination?: any;
  showpagination?: boolean;
  scrollInfo?: any;
}
const emit = defineEmits(["changeSize"]);
const props = withDefaults(defineProps<Props>(), {
  showpagination: true,
  title: "",
  columns: [],
  dataSource: [],
  scrollInfo: {},
  pagination: {
    pageSize: 10,
    pageNumber: 1,
    total: 0,
  },
});
/**分页数据 */
const onShowSizeChange = (current: number, pageSize: number) => {
  emit("changeSize", { current, pageSize });
};
</script>
<style lang="less" scoped></style>
