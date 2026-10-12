<template>
  <g-table tableCode="INSPECTION_CYCLE" ref="tableRef" :title="pageTitle" :columns="columns" :btns="btns" :search="search" :api="api" :modal="modal"
    :rules="rules" :modalTitle="modalTitle" :scrollX="600" :rowSelection="true">
    <template v-slot:batch="{ record }">
      <a-popconfirm title="删除选中周期？" @confirm="delateBatch(record)" v-if="record.length">
        <a-button type="primary" danger>批量删除</a-button>
      </a-popconfirm>
      <a-button v-else type="primary" danger disabled>批量删除</a-button>
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

import { usePageName } from '@ghcloud/cube-utils'
export default defineComponent({
  components: {
  },
  setup() {
    const { pageTitle } = usePageName()
    const { proxy } = getCurrentInstance();
    const tableRef = ref();
    const state = reactive({
      modalTitle: "巡检周期",
      // 表头
      columns: [
        {
          title: "名称",
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
          title: "表达式",
          dataIndex: "cron",
          key: "cron",
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
          title: "描述",
          dataIndex: "description",
          key: "description",
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
        list: "inspectCycle",
        add: "inspectCycleAdd",
        edit: "inspectCycleId",
        detail: "record",
        deleteSingle: "inspectCycleId",
      },
      // 操作按钮
      btns: ["add", "edit", "deleteSingle"],
      search: [
        {
          label: "",
          value: "keyword",
          placeholder: "名称",
        },
      ],
      // 对话框弹窗
      modal: [
        {
          label: "周期名称",
          value: "name",
          placeholder: "请输入周期名称",
          maxlength: 20,
        },
        {
          label: "时间周期",
          value: "cron",
          placeholder: "请输入时间周期",
        },
        {
          label: "周期描述",
          value: "description",
          placeholder: "请输入周期描述",
          component: "a-textarea",
          maxlength: 200,
        },
      ],
      rules: {
        name: [{ required: true, message: "请输入周期名称" }],
        cron: [{ required: true, message: "请输入时间周期" }],
      },
    });

    const delateBatch = (value) => {
      proxy.$api
        .inspectCycleBatch(
          { ids: value.length ? value.join(",") : "" },
          "delete"
        )
        .then(() => {
          proxy.$message.success("操作成功");
          tableRef.value.getData();
        });
    };

    return {
      tableRef,
      ...toRefs(state),
      delateBatch,
      pageTitle
    };
  },
});
</script>

<style></style>
