<template lang="pug">
g-table(
  :title="pageTitle"
  :columns="columns"
  :api="api"
  :btns="btns"
  :modal="modal"
  :rules="rules"
  :scrollX="450"
  :search="search")
</template>
<script lang="jsx">
import gTable from "@ghcloud-legacy/bimops-fe-web-migrate-lib/src/components/global/Common/gTable.vue";
// import gTable from "../../../../bimops-fe-web-migrate-lib/lib/components/global/Common/gTable";
import { defineComponent, getCurrentInstance, onMounted, reactive, toRefs } from "vue";
import { useRoute, useRouter } from "vue-router";

import { usePageName } from "@ghcloud/cube-utils";

export default defineComponent({
  components: { gTable },
  setup() {
    const { proxy } = getCurrentInstance();
    const route = useRoute();
    const router = useRouter();
    const { pageTitle } = usePageName();
    // 数据
    const formState = reactive({});
    const state = reactive({
      okButtonProps: {
        style: "display: none",
      },
      spinning: false,
      columns: [
        {
          dataIndex: "name",
          title: "流媒体名称",
          customRender: ({ text }) => {
            return (
              <PopOver position="topLeft" content={text ? text : ""}>
                {text ? text : "--"}
              </PopOver>
            );
          },
        },
        {
          dataIndex: "ipAddress",
          title: "ip地址",
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
          fixed: "right",
          slots: {
            customRender: "action",
          },
        },
      ],
      search: [{ label: "", value: "keyword", placeholder: "请输入流媒体名称" }],
      api: {
        list: "sMedia",
        add: "sMediaAdd",
        edit: "sMediaEdit",
        deleteSingle: "sMediaEdit",
        detail: "record",
      },
      btns: ["detail", "add", "edit", "deleteSingle"],
      modal: [
        { label: "id", value: "id", showCondition: () => false },
        { label: "名称", value: "name" },
        { label: "账户", value: "username" },
        {
          label: "密码",
          value: "password",
          component: "a-input-password",
          showCondition: (form) => {
            return form.id ? false : true;
          },
        },
        { label: "内网ip地址", value: "intranetAddress" },
        { label: "外网ip地址", value: "ipAddress" },
      ],
      rules: {
        name: [{ required: true, message: "请输入名称" }],
        username: [{ required: true, message: "请输入账户" }],
        password: [{ required: true, message: "请输入密码" }],
        intranetAddress: [{ required: true, message: "请输入内网ip地址" }],
      },
    });

    onMounted(() => {});

    return {
      ...toRefs(state),
      ...toRefs(formState),
      pageTitle,
    };
  },
});
</script>
<style lang="less" scoped>
.a {
  display: none;
}
</style>
