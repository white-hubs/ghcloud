<template>
  <g-table
    :title="pageTitle"
    :columns="columns"
    :btns="btns"
    tableCode="REPAIR_MODE"
    :search="search"
    :api="api"
    :modal="modal"
    :rules="rules"
    :modalTitle="modalTitle"
    :scrollX="400"
  >
  </g-table>
</template>

<script lang="jsx">
import { defineComponent, onMounted, reactive, toRefs } from "vue";
import { usePageName } from '@ghcloud/cube-utils'

export default defineComponent({
  setup() {
    const { pageTitle } = usePageName()
    const state = reactive({
      modalTitle: "委外模式",
      // 表头
      columns: [
        {
          title: "委外模式",
          dataIndex: "name",
          key: "name",
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
          dataIndex: "action",
          title: "操作",
          slots: {
            customRender: "action",
          },
        },
      ],
      // 接口
      api: {
        list: "repairMode",
        add: "repairModeAdd",
        edit: "repairModeAdd",
        detail: "record",
        deleteSingle: "inspectCycleId",
      },
      // 操作按钮
      btns: ["add", "edit", "deleteSingle"],
      search: [
        // {
        //   label: "",
        //   value: "keyword",
        //   placeholder: "名称",
        // },
      ],
      // 对话框弹窗
      modal: [
        {
          label: "委外模式",
          value: "name",
          placeholder: "请输入委外模式",
          maxlength: 20,
        },
      ],
      rules: {
        name: [{ required: true, message: "请输入委外模式" }],
      },
    });

    return {
      ...toRefs(state),
      pageTitle
    };
  },
});
</script>

<style></style>
