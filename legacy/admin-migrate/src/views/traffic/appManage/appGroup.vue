<template lang="pug">
g-table(
  title="应用分组"
  :api="api"
  :btns="btns"
  :modal="modal"
  :rules="rules"
  :scrollX="600"
  :columns="columns"
  :modalTitle="modalTitle"
  :permission="permission"
)
</template>
<script lang='jsx'>
import {
  defineComponent,
  reactive,
  toRefs,
  getCurrentInstance,
  onMounted,
} from "vue";
import { useRouter, useRoute } from "vue-router";

export default defineComponent({
  setup() {
    const router = useRouter();
    const route = useRoute();
    const { proxy } = getCurrentInstance();
    const permission = {
      add:window.config.useAdmin,
      edit:true,
      delete:window.config.useAdmin,
      detail:window.config.useAdmin,
      deleteSingle:window.config.useAdmin,
      tableEdit:window.config.useAdmin
    }
    const state = reactive({
      modalTitle: "应用分组",
      columns: [
        {
          dataIndex: "name",
          title: "分组名称",
          ellipsis: true,
          customRender: ({ text }) => {
            return (
              <PopOver  content={text ? text : ""}>
                {text ? text : "--"}
              </PopOver>
            );
          },
        },
        {
          dataIndex: "remark",
          title: "备注",
          ellipsis: true,
          customRender: ({ text }) => {
            return (
              <PopOver  content={text ? text : ""}>
                {text ? text : "--"}
              </PopOver>
            );
          },
        },
        {
          dataIndex: "action",
          title: "操作",
          fixed: "right",
          slots: {
            customRender: "action",
          },
        },
      ],
      api: {
        list: "appGroup",
        path: "/addApp",
        edit: "appGroupId",
        add: "appGroupAdd",
        deleteSingle: "appGroupId",
        detail: "record",
      },
      btns: ["add", "edit", "deleteSingle"],
      search: [
        { label: "", value: "keyword", placeholder: `应用名称/企业租户` },
      ],
      modal: [
        { label: "分组名称", value: "name" },
        {
          label: "备注",
          value: "remark",
          component: "a-textarea",
          maxLength: 200,
          placeholder: "备注",
        },
      ],
      rules: { name: [{ required: true, message: "请输入分组名称" }] },
    });

    const edit = (record) => {
      router.push({
        path: "/enterpriseLease",
        query: {
          tenantId: record.id ? record.id : "",
        },
      });
    };

    const addMenu = (record) => {
      router.push({
        path: "/addAppMenu",
        query: {
          id: record.id ? record.id : "",
        },
      });
    };

    onMounted(function(){});

    return {
      ...toRefs(state),
      edit,
      addMenu,
      permission,
    };
  },
});
</script>
