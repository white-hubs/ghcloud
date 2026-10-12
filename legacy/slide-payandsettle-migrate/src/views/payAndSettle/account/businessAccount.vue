<template lang="pug">
g-table(
  title="商家账户"
  editMode='page'
  :api="api"
  :btns="btns"
  :search="search"
  :columns="columns"
)
  template(v-slot:btn='item')
    a(@click="detail(item.record)" v-if="item.record.activateTime") 详情
    a(v-else disabled) 详情
</template>
<script lang="jsx">
// import { cloneDeep } from "lodash-es";
// import { flattenTree } from "@/utils/common.js";
import { activeStatus } from "@/utils/enumerate.js";
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
import { timeFormat, millennial, tableColumns } from "@/utils/common.js";
import qs from "qs";
export default defineComponent({
  setup() {
    const { proxy } = getCurrentInstance();
    const router = useRouter();
    const dateFormat = "YYYY/MM/DD";
    const state = reactive({
      columnList: [
        // "id",
        "adminUserName",
        "balance",
        "status",
        "activateTime",
        "action",
      ],
      columns: [
        {
          mark: "adminUserName",
          dataIndex: "adminUserName",
          key: "adminUserName",
          title: "客户名称",
          slots: {
            customRender: "adminUserName",
          },
          customRender: ({ text }) => {
            return (
              <PopOver position="topLeft" content={text ? text : ""}>
                {text ? text : "--"}
              </PopOver>
            );
          },
          ellipsis: true,
        },
        {
          mark: "balance",
          dataIndex: "balance",
          key: "balance",
          title: "账户余额",
          slots: {
            customRender: "balance",
          },
          customRender: ({ text }) => {
            return (
              <PopOver
                position="topLeft"
                content={text ? `￥${millennial(text)}` : ""}
              >
                {text || text === 0 ? `￥${millennial(text)}` : "--"}
              </PopOver>
            );
          },
          ellipsis: true,
        },
        {
          mark: "status",
          dataIndex: "status",
          key: "status",
          title: "激活状态",
          slots: {
            customRender: "status",
          },
          customRender: ({ text }) => {
            if (text === "ACTIVATED") {
              return <g-table-dot content="已激活" />;
            } else {
              return <g-table-dot content="待激活" status="audit" />;
            }
          },
          ellipsis: true,
        },
        {
          mark: "activateTime",
          dataIndex: "activateTime",
          key: "activateTime",
          title: "激活时间",
          slots: {
            customRender: "activateTime",
          },
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
          ellipsis: true,
        },
        {
          mark: "action",
          dataIndex: "action",
          key: "action",
          title: "操作",
          slots: {
            customRender: "action",
          },
          width: 65,
          ellipsis: true,
        },
      ],
      api: {
        list: "userTransactions",
        path: "businessAccountDetail",
      },
      btns: [],
      search: [
        {
          label: "账户类型",
          value: "status",
          component: "a-select",
          defaultValue: " ",
          options: activeStatus,
          placeholder: "请选择",
        },
        {
          label: "开通时间",
          value: "date",
          defaultDate: "period",
          component: "a-range-picker",
        },
        { label: "", value: "keyword", placeholder: "客户名称" },
        {
          label: "",
          value: "tenant",
          component: "span",
          defaultValue: JSON.parse(sessionStorage.getItem("GH-NowEnterprise"))
            ?.code,
        },
      ],
      statistics: {
        total: null,
        platform: null,
        merchant: null,
      },
    });

    onMounted(() => {
      // state.columns = tableColumns("accountManage", state.columnList, 65);
    });

    const detail = (record) => {
      const id = record?.id ? record.id : "";
      history.pushState({},'',`/portal/payAndSettle//businessAccountDetail?id=${id}&details=${JSON.stringify(record)}`)
 
    };

    return {
      ...toRefs(state),
      detail,
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
