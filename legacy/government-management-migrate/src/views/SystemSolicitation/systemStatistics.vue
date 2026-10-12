<template>
  <statistics-table
    tableCode="SYS_STATICS"
    :columns="columns"
    type="system"
    detailParam="deptId"
    :title="pageTitle"
  ></statistics-table>
</template>
<script setup lang="ts">
import { TableColumnsType } from "ant-design-vue";
import statisticsTable from "../../components/common/statisticsTable.vue";
import { usePageName } from '@ghcloud/cube-utils'
const { pageTitle } = usePageName()
const columns: TableColumnsType = [
  {
    title: "所在部门",
    dataIndex: "deptName",
    key: "deptName",
    align: "center",
  },
  {
    title: "制度征求次数",
    dataIndex: "applyNum",
    key: "applyNum",
    align: "center",
  },
  {
    title: "操作",
    dataIndex: "action",
    key: "action",
    align: "center",
  },
];

</script>
<style lang="less" scoped>
</style>


