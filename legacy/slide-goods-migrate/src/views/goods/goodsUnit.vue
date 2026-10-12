<template lang="pug">
g-table(
  title="商品单位"
  :columns="columns"
  :api="api"
  :btns="btns"
  :modal="modal"
  :rules="rules"
  :scrollX="700"
  )
</template>
<script lang="jsx">
import {
  defineComponent,
  reactive,
  toRefs,
  getCurrentInstance,
  createVNode,
  ref,
  onMounted,
} from "vue";
export default defineComponent({
  setup() {
    const { proxy } = getCurrentInstance();
    const state = reactive({
      api: {
        list: "unit",
        add: "goodsUnit",
        edit: "unitId",
        deleteSingle: "unitId",
        detail: "record",
      },
      columns: [
        {
          dataIndex: "name",
          title: "单位名称",
          slots: {
            customRender: "name",
          },
          customRender: ({ text }) => {
            return <PopOver content={text}>{text ? text : "--"}</PopOver>;
          },
        },
        {
          dataIndex: "remark",
          title: "备注",
          slots: {
            customRender: "remark",
          },
          customRender: ({ text }) => {
            return <PopOver content={text}>{text ? text : "--"}</PopOver>;
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
      search: [],
      btns: ["add", "edit", "deleteSingle"],
      modal: [
        { label: "单位名称", value: "name" },
        {
          label: "备注",
          value: "remark",
          component: "a-textarea",
          maxlength: 200,
        },
      ],
      rules: {
        name: [{ required: true, message: "请输入单位名称" }],
      },
    });

    onMounted(function(){});

    return {
      labelCol: {
        span: 8,
      },
      wrapperCol: {
        span: 20,
      },
      ...toRefs(state),
    };
  },
});
</script>
<style scoped lang="less"></style>
