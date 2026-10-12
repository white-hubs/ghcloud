<template>
  <g-table :title="pageTitle" :api="api" :columns="columns" :search="search" editMode="modal" :modal="modalcearch"
    :scrollX="0" tableCode="EMERGENCY_CENTER_EVENT_TYPE" :rules="rules" :btns="btns"></g-table>
</template>

<script lang="jsx">
import { usePageName } from "@ghcloud/cube-utils"
import { defineComponent, reactive, toRefs } from "vue";
export default defineComponent({
  setup() {
    const { pageTitle } = usePageName();
    const state = reactive({
      pageTitle: pageTitle,
      api: {
        list: "eventtypepage",
        edit: "editeventtype",
        add: "addeventtype",
        deleteSingle: "deletetype",
        detail: 'record'
      },
      columns: [
        {
          title: "序号",
          dataIndex: 'tableIndex',
          customRender: ({ index }) => {
            return index + 1
          },
        },
        {
          dataIndex: "name",
          title: "分类名称",
          slots: {
            customrender: "name",
          },
          customRender: ({ text }) => {
            return (
              <a-popover content={text ? text : "--"}>{text ? text : "--"}</a-popover>
            );
          },
        },

        {
          dataIndex: "remark",
          title: "备注说明",
          slots: {
            customrender: "remark",
          },
          customRender: ({ text }) => {
            return (
              <a-popover content={text ? text : "--"}>{text ? text : "--"}</a-popover>
            );
          },
        },
        {
          dataIndex: "actiona",
          title: "操作",
          slots: {
            customRender: "action",
          },
        },
      ],
      search: [
        {
          label: "",
          value: "keyword",
          placeholder: "请输入分类名称",
        },
      ],
      modalcearch: [
        {
          label: "分类名称",
          value: "name",
          placeholder: "请输入分类名称",
        },
        {
          label: "说明",
          value: "remark",
          component: "a-textarea",
          placeholder: "请输入备注信息,最多200字",
          maxlength: 200,
        },
      ],
      rules: {
        name: [
          {
            required: true,
            validator: (_rule, value) => {
              if (value === '' || value.replace(/\s+/g, '') === '') {
                return Promise.reject('请输入分类名称');
              } else {
                return Promise.resolve();
              }
            }, trigger: 'change'
          }
        ],

      },
      btns: ["add", "edit", "deleteSingle"],
    });
    return {
      ...toRefs(state),
    };
  },
});
</script>

<style></style>
