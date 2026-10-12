<template>
  <div>
    <g-table
      ref="tableRef"
      title="企业名录"
      :columns="columns"
      :btns="btns"
      :search="search"
      :api="api"
      :editMode="'page'"
      style="height: 600px"
    ></g-table>
  </div>
</template>

<script lang="jsx">
import {
  defineComponent,
  reactive,
  toRefs,
  onBeforeMount,
  onMounted,
} from "vue";
export default defineComponent({
  name: "",
  setup() {
    const data = reactive({
      columns: [
        {
          title: "企业名称",
          dataIndex: "name",
          key: "name",
          ellipsis: true,
          customRender: ({ text }) => {
            return (
              <PopOver position="topLeft" content={text ? text : ""}>
                {text ? text : "--"}
              </PopOver>
            );
          },
        },
        {
          title: "租赁房间",
          dataIndex: "corporation",
          key: "corporation",
          ellipsis: true,
          customRender: ({ text }) => {
            return (
              <PopOver position="topLeft" content={text ? text : ""}>
                {text ? text : "--"}
              </PopOver>
            );
          },
        },
        {
          title: "企业类型",
          dataIndex: "typeName",
          key: "typeName",
          ellipsis: true,
          customRender: ({ text }) => {
            return (
              <PopOver position="topLeft" content={text ? text : ""}>
                {text ? text : "--"}
              </PopOver>
            );
          },
        },
        {
          title: "行业类型",
          dataIndex: "industryTypeName",
          key: "industryTypeName",
          ellipsis: true,
          customRender: ({ text }) => {
            return (
              <PopOver position="topLeft" content={text ? text : ""}>
                {text ? text : "--"}
              </PopOver>
            );
          },
        },
        {
          title: "企业规模",
          dataIndex: "scaleName",
          key: "scaleName",
          ellipsis: true,
          customRender: ({ text }) => {
            return (
              <PopOver position="topLeft" content={text ? text : ""}>
                {text ? text : "--"}
              </PopOver>
            );
          },
        },
      ],
      api: {
        list: "getEnterpriseDirectory",
        deleteSingle: "",
        delete: "",
        path: "",
      },
      search: [
        //企业名称搜索
        {
          label: "企业名称",
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
          field: {
            code: "value",
            name: "label",
          },
          placeholder: "请选择企业类型",
        },

        // // 企业规模
        {
          label: "企业规模",
          value: "scale",
          component: "gSelect",
          url: "getEnterpriseScale",
          field: { code: "value", name: "label" },
          placeholder: "请选择企业规模",
        },
      ],
      btns: [],
    });
    onBeforeMount(() => {
      //2.组件挂载页面之前执行----onBeforeMount
    });
    onMounted(() => {
      //3.组件挂载到页面之后执行-------onMounted
    });
    return {
      ...toRefs(data),
    };
  },
});
</script>
<style scoped lang="less"></style>
