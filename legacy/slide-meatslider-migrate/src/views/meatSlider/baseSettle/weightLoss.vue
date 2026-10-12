<template lang="pug">
g-table(
  title="重量损耗"
  editMode="page"
  :api="api"
  :columns="columns"
  :scrollX="850"
  tableCode="WEIGHT_LOSS"
  :slots="slots"
  @slot="changeStatus"
  ref="tableRef"
)
</template>
<script lang="jsx">
import { flattenTree } from "@/utils/common.js";
import {
  defineComponent,
  reactive,
  toRefs,
  getCurrentInstance,
  ref,
  onMounted,
} from "vue";
import { useRouter } from "vue-router";
import _ from "lodash";
export default defineComponent({
  setup() {
    const { proxy } = getCurrentInstance();
    const tableRef = ref();
    // 数据
    const state = reactive({
      columnList: [
        "startTime",
        "endTime",
        "loss",
        "enabled",
        "remark",
        "action",
      ],
      columns: [
        {
          dataIndex: "startTime",
          mark: "startTime",
          key: "startTime",
          title: "起点时间（h）",
          slots: {
            customRender: "startTime",
          },
        }, {
          dataIndex: "endTime",
          mark: "endTime",
          key: "endTime",
          title: "终点时间（h）",
          slots: {
            customRender: "endTime",
          },
        }, {
          dataIndex: "loss",
          mark: "loss",
          key: "loss",
          title: "损耗重量(kg)",
          slots: {
            customRender: "loss",
          },
        }, {
          mark: "enabled",
          dataIndex: "enabled",
          key: "enabled",
          title: "启用状态",
          slots: {
            customRender: "enabled",
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
        list: "getWeightloss",
        deleteSingle: "weightlossId",
        path: "/weightOperate",
      },
      btns: ["add", "edit", "deleteSingle"],
      slots: [{ slot: "enabled", component: "a-switch" }],
    });

    onMounted(() => {
    });
    const changeStatus = async (slot, record) => {
      await proxy.$api.getWeightloss(record, "put");
      proxy.$message.success("操作成功");
      tableRef.value.getData();
    };

    return {
      ...toRefs(state),
      tableRef,
      changeStatus,
    };
  },
});
</script>
<style scoped lang="less">
// @import url("@/styles/theme/color.less");;

:deep(.ant-layout-content) {
  max-height: 100%;
}
</style>
