<template>
  <g-table
    tableCode="INSPECTION_TYPE"
		:title="pageTitle"
		:columns="columns"
		:btns="btns"
		:search="search"
		:api="api"
		:modal="modal"
		:rules="rules"
		:modalTitle="modalTitle"
		:scrollX="400"
	>
	</g-table>
  <!-- <sTable
    ref="tableRef"
    title="巡检类型"
    :columns="columns"
    :btns="['add', 'edit', 'deleteSingle', 'delete']"
    :search="search"
    :api="api"
    :modal="modal"
    :rules="rules"
    :tableTitle="modalTitle"
    :tableType="'normal'"
    :allowSelect="true"
    :scrollX="400"
  >
  </sTable> -->
</template>

<script>
import { defineComponent, onMounted, reactive, toRefs } from "vue";
import { usePageName } from '@ghcloud/cube-utils'
export default defineComponent({
  components: {
  },
  setup() {
    const { pageTitle } = usePageName()
    const state = reactive({
      modalTitle: "巡检类型",
      // 表头
      columns: [
        {
          title: "巡检类型",
          dataIndex: "name",
          key: "name",
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
      // 接口
      api: {
        list: "inspectType",
        add: "inspectTypeAdd",
        edit: "inspectTypeId",
        detail: "record",
        delete: "q",
        deleteSingle: "inspectTypeId",
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
          label: "类型名称",
          value: "name",
          placeholder: "请输入类型名称",
          maxlength: 20,
        },
      ],
      rules: {
        name: [{ required: true, message: "请输入类型" }],
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
