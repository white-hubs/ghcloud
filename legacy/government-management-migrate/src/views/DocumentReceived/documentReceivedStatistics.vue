<template>
  <statistics-table tableCode="DOCUMENT_RECEIVED" :columns="columns" type="documentReceived" :title="pageTitle"></statistics-table>
</template>
<script setup lang="ts">
import { TableColumnsType } from "ant-design-vue";
import moment from "moment";
import statisticsTable from "../../components/common/statisticsTable.vue";
import { usePageName } from '@ghcloud/cube-utils'
const { pageTitle } = usePageName()
const columns: TableColumnsType = [
  {
    title: "来文单位",
    dataIndex: "fromUnit",
    key: "fromUnit",
    width: 200,
    ellipsis: true
  },
  {
    title: "来文编号",
    dataIndex: "fileCode",
    key: "fileCode",
    width: 200,
    ellipsis: true
  },
  {
    title: "发起人",
    dataIndex: "applicantName",
    key: "applicantName",
  },
  {
    title: "发起时间",
    dataIndex: "applyTime",
    key: "applyTime",
    customRender: ({ text }) => {
      return moment(text).format("YYYY-MM-DD HH:mm:ss");
    },
  },
  {
    title: "处理时间",
    dataIndex: "applyDoneTime",
    key: "applyDoneTime",
    customRender: ({ text }) => {
      return moment(text).format("YYYY-MM-DD HH:mm:ss");
    },
  },
  {
    title: "完成时限",
    dataIndex: "timeLimit",
    key: "timeLimit",
    customRender: ({ text }) => {
      return text ? text : "--";
    },
  },
  {
    title: "是否超时",
    dataIndex: "timeout",
    key: "timeout",
    customRender: ({ text }) => {
      return text ? text : "--";
    },
  },
  {
    title: "超时时长",
    dataIndex: "timeoutDesc",
    key: "timeoutDesc",
    customRender: ({ text }) => {
      return text ? text : "--";
    },
  },
];
</script>
<style lang="less" scoped></style>
