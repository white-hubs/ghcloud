<template lang="pug">
g-table(
  title="提现审批"
  :btns="[]"
  :columns="columns"
  :search="search"
  :api="api"
)
  template(v-slot:btn='item')
    a-button(:disabled="item.record.status !== 'AUDITING'" type="link" @click="deal(item.record)") 审核
    a-button(:disabled="item.record.status !== 'PASSED'" type="link" @click="deal(item.record)") 划账
    a-button(type="link" @click="deal(item.record)") 详情
</template>
<script lang="jsx">
// import { cloneDeep } from "lodash-es";
// import { flattenTree } from "@/utils/common.js";
import { withdraw } from "@/utils/enumerate.js";
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
import { timeFormat, millennial } from "@/utils/common";

export default defineComponent({
  setup() {
    const router = useRouter();
    const state = reactive({
      columns: [
        // 暂无
        {
          dataIndex: "id",
          key: "id",
          title: "提现单号",
          slots: {
            customRender: "id",
          },
          customRender: ({ text }) => {
            return (
              <PopOver position="topLeft" content={text ? text : ""}>
                {text ? text : "--"}
              </PopOver>
            );
          },
          // width: 150,
          ellipsis: true,
        },

        {
          dataIndex: "supplier.name",
          key: "supplierName",
          title: "商家名称",
          slots: {
            customRender: "supplierName",
          },
          // width: 150,
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
          key: "liaisonName",
          title: "联系人姓名",
          slots: {
            customRender: "liaisonName",
          },
          customRender: ({ text }) => {
            return (
              <PopOver position="topLeft" content={text ? text : ""}>
                {text ? text : "--"}
              </PopOver>
            );
          },
          // width: 150,
          ellipsis: true,
        },
        {
          dataIndex: "supplier.phone",
          key: "liaisonPhone",
          title: "联系人电话",
          slots: {
            customRender: "liaisonPhone",
          },
          customRender: ({ text }) => {
            return (
              <PopOver position="topLeft" content={text ? text : ""}>
                {text ? text : "--"}
              </PopOver>
            );
          },
          // width: 140,
          ellipsis: true,
        },
        {
          dataIndex: "amount",
          key: "amount",
          title: "金额",
          slots: {
            customRender: "amount",
          },
          customRender: ({ text }) => {
            if (text || text === 0) {
              return (
                <PopOver position="topLeft" content={"￥" + millennial(text)}>
                  {"￥" + millennial(text)}
                </PopOver>
              );
            } else {
              return "--";
            }
          },
          // width: 140,
          ellipsis: true,
        },
        {
          dataIndex: "owner",
          key: "owner",
          title: "申请人",
          slots: {
            customRender: "owner",
          },
          customRender: ({ text }) => {
            return (
              <PopOver position="topLeft" content={text ? text : ""}>
                {text ? text : "--"}
              </PopOver>
            );
          },
          // width: 110,
          ellipsis: true,
        },
        {
          dataIndex: "createTime",
          key: "createTime",
          title: "申请时间",
          slots: {
            customRender: "createTime",
          },
          customRender: ({ text }) => {
            return (
              <PopOver
                position="topLeft"
                content={text ? timeFormat(text, true) : ""}
              >
                {text ? timeFormat(text, true) : "--"}
              </PopOver>
            );
          },
          // width: 150,
          ellipsis: true,
        },
        {
          dataIndex: "status",
          key: "status",
          title: "提现状态",
          slots: {
            customRender: "status",
          },
          customRender: ({ text }) => {
            if (text === "AUDITING") {
              return <g-table-dot content="待审核" status="audit" />;
            } else if (text === "PASSED") {
              return <g-table-dot content="已通过" />;
            } else if (text === "REJECTED") {
              return <g-table-dot content="已拒绝" status="delete" />;
            } else if (text === "CANCELED") {
              return <g-table-dot content="已取消" status="audit" />;
            } else if (text === "COMPLETED") {
              return <g-table-dot content="已完成" />;
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
          fixed: "right",
        },
      ],
      api: {
        list: "getExam",
      },
      search: [
        {
          label: "提现状态",
          value: "status",
          component: "a-select",
          defaultValue: " ",
          options: withdraw,
          placeholder: "请选择",
        },
        // {label:'提现时间',value:'status',component:'a-rang-picker'},
        { label: "", value: "keyword", placeholder: "商家名称/提现单号" },
        {
          label: "",
          value: "tenant",
          component: "span",
          defaultValue: JSON.parse(sessionStorage.getItem("GH-NowEnterprise"))
            ?.code,
        },
      ],
    });

    const deal = (record) => {
      const id = record?.id ? record.id : "";
      history.pushState({},'',`/portal/payAndSettle/approveDetail?id=${id}&type=${detail}`)
   
    };

    return {
      ...toRefs(state),
      deal,
    };
  },
});
</script>
<style scoped lang="less">

</style>
吧
