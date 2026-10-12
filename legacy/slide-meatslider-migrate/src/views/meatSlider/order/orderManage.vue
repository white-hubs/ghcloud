<template lang="pug">
g-table(
  title="订单管理"
  :columns="columns" 
  :search="search" 
  :btns="btns"
  tableCode="ORDER_MANAGE"
  :editMode="editMode" 
  :api="api" 
  ref="tableRef")   
  template(v-slot:btn="item")
    a-space(:size="16")
      a(@click="detail(item.record)") 详情
      a.deleteRow(@click="detele(item.record)" v-if="item.record.status === 'CANCELED'") 删除
      a(v-else disabled) 删除
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
import { ExclamationCircleOutlined } from "@ant-design/icons-vue";
import { timeFormat, millennial } from "@/utils/common";
import { orderStatus } from "@/utils/enumerate.js";
import { replaceObjectKeys } from "@pansy/utils";
import { Modal } from "ant-design-vue";
export default defineComponent({
  setup() {
    const { proxy } = getCurrentInstance();
    const router = useRouter();
    const dateFormat = "YYYY/MM/DD";
    const state = reactive({
      columnList: [
        "code",
        "supplierName",
        "supplierCode",
        "customerName",
        "customerPhone",
        "amount",
        "commission",
        "orderTime",
        "way",
        "status",
        "action",
      ],
      columns: [
        {
          mark: "code",
          dataIndex: "code",
          key: "code",
          title: "订单号",
          slots: {
            customRender: "code",
          },
          // width: 80,
          ellipsis: true,
          customRender: ({ text }) => {
            return (
              <PopOver position="topLeft" content={text ? text : ""}>
                {text ? text : "--"}
              </PopOver>
            );
          },
        }, {
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
          mark: "customerName",
          dataIndex: "customerName",
          key: "customerName",
          title: "客户名称",
          slots: {
            customRender: "customerName",
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
          mark: "customerPhone",
          dataIndex: "customerPhone",
          key: "customerPhone",
          title: "客户电话",
          slots: {
            customRender: "customerPhone",
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
          mark: "amount",
          dataIndex: "amount",
          key: "amount",
          title: "订单金额",
          slots: {
            customRender: "amount",
          },
          // width: 90,
          ellipsis: true,
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
        }, {
          mark: "commission",
          dataIndex: "commission",
          key: "commission",
          title: "订单佣金",
          slots: {
            customRender: "commission",
          },
          // width: 90,
          ellipsis: true,
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
        }, {
          mark: "orderTime",
          dataIndex: "orderTime",
          key: "orderTime",
          title: "订单时间",
          slots: {
            customRender: "orderTime",
          },
          // width: 110,
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
          mark: "way",
          dataIndex: "way",
          key: "way",
          title: "支付方式",
          slots: {
            customRender: "way",
          },
          // width: 90,
          ellipsis: true,
          customRender: ({ text }) => {
            if (text === "BALANCE") {
              text = "余额支付";
            }
            return (
              <PopOver position="topLeft" content={text}>
                {text ? text : "--"}
              </PopOver>
            );
          },
        }, {
          mark: "status",
          dataIndex: "status",
          key: "status",
          title: "订单状态",
          slots: {
            customRender: "status",
          },
          // width: 90,
          ellipsis: true,
          customRender: ({ text }) => {
            if (text === "WAITED") {
              return <g-table-dot content="待支付" status="audit" />;
            } else if (text === "FINISHED") {
              return <g-table-dot content="已支付" />;
            } else {
              return <g-table-dot content="已取消" status="audit" />;
            }
          },
        }, {
          title: "操作",
          mark: "action",
          dataIndex: "action",
          key: "action",
          slots: {
            customRender: "action",
          },
          width: 150,
          fixed: "right",
        },
      ],
      // columnList: [
      //   "code",
      //   "merchantName",
      //   "merchantCode",
      //   "customerName",
      //   "customerPhone",
      //   "amount",
      //   "commission",
      //   "orderTime",
      //   "way",
      //   "status",
      //   "action",
      // ],
      btns: [],
      api: {
        list: "getOrder",
      },
      search: [
        {
          label: "订单状态",
          value: "status",
          component: "a-select",
          defaultValue: " ",
          options: replaceObjectKeys(orderStatus, {
            name: "label",
            value: "value",
          }),
          placeholder: "请选择",
        },
        {
          label: "订单时间",
          value: "date",
          defaultDate: "period",
          component: "a-range-picker",
        },
        {
          label: "",
          value: "keyword",
          placeholder: "订单号/客户名称/客户电话",
        },
      ],
    });

    const tableRef = ref();

    onMounted(() => {
    });

    const detail = (record) => {
      const boothId = record?.id ? record.id : "";
      history.pushState({ current: location.pathname + location.search }, "", `/portal/meatSlider/orderDetails?id=${boothId}&type=detail`)
    };

    const detele = (record) => {
      Modal.confirm({
        title: "删除订单",
        icon: createVNode(ExclamationCircleOutlined),
        content: "确定删除当前订单？",
        okText: "确认",
        cancelText: "取消",
        centered: true,
        onOk: () => {
          proxy.$api
            .orderId({
              id: record.id,
            }, "delete")
            .then(() => {
              tableRef.value.getData();
            });
        },
        onCancel: () => { },
      });
    };

    return {
      ...toRefs(state),
      detail,
      detele,
      tableRef,
    };
  },
});
</script>
<style scoped lang="less"></style>
