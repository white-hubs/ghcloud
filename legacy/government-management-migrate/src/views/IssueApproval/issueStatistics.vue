<template>
  <statistics-table tableCode="ISSUE_STATISTICS" :columns="columns" detailParam="deptId" type="issue" :title="pageTitle"></statistics-table>
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
    title: "议题预报次数",
    dataIndex: "applyNum",
    key: "applyNum",
    align: "center",
  },
  {
    title: "操作",
    dataIndex: "action",
    key: "action",
  },
];

</script>
<style lang="less" scoped></style>
