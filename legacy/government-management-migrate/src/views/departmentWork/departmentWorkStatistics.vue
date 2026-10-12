<template>
    <statistics-table
      :columns="columns"
      tableCode="DEPART_WORK_STATISTICS"
      type="keywork"
      :title="pageTitle"
    ></statistics-table>
</template>
<script setup lang="ts">
import { TableColumnsType } from "ant-design-vue";
import { ref } from "vue";
import statisticsTable from "../../components/common/statisticsTable.vue";
import { usePageName } from '@ghcloud/cube-utils'
const { pageTitle } = usePageName()
const columns: TableColumnsType = [
  {
    title: "部门",
    dataIndex: "deptName",
    key: "deptName",
    align:"center"
  },
  {
    title: "发起次数",
    dataIndex: "applyNum",
    key: "applyNum",
    align:"center"
  },
  {
    title: "审批通过次数",
    dataIndex: "passNum",
    key: "passNum",
    align:"center"
  },
];
</script>
<style lang="less" scoped>
</style>
