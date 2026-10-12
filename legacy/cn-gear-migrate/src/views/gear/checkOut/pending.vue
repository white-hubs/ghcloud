<template lang="pug">
g-table(
    :title="pageTitle"
    editMode="page"
    :columns="columns" 
    :search="search" 
    :btns="btns"
    :api="api"
    ref="tableRef")
    template(v-slot:btn='item')
      a-button(type="link" @click="handleRecord(item.record)") 处理
            
</template>
<script lang='jsx'>
import { defineComponent, reactive, toRefs } from "vue";
import { payStatus } from "@/utils/enumerate.js";
import { replaceObjectKeys } from "@pansy/utils";
import moment from "moment";
import { useRouter } from "vue-router";
import { usePageName } from '@ghcloud/cube-utils'

export default defineComponent({
  setup() {
    const { pageTitle } = usePageName()
    const router = useRouter();
    const state = reactive({
      api: {
        list: "getStallReleasePending",
        path: "/gearCheckOutApproval",
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
        //     if (text === "STALL_RELEASE_INITIAL") {
        //       return "初始提交";
        //     } else if (text === "STALL_RELEASE_CONFIRM") {
        //       return "资料确认";
        //     } else if (text === "STALL_RELEASE_PASSED") {
        //       return "审核通过";
        //     } else if (text === "STALL_RELEASE_FAILED") {
        //       return "审核不通过";
        //     } else if (text === "STALL_RELEASE_VOIDED") {
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
            if (text === "STALL_RELEASE_PROCESSING") {
              return <g-table-dot content="处理中" status="audit" />;
            } else if (text === "STALL_RELEASE_FINISHED") {
              return <g-table-dot content="已完成" />;
            } else if (text === "STALL_RELEASE_VOIDED") {
              return <g-table-dot content="已作废" status="delete" />;
            } else if (text === "STALL_RELEASE_PENDING") {
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
      btns: [],
      search: [
        {
          label: "",
          value: "keyword",
          placeholder: "单据编号/联系人姓名/联系人手机",
        },
      ],
    });
    /*点击处理*/
    const handleRecord = (record) => {
      if (record.status === "STALL_RELEASE_PENDING") {
        history.pushState(
          { current: location.pathname + location.search }, '',
          `/portal/charge/gearCheckOutApproval?type=edit&id=${record?.id}&status=${record.status}&progress=${record.progress}`
        )
      } else {
        history.pushState(
          { current: location.pathname + location.search }, '',
          `/portal/charge/gearCheckOutApproval?type=detail&id=${record?.id}&status=${record.status}&progress=${record.progress}`
        )
      }
    };
    return {
      ...toRefs(state),
      handleRecord,
      pageTitle
    };
  },
});
</script>
<style scoped lang="less">

</style>
