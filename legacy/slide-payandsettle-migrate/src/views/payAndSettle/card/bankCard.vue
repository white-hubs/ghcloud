<template lang="pug">
g-table(
  title="银行卡列表"
  editMode="page"
  ref="tableRef"
  :btns="[]"
  :api="api"
  :search="search"
  :columns="columns"
)
</template>
<script lang="jsx">
import { defineComponent, reactive, toRefs, getCurrentInstance } from "vue";
import { useRouter } from "vue-router";
import { timeFormat } from "@/utils/common.js";

export default defineComponent({
  setup() {
    const state = reactive({
      columns: [
        // 暂无
        {
          dataIndex: "code",
          key: "code",
          title: "银行卡号",
          slots: {
            customRender: "code",
          },
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
          dataIndex: "bank",
          key: "bank",
          title: "所属银行",
          slots: {
            customRender: "bank",
          },
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
          dataIndex: "issuer",
          key: "issuer",
          title: "开户银行",
          slots: {
            customRender: "issuer",
          },
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
          dataIndex: "owner",
          key: "owner",
          title: "开户姓名",
          slots: {
            customRender: "owner",
          },
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
          dataIndex: "idcard",
          key: "idcard",
          title: "身份证号",
          slots: {
            customRender: "idcard",
          },
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
          dataIndex: "supplier.liaison",
          key: "liaison",
          title: "联系人姓名",
          slots: {
            customRender: "liaison",
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
          dataIndex: "supplier.phone",
          key: "phone",
          title: "联系人电话",
          slots: {
            customRender: "phone",
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
          dataIndex: "createTime",
          key: "createTime",
          title: "绑定时间",
          slots: {
            customRender: "createTime",
          },
          ellipsis: true,
          customRender: ({ text }) => {
            if (text) {
              return (
                <PopOver
                  position="topLeft"
                  content={text ? timeFormat(text, true) : ""}
                >
                  {text ? timeFormat(text, true) : "--"}
                </PopOver>
              );
            } else {
              return "--";
            }
          },
        },
        // {
        //   title: "操作",
        //   dataIndex: "action",
        //   key: "action",
        //   slots: {
        //     customRender: "action",
        //   },
        //   width: 175,
        //   fixed: "right",
        // },
      ],
      api: {
        list: "getBankCardList",
        path: "/bindCard",
      },
      search: [
        {
          label: "绑卡时间",
          value: "date",
          defaultDate: "period",
          component: "a-range-picker",
        },
        {
          label: "",
          value: "keyword",
          placeholder: "银行卡/联系人/联系人电话",
        },
        {
          label: "",
          value: "tenant",
          component: "span",
          defaultValue: JSON.parse(sessionStorage.getItem("GH-NowEnterprise"))
            ?.code,
        },
      ],
    });

    return {
      ...toRefs(state),
    };
  },
});
</script>
<style scoped lang="less">

.flex {
  justify-content: space-between;
  align-items: center;
}
</style>
