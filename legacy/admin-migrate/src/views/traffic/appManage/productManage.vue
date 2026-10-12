<template lang="pug">
g-table(
  title="产品列表"
  :columns="columns"
  :api="api"
  :slots="slots"
  :btns="btns"
  :modal="modal"
  :rules="rules"
  :search="search"
  editMode="page"
  :permission="permission"
  @slot="editRecord")
  template(v-slot:btn="{record}")
    //- a-button(type="link" @click="setApp(record)" :disabled="!record.enabled") 配置应用
    a-button(type="link" @click="setTerminal(record)" :disabled="!record.enabled") 配置访问端
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
import { tableColumns } from "@/utils/common";

export default defineComponent({
  setup() {
    const router = useRouter();
    const route = useRoute();
    const { proxy } = getCurrentInstance();
    const permission = {
      add:window.config.useAdmin,
      edit:window.config.useAdmin,
      delete:window.config.useAdmin,
      detail:true,
      deleteSingle:window.config.useAdmin,
      tableEdit:window.config.useAdmin
    }
    const state = reactive({
      productLineList: null,
      columnList: [
        "name",
        "code",
        "productLineName",
        "enabled",
        "remark",
        "action",
      ],
      columns: null,
      api: {
        list: "productList",
        // add: "addProduct",
        // edit: "productId",
        deleteSingle: "productId",
        // detail: "record",
        path: "/productInfoOperate",
      },
      search: [{ label: "", value: "keyword", placeholder: "产品名称" }],
      btns: ["detail", "edit", "add", "deleteSingle"],
      slots: [{ slot: "enabled", component: "a-switch" }],
      modal: [
        { label: "产品名称", value: "name" },
        { label: "产品编号", value: "code" },
        {
          label: "所属产品线",
          value: "productLineId",
          component: "a-select",
          placeholder: "请选择产品线",
          options: null,
        },
        {
          label: "状态",
          value: "enabled",
          component: "a-switch",
          defaultValue: true,
        },
        {
          label: "备注信息",
          value: "remark",
          component: "a-textarea",
          maxlength: 200,
          placeholder: "请输入备注信息",
        },
      ],
      rules: {
        name: [{ required: true, message: "请输入产品名称" }],
        code: [{ required: true, message: "请输入产品编号" }],
        enabled: [{ required: true, message: "请选择产品状态" }],
        productLineId: [{ required: true, message: "请选择产品线" }],
      },
    });

    const edit = (record) => {
      router.push({
        path: "/enterpriseLease",
        query: {
          tenantId: record.id ? record.id : "",
        },
      });
    };

    const editRecord = async (slots, record) => {
      await proxy.$api.productId("put", record);
      proxy.$message.success("操作成功");
    };

    const setApp = (record) => {
      router.push({
        path: "/productSetApp",
        query: {
          id: record.id ? record.id : "",
          product: JSON.stringify(record),
        },
      });
    };

    const setTerminal = (record) => {
      router.push({
        path: "/productSetTerminals",
        query: {
          id: record.id ? record.id : "",
        },
      });
    };

    onMounted(() => {
      state.columns = tableColumns("productList", state.columnList);
    });

    return {
      ...toRefs(state),
      edit,
      setApp,
      editRecord,
      setTerminal,
      permission
    };
  },
});
</script>
