<template>
  <g-table
    ref="tableRef"
    :title="pageTitle"
    :api="api"
    :btns="btns"
    tableCode="MAINTENANCE_PLAN_LIST"
    :search="search"
    :editMode="'page'"
    :rowKey="'id'"
    :columns="columns"
    :beforeGet="beforeGet"
    :rowSelection="false"
    :scrollX="900"
    searchCache="true"
  >
    <template v-slot:btn="{ record }">
      <a-popconfirm
        title="是否停用当前计划？"
        v-if="record.status === 'ENABLED'"
        @confirm.stop="subProb(record)"
      >
        <a-button type="link"> 停用 </a-button>
      </a-popconfirm>
      <a-popconfirm
        title="是否启用当前计划？"
        v-else-if="record.status === 'DEACTIVATED'"
        @confirm.stop="subProb(record)"
      >
        <a-button type="link"> 启用 </a-button>
      </a-popconfirm>

      <a-button v-else disabled type="link">停用</a-button>
      <a-button type="link" @click="copyItem(record)">复制 </a-button>
    </template>
  </g-table>
</template>
<script lang="jsx">
import {
  defineComponent,
  getCurrentInstance,
  onMounted,
  reactive,
  toRefs,
  ref,
} from "vue";
import { timeFormat, millennial } from "@ghcloud-legacy/bimops-fe-web-migrate-lib/lib/utils/common";
import { useRouter, useRoute } from "vue-router";
import { usePageName } from '@ghcloud/cube-utils'

export default defineComponent({
  setup() {
    const { pageTitle } = usePageName()
    const router = useRouter();
    const { proxy } = getCurrentInstance();
    const tableRef = ref();
    const state = reactive({
      api: {
        list: "maintenancePlan",
        deleteSingle: "maintenancePlanDel",
        path: "/maintenancePlanOperate",
      },
      btns: ["add", "detail", "deleteSingle"],
      search: [
        {
          label: "计划状态",
          value: "status",
          component: "g-select",
          options: [
            { label: "全部", value: "" },
            { label: "已启用", value: "ENABLED" },
            { label: "已过期", value: "EXPIRED" },
            { label: "已停用", value: "DEACTIVATED" },
          ],
          placeholder: "请选择计划状态",
        },
        { label: "", value: "keyword", placeholder: "名称" },
      ],
      columns: [
        {
          dataIndex: "maintenancePlanName",
          title: "维保计划名称",
          slots: {
            customRender: "maintenancePlanName",
          },
          ellipsis: true,
          customRender: ({ text }) => {
            return (
              <PopOver position="topLeft" content={text ? text : ""}>
                {text ? text : "--"}
              </PopOver>
            );
          },
        },
        {
          dataIndex: "responsibilityPersonName",
          title: "责任人",
          slots: {
            customRender: "responsibilityPersonName",
          },
          ellipsis: true,
          customRender: ({ text }) => {
            return (
              <PopOver position="topLeft" content={text ? text : ""}>
                {text ? text : "--"}
              </PopOver>
            );
          },
        },
        {
          dataIndex: "maintenanceCycle",
          title: "维保周期",
          slots: {
            customRender: "maintenanceCycle",
          },
          ellipsis: true,
          customRender: ({ text, record }) => {
            let unit;
            switch (record.timeUnit) {
              case "p-day":
                unit = "天";
                break;
              case "p-week":
                unit = "周";
                break;
              case "p-month":
                unit = "月";
                break;
            }
            return (
              <PopOver
                position="topLeft"
                content={
                  text || text === 0 ? millennial(text, false) + unit : ""
                }
              >
                {text || text === 0 ? millennial(text, false) + unit : "--"}
              </PopOver>
            );
          },
        },
        {
          dataIndex: "planStartTime",
          title: "计划生效时间",
          slots: {
            customRender: "planStartTime",
          },
          ellipsis: true,
          customRender: ({ text }) => {
            return (
              <PopOver
                position="topLeft"
                content={text ? timeFormat(text, false) : ""}
              >
                {text ? timeFormat(text, false) : "--"}
              </PopOver>
            );
          },
        },
        {
          dataIndex: "planEndTime",
          title: "计划失效时间",
          slots: {
            customRender: "planEndTime",
          },
          ellipsis: true,
          customRender: ({ text }) => {
            return (
              <PopOver
                position="topLeft"
                content={text ? timeFormat(text, false) : ""}
              >
                {text ? timeFormat(text, false) : "--"}
              </PopOver>
            );
          },
        },
        {
          dataIndex: "taskNum",
          title: "生成任务数",
          slots: {
            customRender: "taskNum",
          },
          ellipsis: true,
          customRender: ({ text }) => {
            return (
              <PopOver
                position="topLeft"
                content={text || text === 0 ? millennial(text, false) : ""}
              >
                {text || text === 0 ? millennial(text, false) : "--"}
              </PopOver>
            );
          },
        },
        {
          dataIndex: "status",
          title: "计划状态",
          slots: {
            customRender: "status",
          },
          ellipsis: true,
          customRender: ({ text }) => {
            let res;
            switch (text) {
              case "DEACTIVATED":
                res = "已停用";
                break;
              case "ENABLED":
                res = "已启用";
                break;
              case "EXPIRED":
                res = "已过期";
                break;
            }
            return (
              <PopOver position="topLeft" content={text ? res : ""}>
                <span class={text === "ENABLED" ? "normal" : "abnormal"}>
                  {text ? res : "--"}
                </span>
              </PopOver>
            );
          },
        },
        {
          dataIndex: "action",
          title: "操作",
          slots: {
            customRender: "action",
          },
          fixed: "right",
          width: 200,
        },
      ],
      btnStatus: "all",
    });

    const beforeGet = (params) => {
      return params;
    };

    const changeBtnStatus = (type) => {
      state.btnStatus = type;
    };

    const subProb = (item) => {
      const { id, status } = item;
      proxy.$api
        .maintenancePlanStatus(
          {
            id: id,
            status: status === "ENABLED" ? "DEACTIVATED" : "ENABLED",
          },
          "put"
        )
        .then(() => {
          proxy.$message.success("操作成功");
          tableRef.value.getData();
        });
    };

    const copyItem = (record) => {
      router.push({
        path: "/maintenancePlanOperate",
        query: {
          id: record.id,
          type: "copy",
        },
      });
    };

    return {
      tableRef,
      ...toRefs(state),
      changeBtnStatus,
      beforeGet,
      copyItem,
      subProb,
      pageTitle
    };
  },
});
</script>
