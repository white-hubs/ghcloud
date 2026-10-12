<template lang="pug">
g-table(
  title="商户认证"
  editMode="page"
  :api="api"
  :btns="btns"
  :search="search"
  :columns="columns"
)
</template>
<script lang="jsx">
import {
  businessRole,
  natureOperation,
  AuthenticationStatus,
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
// import { CaretDownOutlined, CaretRightOutlined } from "@ant-design/icons-vue";
import { CaretDownOutlined } from "@ant-design/icons-vue";
import { timeFormat } from "@/utils/common";
export default defineComponent({
  setup() {
    const { proxy } = getCurrentInstance();
    const router = useRouter();
    const state = reactive({
      columnList: [
        "merchantName",
        "liaison",
        "phone",
        "type",
        // "bizType",
        "auditStatus",
        "sellerStatus",
        "submitTime",
        // "reviewTime",
        "action",
      ],
      columns: [
        {
          mark: "merchantName",
          dataIndex: "merchantName",
          key: "merchantName",
          title: "商家名称",
          slots: {
            customRender: "merchantName",
          },
          ellipsis: true,
          customRender: ({ text }) => {
            return (
              <PopOver position="topLeft" content={text}>
                {text ? text : "--"}
              </PopOver>
            );
          },
        }, {
          mark: "liaison",
          dataIndex: "liaison",
          key: "liaison",
          title: "联系人姓名",
          slots: {
            customRender: "liaison",
          },
          // width: 105,
          ellipsis: true,
          customRender: ({ text }) => {
            return (
              <PopOver position="topLeft" content={text ? text : ""}>
                {text ? text : "--"}
              </PopOver>
            );
          },
        }, {
          mark: "phone",
          dataIndex: "phone",
          key: "phone",
          title: "联系人手机号",
          slots: {
            customRender: "phone",
          },
          // width: 120,
          ellipsis: true,
          customRender: ({ text }) => {
            return (
              <PopOver position="topLeft" content={text ? text : ""}>
                {text ? text : "--"}
              </PopOver>
            );
          },
        }, {
          mark: "type",
          dataIndex: "type",
          key: "type",
          title: "经营性质",
          slots: {
            customRender: "type",
          },
          // width: 90,
          ellipsis: true,
          customRender: ({ text, index }) => {
            if (text === "TYPE_PERSONAL") {
              return (
                <PopOver position="topLeft" content="个人">
                  个人
                </PopOver>
              );
            } else {
              return (
                <PopOver position="topLeft" content="企业">
                  企业
                </PopOver>
              );
            }
          },
        }, {
          mark: "auditStatus",
          dataIndex: "auditStatus",
          key: "auditStatus",
          title: "实名认证状态",
          slots: {
            customRender: "auditStatus",
          },
          width: 120,
          ellipsis: true,
          customRender: ({ text, index }) => {
            if (text === "AUDITED") {
              return <g-table-dot content="待审核" status="audit" />;
            } else if (text === "CERTIFIED") {
              return <g-table-dot content="已认证" />;
            } else if (text === "FAILED") {
              return <g-table-dot content="不通过" status="delete" />;
            } else {
              return <g-table-dot content="未认证" status="audit" />;
            }
          },
        }, {
          mark: "sellerStatus",
          dataIndex: "sellerStatus",
          key: "sellerStatus",
          title: "卖家认证状态",
          slots: {
            customRender: "sellerStatus",
          },
          width: 120,
          ellipsis: true,
          customRender: ({ text, index }) => {
            if (text === "AUDITED") {
              return <g-table-dot content="待审核" status="audit" />;
            } else if (text === "CERTIFIED") {
              return <g-table-dot content="已认证" />;
            } else if (text === "FAILED") {
              return <g-table-dot content="不通过" status="delete" />;
            } else {
              return <g-table-dot content="未认证" status="audit" />;
            }
          },
        }, {
          mark: "submitTime",
          dataIndex: "submitTime",
          key: "submitTime",
          title: "提交时间",
          slots: {
            customRender: "submitTime",
          },
          width: 180,
          ellipsis: true,
          customRender: ({ text }) => {
            return (
              <PopOver
                position="topLeft"
                content={text ? timeFormat(text, true) : ""}
              >
                {text ? `${timeFormat(text, true)}` : "--"}
              </PopOver>
            );
          },
        }, {
          title: "操作",
          mark: "action",
          dataIndex: "action",
          key: "action",
          slots: {
            customRender: "action",
          },
          fixed: "right",
        }
      ],
      api: {
        list: "getAuthentication",
        path: "/moreAuthenDetails",
      },
      btns: ["detail"],
      search: [
        {
          label: "经营性质",
          value: "type",
          component: "a-select",
          defaultValue: " ",
          options: natureOperation,
          placeholder: "请选择",
        },
        {
          label: "实名认证",
          value: "auditStatus",
          component: "a-select",
          defaultValue: " ",
          options: AuthenticationStatus,
          placeholder: "请选择",
        },
        {
          label: "卖家认证",
          value: "sellerStatus",
          component: "a-select",
          defaultValue: " ",
          options: AuthenticationStatus,
          placeholder: "请选择",
        },
        { label: "", value: "keyword", placeholder: "商家名称" },
      ],
    });

    onMounted(() => {
      // state.columns = tableColumns("businessManage", state.columnList, 70);
    });

    return {
      ...toRefs(state),
    };
  },
});
</script>
<style scoped lang="less">
// @import url("@/styles/theme/color.less");;
</style>
