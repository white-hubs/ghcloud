<template lang="pug">
g-table(
    title="表单列表"
    editMode="page"
    :api="api"
    :btns="btns"
    :search="search"
    :modal="modal"
    :rules="rules"
    :slots="slots"
    :columns="columns"
    @slot="changeStatus"
    ref="tableRef"
)
</template>

<script lang="jsx">
import gTable from "@ghcloud-legacy/bimops-fe-web-migrate-lib/src/components/global/Common/gTable";
import { defineComponent, getCurrentInstance, reactive, ref, toRefs } from "vue";
import { useRouter } from "vue-router";

export default defineComponent({
  components: { gTable },
  setup() {
    const router = useRouter();
    const tableRef = ref();
    const { proxy } = getCurrentInstance();
    const state = reactive({
      api: {
        list: "getFormList",
        deleteSingle: "deleteFormDefinition",
        path: "/formDesign",
        add: "postFlow",
        edit: "putFlow",
        detail: "getFlow",
        pathParams: [
          {
            value: "name",
          },
        ],
      },
      search: [
        {
          label: "",
          value: "keyword",
          placeholder: "表单名称",
        },
      ],
      columns: [
        {
          dataIndex: "name",
          key: "name",
          title: "表单名称",
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
          title: "操作",
          dataIndex: "action",
          key: "action",
          slots: {
            customRender: "action",
          },
          width: 200,
          fixed: "right",
        },
      ],
      modal: [
        {
          label: "表单名称",
          value: "name",
        },
        {
          label: "表单类型",
          value: "flowTypeId",
          component: "g-select",
          placeholder: "请选择",
          url: "getFlowTypeList",
          field: {
            id: "value",
            name: "label",
          },
        },
        {
          label: "启用状态",
          value: "enabled",
          component: "a-switch",
          placeholder: "请选择",
          options: [
            { label: "禁用", value: false },
            { label: "启用", value: true },
          ],
          defaultValue: true,
        },
      ],
      rules: {
        name: [{ required: true, message: "请输入表单名称" }],
        flowTypeId: [{ required: true, message: "请选择表单类型" }],
        enabled: [{ required: true, message: "请选择表单状态" }],
      },
      slots: [
        {
          component: "a-switch",
          slot: "enabled",
        },
      ],
      btns: ["add", "edit", "deleteSingle"],
    });

    const setFlow = (record) => {
      history.pushState(
        { current: location.pathname + location.search },
        "",
        `/portal/legacy-business-config/flowConfigdetail?processDefinitionKey=${record.processKey}&name=${record.name}`,
      );
    };
    const changeStatus = async (slot, record) => {
      await proxy.$api.putFlow(record, "put");
      proxy.$message.success("操作成功");
      tableRef.value.getData();
    };
    return {
      ...toRefs(state),
      tableRef,
      setFlow,
      changeStatus,
    };
  },
});
</script>
