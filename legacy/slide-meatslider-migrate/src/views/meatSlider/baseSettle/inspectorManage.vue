<template lang="pug">
g-table(
  title="抽检员"
  editMode="page"
  :api="api"
  :search="search"
  :btns="['add','detail','edit','deleteSingle']"
  :columns="columns"
  tableCode="INSPECTOR_MANAGE"
  :slots="slots"
  :scrollX="850"
  @slot="onToggle"
  ref="tableRef"
)

</template>
<script lang="jsx">
import { timeFormat,flattenTree } from "@/utils/common";
import {
  defineComponent,
  reactive,
  toRefs,
  getCurrentInstance,
  createVNode,
  ref,
  onMounted,
} from "vue";

import _ from "lodash";
export default defineComponent({
  setup() {
    // 数据
    const { proxy } = getCurrentInstance();
    const tableRef = ref();
    const state = reactive({
      columnList: ["name", "enabled", "addTime", "remark", "action"],
      columns: [
        {
          mark: "name",
          dataIndex: "name",
          key: "name",
          title: "抽检员",
          slots: {
            customRender: "name",
          },
          customRender: ({ text }) => {
            return (
              <PopOver position="topLeft" content={text}>
                {text ? text : "--"}
              </PopOver>
            );
          },
          // width: 80,
          ellipsis: true,
        }, {
          mark: "enabled",
          dataIndex: "enabled",
          key: "enabled",
          title: "启用状态",
          slots: {
            customRender: "enabled",
          },
        }, {
          mark: "addTime",
          dataIndex: "addTime",
          key: "addTime",
          title: "添加时间",
          slots: {
            customRender: "addTime",
          },
          // width: 180,
          customRender: ({ text }) => {
            return (
              <PopOver position="topLeft" content={text ? timeFormat(text) : "--"}>
                {text ? timeFormat(text) : "--"}
              </PopOver>
            );
          },
        }, {
          mark: "remark",
          dataIndex: "remark",
          key: "remark",
          title: "备注",
          slots: {
            customRender: "remark",
          },
          ellipsis: true,
          customRender: ({ text }) => {
            return (
              <PopOver position="topLeft" content={text}>
                {text ? text : "--"}
              </PopOver>
            );
          },
        }, {
          title: "操作",
          mark: "action",
          dataIndex: "action",
          key: "action",
          slots: {
            customRender: "action",
          },
          fixed: "right",
        }
      ],
      api: {
        list: "getInspector",
        deleteSingle: "inspectorId",
        path: "/inspectorOperate",
      },
      search: [{ label: "", value: "keyword", placeholder: "抽检员名称" }],
      slots: [
        {
          slot: "enabled",
          component: "a-switch",
        },
      ],
    });

    onMounted(() => {
    });
    const onToggle = async (slot, record) => {
      await proxy.$api.getInspector(record, "put");
      proxy.$message.success("操作成功");
      tableRef.value.getData();
    };
    return {
      // 数据
      tableRef,
      ...toRefs(state),
      onToggle,
    };
  },
});
</script>
<style scoped lang="less">
// @import url("@/styles/theme/color.less");;
</style>
