<template lang="pug">
g-layout(title="通知设置")
  template(#content-table)
    .detail-form
      .item-title 订单通知
      a-tabs(v-model:activeKey="activeKey")
        a-tab-pane.pt2(v-for="item,index in panelList" :key="item.key" :tab="item.tab")
          template(v-for="ele,idx in model[item.key]")
            satMsgConfigCheckBox(:model="ele" :ref="el=> setRef(el,index,idx)" @changeItem="(e) => ele.enabled = e.length ? true : false" :noticeMethod="ele.noticeMethod")
  template(#footer-page)
    a-button(type="primary" @click="submit" :loading="loading") 保存
</template>
  <script>
  import {
    defineComponent,
    getCurrentInstance,
    reactive,
    toRefs,
    ref,
    onMounted,
  } from "vue";
  import { useRouter, useRoute } from "vue-router";
  import satMsgConfigCheckBox from "./satMsgConfigCheckBox.vue";
  import _ from "lodash";
  export default defineComponent({
    components: {
      satMsgConfigCheckBox,
    },
    setup() {
      const { proxy, ctx } = getCurrentInstance();
      const router = useRouter();
      const route = useRoute();
  
      const satMsgConfigCheckBox = ref();
  
      const state = reactive({
        model: {
          // id: "",
        },
        method: "",
        activeKey: "MEATTRADE_ORDER_REMIND",
        panelList: [
          { key: "MEATTRADE_ORDER_REMIND", tab: "订单完成后1小时" },
          {
            key: "MEATTRADE_SUPPLIER_ORDER_CANCEL",
            tab: "卖家取消订单",
          },
          // {
          //   key: "MEATTRADE_CUSTOMER_ORDER_CANCEL",
          //   tab: "买家取消订单",
          // },
          {
            key: "MEATTRADE_ORDER_PAYMENT_SUCCESS",
            tab: "订单支付完成",
          },
          {
            key: "MEATTRADE_ORDER_SETTLEMENT_SUCCESS",
            tab: "市场结算完成",
          },
        ],
        loading: false,
      });
  
      const form = ref();
  
      let itemForm = ref([]);
      // let itemForm = ref({});
  
      const setRef = (el, index, idx) => {
        if (index === 0) {
          itemForm.value[idx] = el;
        } else {
          const num = Math.pow(2, index);
          itemForm.value[num + idx] = el;
        }
      };
  
      const getData = async () => {
        state.activeKey = "MEATTRADE_ORDER_REMIND";
        const result = await proxy.$api.batchSatMsgConfigList({
          codes:
            "MEATTRADE_ORDER_REMIND,MEATTRADE_SUPPLIER_ORDER_CANCEL,MEATTRADE_CUSTOMER_ORDER_CANCEL,MEATTRADE_ORDER_PAYMENT_SUCCESS,MEATTRADE_ORDER_SETTLEMENT_SUCCESS",
        },"get");
        if (!result.length) {
          state.method = "post";
          for (let i of state.panelList) {
            let msgContent, saleMsg, buyMsg;
            // 卖家取消
            if (i.key === "MEATTRADE_SUPPLIER_ORDER_CANCEL") {
              saleMsg =
                await "尊敬的${supplierName}，订单：${orderCode}在${date}已被取消";
              buyMsg =
                await "尊敬的${customerName}，您的订单：${orderCode}在${date}已被商家取消";
              state.model[i.key] = [
                {
                  satMsgDefineCode: i.key, //消息编号--待审核/已通过/不通过
                  effectiveDays: 30, //有效天数
                  name: "通知市场买家", // 通知方选项名称
                  notifyExpression: "CUSTOMER:",
                  enabled: false, //选中状态
                  channelParams: [], //通知方式
                  satMsgChannelConfigModifyParams: [], //通知方式
                  msgTmpContent: buyMsg, //模板内容
                  noticeMethod: [
                    {
                      value: "CHANNEL_SITE",
                      label: "采购商小程序",
                      terminal: "asc-meat-purchaser-mp",
                    },
                    { value: "CHANNEL_SMS", label: "短信", terminal: "" },
                  ],
                },
                {
                  satMsgDefineCode: i.key, //消息编号--待审核/已通过/不通过
                  effectiveDays: 30, //有效天数
                  name: "通知市场卖家", // 通知方选项名称
                  notifyExpression: "SALER:",
                  enabled: false, //选中状态
                  channelParams: [], //通知方式
                  satMsgChannelConfigModifyParams: [], //通知方式
                  msgTmpContent: saleMsg, //模板内容
                  noticeMethod: [
                    {
                      value: "CHANNEL_SITE",
                      label: "商家小程序",
                      terminal: "asc-supplier-mp",
                    },
                    { value: "CHANNEL_SMS", label: "短信", terminal: "" },
                  ],
                },
              ];
            }
            // 买家取消
            else if (i.key === "MEATTRADE_CUSTOMER_ORDER_CANCEL") {
              saleMsg =
                await "尊敬的${supplierName}，订单：${orderCode}在${date}已被取消";
              buyMsg =
                await "尊敬的${customerName}，您的订单：${orderCode}在${date}已被取消";
              state.model[i.key] = [
                {
                  satMsgDefineCode: i.key, //消息编号--待审核/已通过/不通过
                  effectiveDays: 30, //有效天数
                  name: "通知市场买家", // 通知方选项名称
                  notifyExpression: "CUSTOMER:",
                  enabled: false, //选中状态
                  channelParams: [], //通知方式
                  satMsgChannelConfigModifyParams: [], //通知方式
                  msgTmpContent: buyMsg, //模板内容
                  noticeMethod: [
                    {
                      value: "CHANNEL_SITE",
                      label: "采购商小程序",
                      terminal: "asc-meat-purchaser-mp",
                    },
                    { value: "CHANNEL_SMS", label: "短信", terminal: "" },
                  ],
                },
                {
                  satMsgDefineCode: i.key, //消息编号--待审核/已通过/不通过
                  effectiveDays: 30, //有效天数
                  name: "通知市场卖家", // 通知方选项名称
                  notifyExpression: "SALER:",
                  enabled: false, //选中状态
                  channelParams: [], //通知方式
                  satMsgChannelConfigModifyParams: [], //通知方式
                  msgTmpContent: saleMsg, //模板内容
                  noticeMethod: [
                    {
                      value: "CHANNEL_SITE",
                      label: "商家小程序",
                      terminal: "asc-supplier-mp",
                    },
                    { value: "CHANNEL_SMS", label: "短信", terminal: "" },
                  ],
                },
              ];
            }
            // 支付成功
            else if (i.key === "MEATTRADE_ORDER_PAYMENT_SUCCESS") {
              buyMsg = await "尊敬的${customerName}，您在${date}，成功支付${amount}元，当前余额为${balance}元!";
              state.model[i.key] = [
                {
                  satMsgDefineCode: i.key, //消息编号--待审核/已通过/不通过
                  effectiveDays: 30, //有效天数
                  name: "通知市场买家", // 通知方选项名称
                  notifyExpression: "CUSTOMER:",
                  enabled: false, //选中状态
                  channelParams: [], //通知方式
                  satMsgChannelConfigModifyParams: [], //通知方式
                  msgTmpContent: buyMsg, //模板内容
                  noticeMethod: [
                    {
                      value: "CHANNEL_SITE",
                      label: "采购商小程序",
                      terminal: "asc-meat-purchaser-mp",
                    },
                    { value: "CHANNEL_SMS", label: "短信", terminal: "" },
                  ],
                },
              ];
            } else {
              if (i.key === "MEATTRADE_ORDER_REMIND") {
                msgContent =
                  await "尊敬的${supplierName}，订单：${orderCode}还未完成付款，请及时通知买家完成支付!";
              } else {
                msgContent =
                  await "尊敬的${supplierName}，订单：${orderCode}已完成结算，订单金额：${amount}元，市场佣金：${commission}元!";
              }
              state.model[i.key] = [
                {
                  satMsgDefineCode: i.key, //消息编号--待审核/已通过/不通过
                  effectiveDays: 30, //有效天数
                  name: "通知市场卖家", // 通知方选项名称
                  notifyExpression: "MERCHANT:",
                  enabled: false, //选中状态
                  channelParams: [], //通知方式
                  satMsgChannelConfigModifyParams: [], //通知方式
                  msgTmpContent: msgContent, //模板内容
                  noticeMethod: [
                    {
                      value: "CHANNEL_SITE",
                      label: "商家小程序",
                      terminal: "asc-supplier-mp",
                    },
                    { value: "CHANNEL_SMS", label: "短信", terminal: "" },
                  ],
                },
              ];
            }
          }
        } else {
          state.method = "put";
          const data = _.groupBy(result, "satMsgDefineCode");
          for (let i in data) {
            for (let j of data[i]) {
                Object.assign(j, {
                  name:
                    j.notifyExpression === "MERCHANT:" ? "通知市场卖家" : j.notifyExpression === "CUSTOMER:" ? "通知市场买家" : "通知市场卖家",
                channelParams: j.satMsgChannelConfigVOS.map((item) => {
                    return `${item.terminal}&${item.channelType}`;
                  }),
                  satMsgChannelConfigModifyParams: [],
                  noticeMethod: [
                    {
                      value: "CHANNEL_SITE",
                      label: j.notifyExpression === "MERCHANT:" ? "商家小程序" : j.notifyExpression === "CUSTOMER:" ? "采购商小程序" : "商家小程序",
                      terminal: j.notifyExpression === "MERCHANT:" ? "asc-supplier-mp" : j.notifyExpression === "CUSTOMER:" ? "asc-meat-purchaser-mp" : "asc-supplier-mp",
                    },
                    { value: "CHANNEL_SMS", label: "短信", terminal: "" },
                  ],
                });
            }
          }
          // 卖家取消订单，隐藏买家的选项
          data['MEATTRADE_ORDER_PAYMENT_SUCCESS'].forEach((item, index) => {
            if (item.notifyExpression === 'MERCHANT:') {
              data['MEATTRADE_ORDER_PAYMENT_SUCCESS'].splice(index, 1)
            }
          })
          state.model = data;
        }
      };
  
      const submit = async () => {
        state.loading = true;
        const data = await _.flattenDepth(_.values(state.model));
        for (let i of data) {
          if (i.channelParams.length) {
            for (let j of i.channelParams) {
              if (j) {
                const res = _.zipObject(
                  ["terminal", "channelType"],
                  j.split("&")
                );
                i.satMsgChannelConfigModifyParams.push(res);
              }
            }
          }
        }
        await proxy.$api.satMsgConfig({
          params: data,
        },state.method);
        proxy.$message.success("操作成功");
        await getData();
        state.loading = false;
      };
  
      onMounted(() => {
        getData();
      });
  
      return {
        form,
        setRef,
        itemForm,
        satMsgConfigCheckBox,
        ...toRefs(state),
        submit,
      };
    },
  });
  </script>
  <style lang="less" scoped>
  @import url("@/styles/gComponents/gDetailform.less");
  .detail-form {
    width: 100%;
    height: 100%;
    overflow-y: auto;
    :deep(.ant-tabs-line) {
      height: calc(100% - 45px);
      .ant-tabs-top-content {
        height: calc(100% - 45px);
        .ant-tabs-tabpane-active {
          height: 100%;
          overflow-y: auto;
        }
      }
    }
  }
  :deep(.ant-form) {
    width: 100%;
    text-align: left;
  }
  </style>
  