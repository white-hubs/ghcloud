<template>
  <g-table title="门禁联动" rowKey="doorDeviceId" :columns="columns" :btns="[]" :search="search" :api="api" :beforeGet="beforeGet">
    <template #beforeBtn="{ record }"
      ><a-button type="link" @click="goDetail(record.doorDeviceId)">查看</a-button
      ><a-button type="link" @click="goEdit(record.doorDeviceId)">编辑</a-button></template
    >
  </g-table>
</template>

<script lang="jsx">
import { defineComponent, reactive } from "vue";

import { pushLinkageRoute } from "./linkage/navigation";
export default defineComponent({
  setup() {
    const state = reactive({
      api: { list: "getDoorGasLinkageConfigPage" },
      search: [
        {
          label: "气体联动",
          value: "gasLinkageEnabled",
          component: "a-select",
          options: [
            { value: "true", label: "已启用" },
            { value: "false", label: "未启用" },
          ],
          placeholder: "请选择气体联动状态",
        },
        {
          label: "所属区域",
          value: "cascaderIds",
          defaultData: "areaId",
          valueType: "number",
          component: "g-cascader",
          url: "getAreaList",
          field: { id: "value", name: "label", children: "children" },
          showSearch: true,
          placeholder: "请选择所属区域",
        },
      ],
      columns: [
        { title: "门禁名称", dataIndex: "doorName", key: "doorName", ellipsis: true },
        { title: "所属区域", dataIndex: "areaName", key: "areaName", ellipsis: true },
        { title: "设备编码", dataIndex: "deviceCode", key: "deviceCode", ellipsis: true },
        {
          title: "气体联动",
          dataIndex: "gasLinkageEnabled",
          key: "gasLinkageEnabled",
          ellipsis: true,
          customRender: ({ record }) =>
            record.gasLinkageEnabled
              ? `已启用${record.configuredGasTypes?.length ? ` — ${record.configuredGasTypes.join(" ")}` : ""}`
              : "未启用",
        },
        { title: "操作", dataIndex: "action", key: "action", width: 150, fixed: "right", slots: { customRender: "action" } },
      ],
    });
    const beforeGet = ({ pageNumber, pageSize, areaId, gasLinkageEnabled }) => {
      const payload = { pageNumber, pageSize };
      if (areaId != null && areaId !== "") payload.areaId = areaId;
      if (gasLinkageEnabled === "true") payload.gasLinkageEnabled = true;
      if (gasLinkageEnabled === "false") payload.gasLinkageEnabled = false;
      return payload;
    };
    return {
      ...state,
      beforeGet,
      goDetail: (id) => pushLinkageRoute(`/roomLinkagePage/${id}`, { type: "detail", id }),
      goEdit: (id) => pushLinkageRoute(`/roomLinkagePage/${id}/edit`, { type: "edit", id }),
    };
  },
});
</script>
