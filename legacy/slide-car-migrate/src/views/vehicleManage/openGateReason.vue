<template lang="pug">
g-table(
  title="开闸原因"
  :columns="columns"
  :btns="btns"
  :api="api"
  :scrollX="600"
  :search="search"
  :modal="modal"
  :rules="rules"
)
</template>

<script lang="jsx">
import { defineComponent, reactive, toRefs } from "vue";
import { millennial, timeFormat } from "@/utils/common";
export default defineComponent({
  setup() {
    const state = reactive({
      columns: [
        {
          dataIndex: "reason",
          title: "开闸原因",
          slots: {
            customRender: "reason",
          },
          ellipsis: true,
          customRender: ({ text }) => {
            return (
              <PopOver position="topLeft" content={text}>
                {text ? text : "--"}
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
        },
      ],
      api: {
        list: "openGateRea",
        add: "openGateReaAdd",
        edit: "openGateReaId",
        deleteSingle: "openGateReaId",
        detail: "record",
      },
      btns: ["add", "edit", "deleteSingle"],
      search: [{ label: "", value: "keyword", placeholder: "原因" }],
      modal: [
        {
          label: "开闸原因",
          value: "reason",
          placeholder: "请输入开闸原因",
          maxlength: "200",
          component: "a-textarea",
        },
      ],
      rules: {
        reason: [{ required: true, message: "请输入开闸原因" }],
      },
    });

    return {
      ...toRefs(state),
    };
  },
});
</script>

<style lang="less" scoped></style>
