<template lang="pug">
div 
  //- :rowSelection="rowSelection" 可选表格
  g-table(
    title="车辆类型"
    :columns="columns" 
    :search="search" 
    :editMode="editMode" 
    :api="api" 
    :modal="modal" 
    :rules="rules" 
    :btns="btns" 
    :scrollX="600"
    ref="tableRef")
    template(v-slot:btn="item")
      a-popconfirm(
        title="确认删除当前选中?"
        cancelText="取消"
        okText="确定"
        @confirm.stop="deleteRecord(item.record)")
        a-button.deleteRow(type="link" @click.stop="") 删除
</template>
<script lang="jsx">
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
      editMode: "modal",
      btns: ["edit", "add"],
      rowSelection: true,
      api: {
        list: "carTypeConfig",
        add: "carTypeAdd",
        delete: "carTypeDelete",
        edit: "carTypeEdit",
        detail: "record",
        path: "",
      },
      columns: [
        {
          dataIndex: "carTypeName",
          title: "车型名称",
          slots: {
            customRender: "carTypeName",
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
          dataIndex: "remark",
          title: "备注信息",
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
        },
        {
          title: "操作",
          slots: {
            customRender: "action",
          },
          fixed: "right",
        },
      ],
      search: [{ label: "", value: "carTypeName", placeholder: "车型名称" }],
      modal: [
        {
          label: "车型名称",
          value: "carTypeName",
          placeholder: "请输入车型名称",
          maxlength: 20,
        },
        {
          label: "备注信息",
          value: "remark",
          placeholder: "请输入备注信息",
          component: "a-textarea",
          maxlength: 200,
        },
      ],
      rules: {
        carTypeName: [{ required: true, message: "请输入车型名称" }],
      },
    });
    const deleteRecord = async (item) => {
      await proxy.$api.carTypeDelete(item.id, "delete");
      proxy.$message.success("操作成功");
      tableRef.value.getData();
    };
    return {
      tableRef,
      ...toRefs(state),
      deleteRecord,
    };
  },
});
</script>
<style lang="less" scoped></style>
