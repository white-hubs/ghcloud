<template>
    <statistics-table
      :columns="columns"
      tableCode="CIRCULATION_STATISTICS"
      :modal-table-columns="modalTableColumns"
      title="传阅统计"
    ></statistics-table>
</template>
<script setup lang="ts">
import { TableColumnsType } from "ant-design-vue";
import { ref } from "vue";
import statisticsTable from "../../components/common/statisticsTable.vue";
const columns: TableColumnsType = [
  {
    title: "文件名称",
    dataIndex: "title",
    key: "title",
  },
  {
    title: "发起时间",
    dataIndex: "applyTime",
    key: "applyTime",
  },
  {
    title: "传阅人数",
    dataIndex: "totalNum",
    key: "totalNum",
  },
   {
    title: "已处理人数",
    dataIndex: "handleNum",
    key: "handleNum",
  },
  {
    title: "操作",
    dataIndex: "action",
    key: "action",
  },
];
const modalTableColumns: TableColumnsType = [
  {
    title: "姓名",
    dataIndex: "userName",
    key: "userName",
  },
  {
    title: "部门名称",
    dataIndex: "deptName",
    key: "deptName",
  },
  {
    title: "处理状态",
    dataIndex: "status",
    key: "status",
  },
  {
    title: "处理时间",
    dataIndex: "handleTime",
    key: "handleTime",
  },
];
</script>
<style lang="less" scoped>
</style>
