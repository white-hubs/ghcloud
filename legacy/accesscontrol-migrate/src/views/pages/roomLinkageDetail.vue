<template>
  <g-layout title="门禁联动详情">
    <template #content-data>
      <gDetailFormRef :api="api" :formList="formList" :afterGet="afterGet" />
    </template>
    <template #content-table>
      <g-table title="气体联动配置" rowKey="gasType" :columns="columns" :btns="[]" :search="[]" :api="gasApi" :beforeGet="beforeGet" />
    </template>
    <template #footer-page><a-button @click="back">返回</a-button><a-button type="primary" @click="edit">编辑</a-button></template>
  </g-layout>
</template>

<script lang="jsx">
import { defineComponent, reactive } from "vue";
import { useRoute } from "vue-router";

import { pushLinkageRoute } from "./linkage/navigation";
import gDetailFormRef from "@/components/Common/gDetailFormRef.vue";
export default defineComponent({
  components: { gDetailFormRef },
  setup() {
    const route = useRoute();
    const state = reactive({
      api: { detail: "getDoorGasLinkageConfigDetail" },
      gasApi: { list: "getDoorGasLinkageGasList" },
      formList: [
        {
          title: "基础信息",
          form: [
            { label: "门禁名称", value: "doorName", plaintext: true },
            { label: "设备编码", value: "deviceCode", plaintext: true },
            { label: "所属区域", value: "areaName", plaintext: true },
            { label: "设备类型", value: "productCategoryName", plaintext: true },
          ],
        },
        {
          title: "气体联动",
          form: [
            { label: "气体联动", value: "gasLinkageEnabled", plaintext: true, detailFun: (value) => (value ? "已启用" : "未启用") },
            { label: "数据有效时长", value: "dataValidSeconds", plaintext: true, unit: "秒" },
          ],
        },
      ],
      columns: [
        { title: "气体", dataIndex: "gasName", key: "gasName", ellipsis: true },
        {
          title: "传感器设备",
          dataIndex: "sensorDeviceName",
          key: "sensorDeviceName",
          ellipsis: true,
          customRender: ({ text }) => text || "未绑定",
        },
        { title: "阈值", dataIndex: "threshold", key: "threshold", ellipsis: true },
        { title: "校验状态", dataIndex: "validationStatus", key: "validationStatus", ellipsis: true },
      ],
    });
    const afterGet = (data) => ({
      ...data,
      doorName: data.door?.deviceName,
      deviceCode: data.door?.deviceCode,
      areaName: data.door?.areaName,
      productCategoryName: data.door?.productCategoryName,
    });
    const doorDeviceId = route.params.id;
    const beforeGet = (params) => ({ ...params, doorDeviceId });
    return {
      ...state,
      afterGet,
      beforeGet,
      back: () => pushLinkageRoute("/roomLinkagePage"),
      edit: () => pushLinkageRoute(`/roomLinkagePage/${doorDeviceId}/edit`, { type: "edit", id: doorDeviceId }),
    };
  },
});
</script>
