<template lang="pug">
g-table(
  title="食安溯源"
  :columns="columns" 
  :search="search" 
  :btns="btns" 
  :editMode="editMode" 
  :api="api"
  tableCode="GOODS_TRACEABILITY"
  ref="tableRef")   
  template(v-slot:btn="item")
    a(@click="detail(item.record)") 详情
</template>
<script lang="jsx">
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
import { getFreshLabel } from "@/utils/common";
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
        "label",
        "footMarkCode",
        "action",
      ],
      // columnList: [
      //   "merchantName",
      //   "merchantCode",
      //   "goodsCategoryName",
      //   "porkReportCode",
      //   "label",
      //   "footMarkCode",
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
          customRender: ({ text }) => {
            return (
              <PopOver position="topLeft" content={text}>
                {text ? text : "--"}
              </PopOver>
            );
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
        }, {
          mark: "goodsCategoryName",
          dataIndex: "goodsCategoryName",
          key: "goodsCategoryName",
          title: "商品名称",
          slots: {
            customRender: "goodsCategoryName",
          },
          // width: 90,
          customRender: ({ text,record }) => {
            return (
              <PopOver position="topLeft" content={record.goodsCategoryName ? record.goodsCategoryName : "--"}>
                {record.goodsCategoryName ? record.goodsCategoryName : "--"}
                <span style="margin-left:5px;" class={record.freshLabel ? getFreshLabel(record.freshLabel).color : "" }>{record.freshLabel ? getFreshLabel(record.freshLabel).name : ""}</span>
              </PopOver>
            );
          },
        }, {
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
        }, {
          mark: "label",
          dataIndex: "label",
          key: "label",
          title: "商品编码",
          slots: {
            customRender: "label",
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
        }, {
          mark: "footMarkCode",
          dataIndex: "footMarkCode",
          key: "footMarkCode",
          title: "理货编码",
          slots: {
            customRender: "footMarkCode",
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
        }, {
          title: "操作",
          mark: "action",
          dataIndex: "action",
          key: "action",
          slots: {
            customRender: "action",
          },
          width: 100,
          fixed: "right",
        }
      ],
      api: {
        list: "resource",
      },
      search: [
        {
          label: "",
          value: "keyword",
          placeholder: "商家名称/商家编号/批次号/商品编码/理货编码",
        },
      ],
      btns: [],
      editMode: "page",
    });

    onMounted(() => {
    });

    const detail = (record) => {
      const boothId = record?.id ? record.id : "";
      history.pushState({ current: location.pathname + location.search }, "", `/portal/meatSlider/goodsTraceabilityDetails?id=${boothId}&type=detail`)
    };

    return {
      ...toRefs(state),
      detail,
    };
  },
});
</script>
<style scoped lang="less">
:deep(.ant-table.ant-table-bordered) {
  .ant-table-title .ant-form-item-control-input {
    width: 340px;
  }
}
</style>
