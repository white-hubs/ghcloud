<template lang="pug">
g-table(
  title="检疫票登记"
  :columns="columns" 
  :search="search" 
  :btns="btns"
  tableCode="QUARANTINE_ORDER"
  :editMode="editMode" 
  :api="api" 
  :scrollX="850"
  ref="tableRef")
  template(v-slot:btn="item")
    a(@click="order(item.record)") 登记检疫票
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
import { timeFormat, millennial, getFreshLabel } from "@/utils/common";
import { useRouter } from "vue-router";
export default defineComponent({
  setup() {
    const { proxy } = getCurrentInstance();
    const router = useRouter();
    const state = reactive({
      columnList: [
        "supplierName",
        "supplierCode",
        "goodsCategoryName",
        "porkReportCode",
        "porkReportSlices",
        "porkReportTickets",
        "action",
      ],
      // columnList: [
      //   "merchantName",
      //   "merchantCode",
      //   "goodsCategoryName",
      //   "porkReportCode",
      //   "porkReportSlices",
      //   "porkReportTickets",
      //   "action",
      // ],
      columns: [
        {
          mark: "supplierName",
          dataIndex: "supplierName",
          key: "supplierName",
          title: "商家名称",
          slots: {
            customRender: "supplierName",
          },
          // width: 90,
          ellipsis: true,
          customRender: ({ text, record }) => {
            if (record.riskLevel === "MEDIUM") {
              return (
                <PopOver position="topLeft" content={text ? text : "--"}>
                  <a-tag color="orange">中风险</a-tag>
                  {text ? text : "--"}
                </PopOver>
              );
            } else if (record.riskLevel === "HIGH") {
              return (
                <PopOver position="topLeft" content={text ? text : "--"}>
                  <a-tag color="red">高风险</a-tag>
                  {text ? text : "--"}
                </PopOver>
              );
            } else {
              return (
                <PopOver position="topLeft" content={text ? text : "--"}>
                  <a-tag color="green">低风险</a-tag>
                  {text ? text : "--"}
                </PopOver>
              );
            }
          },
        }, {
          mark: "supplierCode",
          dataIndex: "supplierCode",
          key: "supplierCode",
          title: "商家编号",
          slots: {
            customRender: "supplierCode",
          },
          // width: 90,
          ellipsis: true,
          customRender: ({ text }) => {
            return (
              <PopOver position="topLeft" content={text}>
                {text ? text : "--"}
              </PopOver>
            );
          },
        },
        {
          mark: "goodsCategoryName",
          dataIndex: "merchantVO.phone",
          key: "merchantVO.phone",
          title: "商品名称",
          slots: {
            customRender: "goodsCategoryName",
          },
          // width: 90,
          ellipsis: true,
          customRender: ({ text, record }) => {
            return (
              <PopOver position="topLeft" content={record.goodsCategoryName ? record.goodsCategoryName : "--"}>
                {record.goodsCategoryName ? record.goodsCategoryName : "--"}
                <span style="margin-left:5px;" class={record.freshLabel ? getFreshLabel(record.freshLabel).color : "" }>{record.freshLabel ? getFreshLabel(record.freshLabel).name : ""}</span>
              </PopOver>
            );
          },
        },
        {
          mark: "porkReportCode",
          dataIndex: "porkReportCode",
          key: "porkReportCode",
          title: "批次号",
          slots: {
            customRender: "porkReportCode",
          },
          // width: 80,
          ellipsis: true,
          customRender: ({ text }) => {
            return (
              <PopOver position="topLeft" content={text}>
                {text ? text : "--"}
              </PopOver>
            );
          },
        },
        {
          mark: "porkReportSlices",
          dataIndex: "porkReportSlices",
          key: "porkReportSlices",
          title: "报备片数（片）",
          slots: {
            customRender: "porkReportSlices",
          },
          width: 150,
          ellipsis: true,
          customRender: ({ text }) => {
            return (
              <PopOver
                position="topLeft"
                content={text ? `${millennial(text, false)}` : ""}
              >
                {text || text === 0 ? `${millennial(text, false)}` : "--"}
              </PopOver>
            );
          },
        },
        {
          mark: "porkReportTickets",
          dataIndex: "porkReportTickets",
          key: "porkReportTickets",
          title: "报备检疫票数（张）",
          slots: {
            customRender: "porkReportTickets",
          },
          width: 160,
          ellipsis: true,
          customRender: ({ text }) => {
            return (
              <PopOver
                position="topLeft"
                content={millennial(Math.ceil(text / 2), false)}
              >
                {" "}
                {millennial(Math.ceil(text / 2), false)}
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
          width:140,
          fixed: "right",
        }
      ],
      api: {
        list: "getPratiqueRegister",
      },
      search: [
        {
          label: "",
          value: "keyword",
          placeholder: "商家名称/商家编号/批次号",
        },
        {
          label: "",
          value: "status",
          defaultValue: "false",
          component: "span",
        },
      ],
      btns: [],
    });

    onMounted(() => {
    });

    const order = (record) => {
      const boothId = record?.id ? record.id : "";
      history.pushState({ current: location.pathname + location.search }, "", `/portal/meatSlider/quarantineRegister?id=${boothId}&type=edit`)
    };

    return {
      ...toRefs(state),
      order,
    };
  },
});
</script>
<style scoped lang="less">
//:deep(.ant-badge) {
// height: 22px;
// line-height: 22px;
// position: absolute;
// top: -15px;
//  left: -5px;
//}
</style>
