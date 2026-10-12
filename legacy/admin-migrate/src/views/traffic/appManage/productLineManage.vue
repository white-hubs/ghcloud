<template lang="pug">
//- div hahah
g-table(
  title="产品线列表"
  :columns="columns"
  :api="api"
  :slots="slots"
  :btns="btns"
  :modal="modal"
  :rules="rules"
  :scrollX="null"
  editMode="modal"
  @slot="editRecord"
)
</template>
<script lang='jsx'>
import {
  defineComponent,
  ref,
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

    const state = reactive({
      columnList: ["name", "enabled", "remark", "action"],
      columns: null,
      api: {
        list: "productLine",
        add: "addProductLine",
        edit: "productLineId",
        path: "/addApp",
        deleteSingle: "productLineId",
        detail: "record",
      },
      search: [
        { label: "", value: "keyword", placeholder: `应用名称/企业租户` },
      ],
      btns: ["edit", "add", "deleteSingle"],
      slots: [{ slot: "enabled", component: "a-switch" }],
      modal: [
        { label: "产品线名称", value: "name" },
        {
          label: "状态",
          value: "enabled",
          component: "a-switch",
          disabled:true,
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
        name: [{ required: true, message: "请输入产品线名称" }],
        enabled: [{ required: true, message: "请选择产品线状态" }],
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

    const addMenu = (record) => {
      router.push({
        path: "/addAppMenu",
        query: {
          id: record.id ? record.id : "",
        },
      });
    };

    const editRecord = async (slots, record) => {
      await proxy.$api.productLineId("put", record);
      proxy.$message.success("操作成功");
    };

    onMounted(() => {
      state.columns = tableColumns("productLineList", state.columnList);
    });

    return {
      ...toRefs(state),
      edit,
      addMenu,
      editRecord,
    };
  },
});
</script>
