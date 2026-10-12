<template lang="pug">
g-table(
    title="流程配置"
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
    template(v-slot:btn="item")
      a-button(type="link" @click="setFlow(item.record)") 流程设计  
</template>

<script lang="jsx">
import gLayout from "@ghcloud-legacy/bimops-fe-web-migrate-lib/src/components/global/Common/gLayout.vue";
import gTable from "@ghcloud-legacy/bimops-fe-web-migrate-lib/src/components/global/Common/gTable.vue";
import { timeFormat } from "@ghcloud-legacy/bimops-fe-web-migrate-lib/src/utils/common";
import { defineComponent, getCurrentInstance, reactive, ref, toRefs } from "vue";
import { useRouter } from "vue-router";
export default defineComponent({
  components: { gLayout, gTable },
  setup() {
    const router = useRouter();
    const tableRef = ref();
    const { proxy } = getCurrentInstance();
    const state = reactive({
      api: {
        list: "getProcessDefinition",
        deleteSingle: "deleteProcessDefinition",
        path: "/flowConfigDetail",
        add: "postProcessDefinition",
        edit: "putProcessDefinition",
        detail: "record",
      },
      search: [
        {
          label: "",
          value: "keyword",
          placeholder: "流程名称",
        },
      ],
      columns: [
        {
          dataIndex: "name",
          key: "name",
          title: "流程名称",
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
          dataIndex: "nodeCount",
          key: "nodeCount",
          title: "流程节点数",
          slots: {
            customRender: "nodeCount",
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
          dataIndex: "createBy",
          key: "createBy",
          title: "创建人",
          slots: {
            customRender: "createBy",
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
          dataIndex: "updateTime",
          key: "updateTime",
          title: "添加时间",
          slots: {
            customRender: "updateTime",
          },
          customRender: ({ text }) => {
            if (text) {
              return (
                <PopOver position="topLeft" content={timeFormat(text, true)}>
                  {timeFormat(text, true)}
                </PopOver>
              );
            } else {
              return "--";
            }
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
          label: "流程名称",
          value: "name",
        },
        // {
        //   label: "流程类型",
        //   value: "flowTypeId",
        //   component: "g-select",
        //   placeholder: "请选择",
        //   url: "getFlowTypeList",
        //   field: {
        //     id: "value",
        //     name: "label",
        //   },
        // },
        // {
        //   label: "启用状态",
        //   value: "enabled",
        //   component: "a-switch",
        //   placeholder: "请选择",
        //   options: [
        //     { label: "禁用", value: false },
        //     { label: "启用", value: true },
        //   ],
        //   defaultValue: true,
        // },
      ],
      rules: {
        name: [{ required: true, message: "请输入流程名称" }],
        flowTypeId: [{ required: true, message: "请选择流程类型" }],
        enabled: [{ required: true, message: "请选择流程状态" }],
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
        `/portal/legacy-business-config/flowConfigDetail?processDefinitionKey=${record.key}&name=${record.name}&id=${record.id}`,
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
