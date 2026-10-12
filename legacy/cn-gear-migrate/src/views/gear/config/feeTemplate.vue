<template lang="pug">
div
    g-table(
        :title="pageTitle"
        :columns="columns" 
        :search="search" 
        :btns="btns"
        :api="api"
        :slots="slots"
        editMode="page"
        @slot="slotRecord"
        ref="tableRef")
        div 这是嵌套的内容
</template>

<script lang='jsx'>
import {
  defineComponent,
  reactive,
  toRefs,
  getCurrentInstance,
  ref,
} from "vue";
import { useRouter } from "vue-router";
import { usePageName } from '@ghcloud/cube-utils'

export default defineComponent({
  setup() {
    const { pageTitle } = usePageName()
    const tableRef = ref();
    const { proxy } = getCurrentInstance();
    const state = reactive({
      feeTemplateVisible: false,
      api: {
        delete: null,
        list: "getCostTmps",
        path: "/gearFeeTemplateEdit",
      },
      columns: [
        {
          dataIndex: "name",
          key: "name",
          title: "模板名称",
          slots: {
            customRender: "name",
          },
          customRender: ({ text }) => {
            return (
              <PopOver position="topLeft" content={text ? text : ""}>
                {text ? text : "--"}
              </PopOver>
            );
          },
        },

        {
          dataIndex: "costRuleCount",
          key: "costRuleCount",
          title: "收费项目数",
          slots: {
            customRender: "costRuleCount",
          },
          customRender: ({ text }) => {
            return (
              <PopOver position="topLeft" content={text ? text : ""}>
                {text ? text : "--"}
              </PopOver>
            );
          },
        },
        {
          dataIndex: "enabled",
          key: "enabled",
          title: "启用状态",
          slots: {
            customRender: "enabled",
          },
        },
        {
          title: "操作",
          dataIndex: "action",
          key: "action",
          slots: {
            customRender: "action",
          },
          width: 100,
          fixed: "right",
        },
      ],
      btns: ["edit", "add"],
      search: [
        {
          label: "",
          value: "keyword",
          placeholder: "模板名称",
        },
      ],
      slots: [
        {
          slot: "enabled",
          component: "a-switch",
        },
      ],
    });

    const slotRecord = (slot, record) => {
      if (slot === "enabled") {
        proxy.$api.putCostTmpStatus(record,"put" ).then(() => {
          proxy.$message.success("操作成功");
          tableRef.value.getData();
        });
      }
    };

    return {
      tableRef,
      ...toRefs(state),
      slotRecord,
      pageTitle
    };
  },
});
</script>

<style lang="less" scoped>

</style>
