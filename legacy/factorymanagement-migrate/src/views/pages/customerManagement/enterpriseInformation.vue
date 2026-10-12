<template>
  <g-table
    ref="tableRef"
    title="企业信息"
    :columns="columns"
    :api="api"
    :search="search"
    :btns="btns"
    :editMode="'page'"
    :rowSelection="true"
  >
    <template v-slot:batch="{ record }">
      <a-popconfirm
        title="删除当前选中？"
        @confirm="deleteBatch(record)"
        :disabled="!record.length"
      >
        <a-button :disabled="!record.length" type="primary" danger>
          批量删除
        </a-button>
      </a-popconfirm>
    </template>
  </g-table>
</template>
<script lang="jsx">
import {
  defineComponent,
  reactive,
  toRefs,
  getCurrentInstance,
  ref,
} from "vue";

export default defineComponent({
  setup() {
    const state = reactive({
      columns: [
        {
          dataIndex: "name",
          title: "企业名称",
        },
        {
          dataIndex: "corporation",
          title: "企业法人",
        },
        {
          dataIndex: "typeName",
          key: "typeName",
          title: "企业类型",
          slots: {
            customRender: "typeName",
          },
          customRender: ({ text }) => {
            return text ? text : "--";
          },
        },
        {
          dataIndex: "scaleName",
          key: "scaleName",
          title: "企业规模",
          slots: {
            customRender: "scaleName",
          },
          customRender: ({ text }) => {
            return text ? text : "--";
          },
        },
        {
          dataIndex: "industryTypeName",
          key: "industryTypeName",
          title: "企业行业",
          slots: {
            customRender: "industryTypeName",
          },
          customRender: ({ text }) => {
            return text ? text : "--";
          },
        },
        {
          dataIndex: "action",
          title: "操作",
          slots: {
            customRender: "action",
          },
        },
      ],
      api: {
        list: "getEnterprisePaging",
        deleteSingle: "getEnterpriseDel",
        delete: "",
        path: "/enterpriseInformationAdd",
      },
      search: [
        //企业名称搜索
        {
          label: "",
          value: "keyword",
          placeholder: "请输入企业名称搜索",
        },
        // 行业类型
        {
          label: "行业类型",
          value: "industryTypeId",
          component: "gSelect",
          url: "getTypeList",
          params: { tag: "INDUSTRY" },
          field: { id: "value", name: "label" },
          placeholder: "请选择行业类型",
        },
        // 企业类型
        {
          label: "企业类型",
          value: "type",
          component: "gSelect",
          url: "getEnterpriseManagementTypes",
          field: { code: "value", name: "label" },
          placeholder: "请选择企业类型",
        },

        // 企业规模
        {
          label: "企业规模",
          value: "scale",
          component: "gSelect",
          url: "getEnterpriseScale",
          field: { code: "value", name: "label" },
          placeholder: "请选择企业规模",
        },
      ],
      btns: ["add", "detail", "edit", "deleteSingle"],
    });
    const { proxy } = getCurrentInstance();
    const tableRef = ref();
    const deleteBatch = record => {
      proxy.$api.getEnterpriseBatchDel(record).then(() => {
        proxy.$message.success("操作成功");
        tableRef.value.getData();
      });
    };
    return {
      ...toRefs(state),
      deleteBatch,
      tableRef,
    };
  },
});
</script>
<style scoped lang="less">
.btns {
  margin-left: 10px;
}
</style>
