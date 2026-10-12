<template lang="pug">
.transactionDataSummary
    .transactionDataSummary-title 交易数据汇总
    .transactionDataSummary-btn
        a-range-picker(v-model:value="pickerValue" @change="getList('CUSTOM')")
        a-button(:type="type==='TODAY'?'primary':null" @click="getList('TODAY')") 今天
        a-button(:type="type==='WEEK'?'primary':null" @click="getList('WEEK')") 近7天
        //- a-button(:type="type==='THIS_MONTH'?'primary':null" @click="getList('THIS_MONTH')") 本月
        a-button(:type="type==='MONTH'?'primary':null" @click="getList('MONTH')") 近30天
    .transactionDataSummary-content
        div
           .content-name 供货商（户）
           .content-num {{data.supplier}}
        div
           .content-name 供货重量（kg）
           .content-num {{data.supplyWeight}}
        div
           .content-name 交易重量（kg）
           .content-num {{data.tradeWeight}}
        div
           .content-name 供货片数
           .content-num {{data.supplySlices}}
        div
           .content-name 交易片数
           .content-num {{data.tradeSlices}}
        div
           .content-name 交易均价（元/kg）
           .content-num {{data.tradeAverageAmount}}
        div
           .content-name 实际均价（元/kg）
           .content-num {{data.actualAverageAmount}}
        div
           .content-name 交易金额（元）
           .content-num {{data.tradeAmount}}
        div
           .content-name 交易佣金（元）
           .content-num {{data.tradeCommission}}
</template>

<script lang="jsx">
import {
  defineComponent,
  getCurrentInstance,
  onMounted,
  reactive,
  toRefs,
} from "vue";
import { timeFormat } from "@/utils/common";

export default defineComponent({
  setup() {
    const state = reactive({
      data: {
        actualAverageAmount: "0.00",
        supplier: 0,
        supplyName: "",
        supplySlices: 0,
        supplyWeight: "0.00",
        tradeAmount: "0.00",
        tradeAverageAmount: "0.00",
        tradeCommission: "0.00",
        tradeSlices: 0,
        tradeWeight: "0.00",
      },
      type: "TODAY",
      pickerValue: null,
    });
    const { proxy } = getCurrentInstance();
    const getList = (type) => {
      state.type = type;
      let period = null;
      if (type !== "CUSTOM") {
        state.pickerValue = [];
      }
      if (state.pickerValue && state.pickerValue.length > 0) {
        period = [
          timeFormat(state.pickerValue[0], false),
          timeFormat(state.pickerValue[1], false),
        ].join(",");
      } else if (type === "CUSTOM") {
        state.type = "TODAY";
      }
      proxy.$api
        .getPorkStatSummary({ type: state.type === "CUSTOM" ? '' : state.type, period },"get" )
        .then((res) => {
          state.data = res;
        });
    };
    onMounted(() => {
      getList("TODAY");
    });
    return {
      ...toRefs(state),
      getList,
    };
  },
});
</script>

<style lang="less" scoped>
.transactionDataSummary {
  height: 184px;
  width: 100%;
  background: #ffffff;
  border-radius: 0px 0px 0px 0px;
  opacity: 1;
  margin-top: 16px;
  padding-left: 16px;
  padding-right: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  .transactionDataSummary-btn {
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    width: 100%;
    .ant-btn {
      margin-right: 10px;
    }
    .ant-calendar-picker {
      margin-right: 10px;
    }
  }
  .transactionDataSummary-title {
    height: 50px;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    width: 100%;
    font-size: 16px;
    font-family: PingFang SC-Regular, PingFang SC;
    font-weight: 550;
    color: #000000;
    border-bottom: 1px solid #f3f3f3;
  }
  .transactionDataSummary-content {
    flex: 1;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    > div {
      flex: 1;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-direction: column;
      position: relative;
      &:last-child {
        &::before {
          border: none;
        }
      }
      &::before {
        content: "";
        position: absolute;
        top: 50%;
        right: 0;
        width: 1px;
        height: 35px;
        transform: translate(0, -50%);
        border-right: 1px dashed rgba(0, 0, 0, 0.2);
      }
      .content-name {
        font-size: 14px;
        font-family: PingFang SC-Regular;
        font-weight: 400;
        color: #595959;
      }
      .content-num {
        font-size: 24px;
        font-family: Roboto-Regular, Roboto;
        font-weight: 400;
        color: #000000;
      }
    }
  }
}
</style>
