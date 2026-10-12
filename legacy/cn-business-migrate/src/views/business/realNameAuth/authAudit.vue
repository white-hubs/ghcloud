<template lang="pug">
g-table(
  title="批发商实名认证"
  editMode="page"
  :api="api"
  :btns="btns"
  :search="search"
  :columns="columns"
  :scrollX="1050"
)
</template>
<script lang="jsx">
import {
  businessRole,
  wholeSalerType,
  realNameStatus,
} from "@/utils/enumerate";
import {
  defineComponent,
  reactive,
  toRefs,
  getCurrentInstance,
  createVNode,
  ref,
  onMounted,
} from "vue";
import { useRouter } from "vue-router";
import { timeFormat } from "@/utils/common";
export default defineComponent({
  setup() {
    const { proxy } = getCurrentInstance();
    const router = useRouter();
    const state = reactive({
      columns: [
        {
          dataIndex: "type",
          title: "认证类型",
          slots: {
            customRender: "type",
          },
          customRender: ({ text }) => {
            return (
              <PopOver content={text
                  ? text === "PERSONAL"
                    ? "个人"
                    : text === "ENTERPRISE"
                    ? "企业"
                    : "个体工商户"
                  : "--"}>
                {text
                  ? text === "PERSONAL"
                    ? "个人"
                    : text === "ENTERPRISE"
                    ? "企业"
                    : "个体工商户"
                  : "--"}
              </PopOver>
            );
          },
        },
        // { title: "认证主体", dataIndex: "supplierName" },
        {
          title: "认证主体",
          dataIndex: "delegateName",
          customRender: ({ text }) => {
            return <PopOver content={text}>{text ? text : "--"}</PopOver>;
          },
        },
        {
          dataIndex: "liaison",
          title: "联系人姓名",
          slots: {
            customRender: "liaison",
          },
          customRender: ({ text }) => {
            return <PopOver content={text}>{text ? text : "--"}</PopOver>;
          },
        },
        {
          dataIndex: "phone",
          title: "联系人手机号",
          slots: {
            customRender: "phone",
          },
          customRender: ({ text }) => {
            return <PopOver content={text}>{text ? text : "--"}</PopOver>;
          },
        },
        {
          dataIndex: "source",
          title: "认证来源",
          slots: {
            customRender: "source",
          },
          customRender: ({ text }) => {
            return <PopOver content={text=='PC' ? '后台' : "小程序"}>{text=='PC' ? '后台' : "小程序"}</PopOver>;
          },
        },
        {
          dataIndex: "status",
          title: "认证状态",
          slots: {
            customRender: "status",
          },
          customRender: ({ text }) => {
            return (
              <PopOver content={text
                      ? text === "INVALID"
                        ? "已失效"
                        : text === "UNAUTHORIZED"
                        ? "未认证"
                        : text === "AUDITED"
                        ? "待审核"
                        : text === "CERTIFIED"
                        ? "已认证"
                        : "未通过"
                      : "--"}>
                <g-table-dot
                  content={
                    text
                      ? text === "INVALID"
                        ? "已失效"
                        : text === "UNAUTHORIZED"
                        ? "未认证"
                        : text === "AUDITED"
                        ? "待审核"
                        : text === "CERTIFIED"
                        ? "已认证"
                        : "未通过"
                      : "--"
                  }
                  status={
                    text
                      ? text === "INVALID"
                        ? "blue"
                        : text === "UNAUTHORIZED"
                        ? "audit"
                        : text === "AUDITED"
                        ? "audit"
                        : text === "CERTIFIED"
                        ? "normal"
                        : "delete"
                      : "--"
                  }
                ></g-table-dot>
              </PopOver>
            );
          },
        },
        {
          dataIndex: "submitTime",
          title: "提交时间",
          slots: {
            customRender: "submitTime",
          },
          customRender: ({ text }) => {
            return (
              <PopOver content={text ? timeFormat(text, true) : ""}>
                {text ? timeFormat(text, true) : "--"}
              </PopOver>
            );
          },
        },
        {
          title: "操作",
          dataIndex: "action",
          slots: { customRender: "action" },
          fixed: "right",
        },
      ],
      api: {
        list: "realNamePage",
        path: "/authAuditOperate",
        pathParams: [{ value: "type" }, { value: "status" }],
      },
      btns: ["detail"],
      search: [
        {
          label: "认证类型",
          value: "type",
          component: "a-select",
          defaultValue: " ",
          options: wholeSalerType,
          placeholder: "请选择",
        },
        {
          label: "认证状态",
          value: "status",
          component: "a-select",
          defaultValue: " ",
          options: realNameStatus.filter((item) => item.label !== "未认证"),
          placeholder: "请选择",
        },
        { label: "", value: "keyword", placeholder: "主体名称" },
      ],
    });

    onMounted(function(){});

    return {
      ...toRefs(state),
    };
  },
});
</script>
<style scoped lang="less">
// @import url("@/styles/theme/color.less");;

</style>
