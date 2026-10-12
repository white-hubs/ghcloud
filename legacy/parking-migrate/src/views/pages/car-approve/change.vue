<template>
  <g-table
    title="变更车辆审批"
    tableCode="PARKING_MANAGE_CAR_APPROVE_CHANGE"
    :columns="state.columns"
    :search="state.search"
    :api="state.api"
    :btns="[]"
    :beforeGet="beforeGet"
    :isShowMore="false"
    ref="tableRef"
    :scroll="{ x: 1000, y: 520 }"
    size="middle"
    :extraSearchModel="extraSearchModel"
  >
    <template #pre-item="{ record }">
      <a-radio-group v-model:value="extraSearchModel.type" button-style="solid" @change="changeData(record)" style="margin-right: 16px">
        <a-radio-button v-for="item in state.options" :key="item.value" :value="item.value">{{ item.label }}</a-radio-button>
      </a-radio-group>
    </template>
    <template #header-btns>
      <a-button type="primary" @click="addFlow">新增</a-button>
    </template>
    <template #beforeBtn="{ record }">
      <a-button type="link" @click="goDetail(record)">详情</a-button>
    </template>
  </g-table>
</template>
<script setup lang="ts">
import dayjs from "dayjs";
import { reactive, ref } from "vue";

import { BusinessType, appName } from "./type";
const statusText = (str: string) => {
  const statusMap = new Map([
    ["SUBMIT", "提交"],
    ["UNDO", "撤销"],
    ["REPEAT", "重新提交"],
    ["APPROVAL", "审批"],
    ["BACK", "撤回"],
    ["COPY", "抄送"],
    ["REJECT", "驳回"],
    ["FINISHED", "完成"],
  ]);
  return statusMap.get(str) || "处理中";
};
const tableRef = ref();
const state = reactive({
  api: {
    list: "getFlowProcessList",
  },
  options: [
    {
      label: "全部",
      value: "ALL",
    },
    {
      label: "待我处理",
      value: "WAITING",
    },
    {
      label: "我发起的",
      value: "SUBMIT",
    },
    {
      label: "抄送给我",
      value: "SERVED",
    },
    {
      label: "已处理",
      value: "PROCESSED",
    },
  ],
  search: [
    {
      label: "状态",
      value: "status",
      component: "a-select",
      options: [
        { value: "ACTIVE", label: "处理中" },
        { value: "REJECT", label: "驳回" },
        { value: "UNDO", label: "撤销" },
        { value: "FINISHED", label: "完成" },
      ],
      placeholder: "请选择状态",
      width: "160px",
    },
    {
      label: "发起时间",
      value: "date",
      component: "a-range-picker",
      defaultDate: "submitTime",
      placeholder: ["开始时间", "结束时间"],
    },
    {
      label: "发起部门",
      value: "organizationId",
      url: "deptList",
      component: "g-select",
      field: { id: "value", name: "label" },
      placeholder: "请选择发起部门",
      width: "160px",
    },
    {
      label: "发起人",
      value: "username",
      placeholder: "请输入人员姓名",
      width: "180px",
    },
  ],
  columns: [
    {
      title: "编号",
      dataIndex: "formNo",
      key: "formNo",
      customRender: ({ text }) => {
        return text || "-";
      },
    },
    {
      title: "发起人",
      dataIndex: "startUserName",
      key: "startUserName",
      customRender: ({ text }) => {
        return text || "-";
      },
    },
    {
      title: "发起时间",
      dataIndex: "submitedTime",
      key: "submitedTime",
      customRender: ({ text }) => {
        return text ? dayjs(text).format("YYYY-MM-DD HH:mm:ss") : "-";
      },
    },
    {
      title: "处理状态",
      dataIndex: "status",
      key: "status",
      customRender: ({ text }) => {
        return text ? statusText(text) : "-";
      },
    },
    {
      title: "处理进度",
      dataIndex: "activeNodeName",
      key: "activeNodeName",
      customRender: ({ text }) => {
        return text || "-";
      },
    },
    {
      title: "操作",
      dataIndex: "action",
      key: "action",
      slots: {
        customRender: "action",
      },
    },
  ],
});
const extraSearchModel = reactive({
  type: "ALL",
});
const changeData = (record) => {
  tableRef.value.searchRecord();
};
const beforeGet = (params) => {
  return {
    ...params,
    type: extraSearchModel.type,
    businessType: BusinessType.VECHICLE_UPDATE,
  };
};
const addFlow = () => {
  history.pushState(
    { current: location.pathname + location.search },
    "",
    `/portal/stream-engine-render/index?businessType=${BusinessType.VECHICLE_UPDATE}&appName=${appName}&type=add&title=车辆审批`,
  );
};
const goDetail = (row) => {
  const { processInstanceId, currentTaskId, status } = row;
  history.pushState(
    { current: location.pathname + location.search },
    "",
    `/portal/stream-engine-render/index?businessType=${BusinessType.VECHICLE_UPDATE}&appName=${appName}&processInstanceId=${processInstanceId}&currentTaskId=${currentTaskId}&status=${status}&type=detail&title=车辆审批`,
  );
};
</script>
<style lang="less" scoped>
.flow-table {
  height: 100%;
}

:deep(.content-table) {
  padding-right: 2px;
  overflow: overlay !important;
}
</style>
