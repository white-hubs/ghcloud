<template lang="pug">
g-table(
  ref="tableRef"
  title="采购商资料"
  editMode="page"
  :api="api"
  :btns="btns"
  :search="search"
  :columns="columns")
  template(v-slot:btn="{record}")
    a-button(type="link" @click="detail(record)" :disabled="record.status === 'UNAUTHORIZED' ? true : false") 详情
    a-button(v-if="record.status === 'AUDITED'" type="link" @click="authInfo(record)" :disabled="record.status === 'CERTIFIED' ? true : false") 审核
    a-button(v-else type="link" @click="authInfo(record)" :disabled="record.status !== 'UNAUTHORIZED' && record.status !== null ? true : false") 认证
</template>
<script lang="jsx">
import {
  defineComponent,
  reactive,
  toRefs,
  getCurrentInstance,
  ref,
  onMounted,
} from "vue";
import { useRouter } from "vue-router";
import { millennial, timeFormat } from "@/utils/common";
import { wholeSalerStatus, wholeSalerType } from "@/utils/enumerate";
export default defineComponent({
  setup() {
    const { proxy } = getCurrentInstance();
    const router = useRouter();
    const state = reactive({
      columns: [
        {
          dataIndex: "delegateName",
          title: "联系人姓名",
          slots: {
            customRender: "delegateName",
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
          dataIndex: "status",
          title: "认证状态",
          slots: {
            customRender: "status",
          },
          customRender: ({ text }) => {
            return (
              <PopOver
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
                    : ""
                }
              >
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
          dataIndex: "type",
          title: "认证类型",
          slots: {
            customRender: "type",
          },
          customRender: ({ text }) => {
            return (
              <PopOver
                content={
                  text
                    ? text === "PERSONAL"
                      ? "个人"
                      : text === "ENTERPRISE"
                        ? "企业"
                        : "个体工商户"
                    : ""
                }
              >
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
        {
          dataIndex: "auditTime",
          title: "审核时间",
          slots: {
            customRender: "auditTime",
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
          dataIndex: "action",
          title: "操作",
          fixed: "right",
          slots: {
            customRender: "action",
          },
        },
      ],
      api: {
        list: "getPurchaserAuthenticationPage",
        path: "/purchaserInfoOperate",
        pathParams: [{ value: "status" }],
      },
      btns: [],
      search: [
        {
          label: "认证状态",
          value: "status",
          component: "a-select",
          options: wholeSalerStatus,
          placeholder: "请选择",
        },
        {
          label: "认证类型",
          value: "type",
          component: "a-select",
          options: wholeSalerType,
          placeholder: "请选择",
        },
        // {
        //   label: "",
        //   value: "keyword",
        //   placeholder: "请输入商户名称",
        // },
      ],
    });

    const tableRef = ref();

    const authInfo = (record) => {
      history.pushState({ current: location.pathname + location.search }, "", `/portal/business/purchaserInfoOperate?id=${record.id}&type=${record.status !== "AUDITED" ? "addAudit" : "detail"}&status=${record.status === "UNAUTHORIZED" || record.status === null
          ? "AUDITED"
          : record.status}
      `)
    };
    const detail = (record) => {
      history.pushState({ current: location.pathname + location.search }, "", `/portal/business/purchaserInfoOperate?id=${record.id}&type=detail&status=${record.status === "UNAUTHORIZED" || record.status === null ? "AUDITED" : record.status}
      `)
    }
    onMounted(() => { });

    return {
      tableRef,
      ...toRefs(state),
      authInfo,
      detail
    };
  },
});
</script>
<style scoped lang="less"></style>
