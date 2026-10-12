<template lang="pug">
g-detail(
  title="订单详情"
  :api="api"
  :formList="formList"
)
  template(v-slot:edit-item="item")
    .item-title 商品信息
    a-table(
      :data-source="tableData" 
      :columns="columns" 
      :rowKey="(record)=> record.id" 
      :scroll="{y: 300}" 
      size="middle"
      :pagination="pagination")  
</template>
<script lang="jsx">
import {
  defineComponent,
  reactive,
  getCurrentInstance,
  toRefs,
  onMounted,
} from "vue";
import { useRoute, useRouter } from "vue-router";
import { timeFormat, millennial, getFreshLabel } from "@/utils/common";
export default defineComponent({
  setup() {
    const { proxy } = getCurrentInstance();
    const route = useRoute();
    const router = useRouter();
    const formState = reactive({
      api: {
        detail: "orderId",
      },
      formList: [
        {
          title: "单据信息",
          form: [
            { label: "订单号", value: "code" },
            // { label: "商家名称", value: "merchantName" },
            // { label: "商家编号", value: "merchantCode" },
            { label: "商家名称", value: "supplierName" },
            { label: "商家编号", value: "supplierCode" },
            { label: "客户名称", value: "customerName" },
            { label: "客户电话", value: "customerPhone" },
            {label: "商品名称", value: "goodsCategoryName" ,
              html: true,
              detailFun: (value, form) => {
                return `<span style="margin-left:5px;"> ${form.goodsCategoryName ? form.goodsCategoryName : "--"} </span><span class="${
                  form.freshLabel
                    ? getFreshLabel(form.freshLabel).color
                    : ""
                }">${
                  form.freshLabel
                    ? getFreshLabel(form.freshLabel).name
                    : ""
                }</span>`;
              },
            },
            { label: "交易片数", value: "totalSlices", unit: "片" },
            { label: "交易重量", value: "weight", unit: "kg" },
            { label: "损耗重量", value: "loss", unit: "kg" },
            {
              label: "订单时间",
              value: "orderTime",
              detailFun: (value) => {
                if (value) {
                  return timeFormat(value, true);
                }
                return "--";
              },
            },
            { label: "订单金额", value: "amount", unit: "元" },
            { label: "订单佣金", value: "commission", unit: "元" },
            {
              label: "支付方式",
              value: "way",
              detailFun: (value) => {
                if (value === "BALANCE") {
                  return "账号余额支付";
                } else if (value === "PAY") {
                  return "支付宝支付";
                } else {
                  return "--";
                }
              },
            },
            {
              label: "订单状态",
              value: "status",
              detailFun: (value) => {
                if (value) {
                  if (value === "FINISHED") {
                    return "已完成";
                  } else if (value === "WAITED") {
                    return "待支付";
                  } else {
                    return "已取消";
                  }
                }
              },
            },
          ],
        },
      ],
      tableData: [],
      columns: [
        {
          dataIndex: "sort",
          key: "sort",
          title: "序号",
          slots: {
            customRender: "sort",
          },
          width: 80,
          ellipsis: true,
          customRender: ({ index }) => {
            return (
              <PopOver position="topLeft" content={index + 1 ? index + 1 : ""}>
                {index + 1 ? index + 1 : "--"}
              </PopOver>
            );
          },
        },
        {
          dataIndex: "porkReportCode",
          key: "porkReportCode",
          title: "批次号",
          slots: {
            customRender: "porkReportCode",
          },
          width: 150,
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
          dataIndex: "goodsCategoryName",
          key: "goodsCategoryName",
          title: "商品名称",
          slots: {
            customRender: "goodsCategoryName",
          },
          customRender: ({ text, record }) => {
            return (
              <PopOver position="topLeft" content={record.goodsCategoryName ? record.goodsCategoryName : "--"}>
                {record.goodsCategoryName ? record.goodsCategoryName : "--"}
                <span style="margin-left:5px;" class={record.freshLabel ? getFreshLabel(record.freshLabel).color : "" }>{record.freshLabel ? getFreshLabel(record.freshLabel).name : ""}</span>
              </PopOver>
            );
          },
          ellipsis: true,
        },
        {
          dataIndex: "label",
          key: "label",
          title: "商品编码",
          slots: {
            customRender: "label",
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
          dataIndex: "footMarkCode",
          key: "footMarkCode",
          title: "理货编码",
          slots: {
            customRender: "footMarkCode",
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
          dataIndex: "weight",
          key: "weight",
          title: "重量(kg)",
          slots: {
            customRender: "weight",
          },
          ellipsis: true,
          customRender: ({ text }) => {
            if (text || text === 0) {
              return (
                <PopOver position="topLeft" content={millennial(text)}>
                  {millennial(text)}
                </PopOver>
              );
            } else {
              return "--";
            }
          },
        },
        {
          dataIndex: "loss",
          key: "loss",
          title: "损耗(kg)",
          slots: {
            customRender: "loss",
          },
          ellipsis: true,
          customRender: ({ text }) => {
            if (text || text === 0) {
              return (
                <PopOver position="topLeft" content={millennial(text)}>
                  {millennial(text)}
                </PopOver>
              );
            } else {
              return "--";
            }
          },
        },
        {
          dataIndex: "unitPrice",
          key: "unitPrice",
          title: "交易单价",
          slots: {
            customRender: "unitPrice",
          },
          customRender: ({ text }) => {
            return (
              <PopOver position="topLeft" content={"￥" + millennial(text)}>
                {"￥" + millennial(text)}
              </PopOver>
            );
          },
          ellipsis: true,
        },
        {
          dataIndex: "price",
          key: "price",
          title: "交易总价",
          slots: {
            customRender: "price",
          },
          customRender: ({ text }) => {
            if (text) {
              return (
                <PopOver position="topLeft" content={"￥" + millennial(text)}>
                  {"￥" + millennial(text)}
                </PopOver>
              );
            } else {
              return "--";
            }
          },
          ellipsis: true,
        },
        {
          dataIndex: "commission",
          key: "commission",
          title: "交易佣金",
          slots: {
            customRender: "commission",
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
          ellipsis: true,
        },
      ],
      spinning: false,
      pagination: null,
    });

    formState.pagination = {
      pageSize: 10,
      // showSizeChanger: false,
      // simple: true,
    };

    // 有id
    const id = route.query.id;
    // if (id) {
    //   formState.spinning = true;
    //   proxy.$api
    //     .orderProduct({ id: id },`get` )
    //     .then((res) => {
    //       if (res.way === "BALANCE") {
    //         res.way = "余额支付";
    //       }
    //       formState.data = res;
    //     })
    //     .finally(() => {
    //       formState.spinning = false;
    //     });
    // }

    const getProduct = async () => {
      const data = await proxy.$api.orderProduct({ id: id },`get`);
      formState.tableData = data;
    };

    const cancel = () => {
      router.back(-1);
    };

    onMounted(() => {
      if (id) {
        getProduct();
      }
    });

    return {
      labelCol: {
        span: 4,
      },
      wrapperCol: {
        span: 14,
      },
      ...toRefs(formState),
      cancel,
      timeFormat,
      millennial,
    };
  },
});
</script>
<style lang="less" scoped>
@import url("@/styles/gComponents/gDetailform.less");
.pl2 {
  width: 100%;
}
</style>
