<template lang="pug">
g-table(
  :title="pageTitle"
  editMode="page"
  :columns="columns"
  :search="search"
  :api="api"
  :btns="['detail']"
)            
</template>
<script lang='jsx'>
import { defineComponent, reactive, toRefs } from "vue";
import { usePageName } from '@ghcloud/cube-utils'

export default defineComponent({
  setup() {
    const { pageTitle } = usePageName()
    const state = reactive({
      columns: [
        {
          dataIndex: "name",
          key: "name",
          title: "区域名称",
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
          dataIndex: "code",
          key: "code",
          title: "区域编号",
          slots: {
            customRender: "code",
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
          dataIndex: "quantity",
          key: "quantity",
          title: "档位总数",
          slots: {
            customRender: "quantity",
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
          dataIndex: "rentable",
          key: "rentable",
          title: "可出租数",
          slots: {
            customRender: "rentable",
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
          dataIndex: "leased",
          key: "leased",
          title: "已出租数",
          slots: {
            customRender: "leased",
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
          dataIndex: "unleased",
          key: "unleased",
          title: "未出租数",
          slots: {
            customRender: "unleased",
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
          dataIndex: "vacantRate",
          key: "vacantRate",
          title: "空置率",
          slots: {
            customRender: "vacantRate",
          },
          customRender: ({ text }) => {
            return (
              <PopOver position="topLeft" content={text * 100 + "%"}>
                {text * 100 + "%"}
              </PopOver>
            );
          },
        },
        // {
        //   title: "操作",
        //   dataIndex: "action",
        //   key: "action",
        //   slots: {
        //     customRender: "action",
        //   },
        //   width: 200,
        //   fixed: "right",
        // },
      ],
      search: [{ label: "", value: "keyword", placeholder: "区域名称" }],
      api: {
        list: "getAreaStatStallPage",
        path: "/areaLeaseDetail",
      },
    });

    return {
      ...toRefs(state),
      pageTitle
    };
  },
});
</script>
<style scoped lang="less">

</style>
