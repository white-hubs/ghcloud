<template lang="pug">
div 
  g-table(
    title="规则分组"
    :btns="btns" 
    :search="search" 
    :columns="columns" 
    :editMode="editMode" 
    :api="api" 
    :modal="modal" 
    :rules="rules" 
    :slots="slots"
    :scrollX="750"
    @slot="changeStatus"
    ref="tableRef")
</template>
<script lang='jsx'>
import {
  defineComponent,
  toRefs,
  reactive,
  ref,
  getCurrentInstance,
} from "vue";
export default defineComponent({
  setup() {
    const tableRef = ref();
    const { proxy } = getCurrentInstance();
    const state = reactive({
      btns: ["edit"],
      rowSelection: true,
      api: {
        list: "ruleCategory",
        edit: "ruleCategoryEdit",
        path: "",
        detail: "record",
      },
      columns: [
        {
          dataIndex: "categoryName",
          title: "分组名称",
          slots: {
            customRender: "categoryName",
          },
          ellipsis: true,
          customRender: ({ text }) => {
            return (
              <PopOver content={text ? text : ""}>{text ? text : "--"}</PopOver>
            );
          },
        },
        {
          dataIndex: "priority",
          title: "优先级",
        },
        {
          dataIndex: "status",
          title: "分组状态",
          slots: {
            customRender: "status",
          },
        },
        {
          dataIndex: "remark",
          title: "备注信息",
          slots: {
            customRender: "remark",
          },
          ellipsis: true,
          customRender: ({ text }) => {
            return (
              <PopOver content={text ? text : ""}>{text ? text : "--"}</PopOver>
            );
          },
        },
        {
          title: "操作",
          slots: {
            customRender: "action",
          },
          fixed: "right",
        },
      ],
      search: [],
      modal: [
        {
          label: "分组名称",
          value: "categoryName",
          placeholder: "请选择分组名称",
          disabled: true,
          maxlength: 200,
        },
        {
          label: "优先级",
          value: "priority",
          // placeholder: "请选择优先级",
          placeholder: "请输入优先级",
          // component: "a-select",
          // component: "a-select",
          maxlength: 200,
        },
        {
          label: "分组状态",
          value: "status",
          placeholder: "请选择分组状态",
          component: "a-switch",
          defaultValue: true,
          checkedValue: "启用",
          unCheckedValue: "禁用",
        },
        {
          label: "备注信息",
          value: "remark",
          placeholder: "请注入备注状态",
          component: "a-textarea",
          maxlength: 200,
        },
      ],
      rules: {
        priority: [{ required: true, message: "请选择优先级" }],
        status: [{ required: true, message: "请选择分组状态" }],
      },
      slots: [
        {
          component: "a-switch",
          slot: "status",
        },
      ],
      editMode: "modal",
    });

    const changeStatus = async (slot, record) => {
      await proxy.$api.ruleCategoryStatus(record, "put");
      proxy.$message.success("操作成功");
      tableRef.value.getData();
    };
    /*审核*/
    const auditNow = (record) => {};
    return {
      tableRef,
      ...toRefs(state),
      auditNow,
      changeStatus,
    };
  },
});
</script>
<style lang="less" scoped></style>
