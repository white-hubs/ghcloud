<template lang="pug">
g-table(
    :title="pageTitle"
    editMode="page"
    :columns="columns" 
    :search="search" 
    :btns="btns"
    :api="api"
    :btnDisabled="btnDisabled"
    ref="tableRef")
</template>

<script lang='jsx'>
import { defineComponent, reactive, toRefs } from "vue";

import moment from "moment";
import { usePageName } from '@ghcloud/cube-utils'

export default defineComponent({
  setup() {
    const { pageTitle } = usePageName()
    const state = reactive({
      api: {
        list: "getStallLeaseStarted",
        path: "/gearLeaseApproval",
        pathParams: [{ value: "status" }, { value: "progress" }],
      },
      columns: [
        {
          dataIndex: "code",
          key: "code",
          title: "单据编号",
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
          dataIndex: "merchantName",
          key: "merchantName",
          title: "商户名称",
          slots: {
            customRender: "merchantName",
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
          dataIndex: "merchantLiaison",
          key: "merchantLiaison",
          title: "联系人姓名",
          slots: {
            customRender: "merchantLiaison",
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
          dataIndex: "merchantPhone",
          key: "merchantPhone",
          title: "联系人手机号",
          slots: {
            customRender: "merchantPhone",
          },
          customRender: ({ text }) => {
            return (
              <PopOver position="topLeft" content={text ? text : ""}>
                {text ? text : "--"}
              </PopOver>
            );
          },
        },
        // {
        //   dataIndex: "progress",
        //   key: "progress",
        //   title: "处理进度",
        //   slots: {
        //     customRender: "progress",
        //   },
        //
        //   customRender: ({ text }) => {
        //     if (text === "STALL_LEASE_INITIAL") {
        //       return "初始提交";
        //     } else if (text === "STALL_LEASE_CONFIRM") {
        //       return "资料确认";
        //     } else if (text === "STALL_LEASE_PASSED") {
        //       return "审核通过";
        //     } else if (text === "STALL_LEASE_FAILED") {
        //       return "审核不通过";
        //     } else if (text === "STALL_LEASE_VOIDED") {
        //       return "资料作废";
        //     } else {
        //       return "--";
        //     }
        //   },
        // },
        {
          dataIndex: "createTime",
          key: "createTime",
          title: "提交时间",
          slots: {
            customRender: "createTime",
          },
          customRender: ({ text }) => {
            return (
              <PopOver
                position="topLeft"
                content={moment(text).format("YYYY-MM-DD HH:mm:ss")}
              >
                {moment(text).format("YYYY-MM-DD HH:mm:ss")}
              </PopOver>
            );
          },
        },
        {
          dataIndex: "status",
          key: "status",
          title: "处理状态",
          slots: {
            customRender: "status",
          },

          customRender: ({ text }) => {
            if (text === "STALL_LEASE_PROCESSING") {
              return <g-table-dot content="处理中" status="audit" />;
            } else if (text === "STALL_LEASE_FINISHED") {
              return <g-table-dot content="已完成" />;
            } else if (text === "STALL_LEASE_VOIDED") {
              return <g-table-dot content="已作废" status="delete" />;
            } else if (text === "STALL_LEASE_PENDING") {
              return <g-table-dot content="待处理" />;
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
      btns: ["detail", "add", "edit"],
      search: [
        {
          label: "",
          value: "keyword",
          placeholder: "单据编号/联系人姓名/联系人手机",
        },
      ],
      btnDisabled: {
        edit: (value) => {
          return value.status !== "STALL_LEASE_PENDING";
        },
      },
    });
    return {
      ...toRefs(state),
      pageTitle
    };
  },
});
</script>

<style lang="less" scoped>

</style>
