<template>
  <SubPanelTemplate title="交易信息">
    <template #extra>
      <DateInlineForm :timeList="timeList" v-model:modelValue="transactionTime" @search="changeTransactionTime"></DateInlineForm>
    </template>
    <div class="transaction-info-box" @click="showIot">
      <div class="transaction-info" v-for="item in transactionInfoData" :key="item.name">
        <div class="transaction-info-title">
          <img :src="getAssetsImage('overView49.png')" alt="" />
          <span>{{ item.name }}</span>
        </div>
        <div class="transaction-info-data">
          <count-to :startVal="0" :endVal="Number(item.value)" :duration="2000" separator=""></count-to
          ><span class="unit">{{ item.unit }}</span>
        </div>
        <div class="ringRatio">
          <span>环比</span>
          <!-- uptriangle 向上三角根据Prop改变 -->
          <div :class="['downtriangle', item.chainRatio > 0 && 'uptriangle']"></div>
          <div :class="[item.chainRatio > 0 ? 'up' : 'down']">{{ item.chainRatio + "%" }}</div>
        </div>
      </div>
    </div>
  </SubPanelTemplate>
  <iouTable @close="close" :time="transactionTime.timeType" :show-modal="transactionDetails"></iouTable>
</template>

<script setup lang="ts">
import { ref } from "vue";

import iouTable from "../components/iou-table.vue";
import { porkBimStatSummary } from "@/api/slide";
import CountTo from "@/components/businessPanel/public/count-to/count-to.vue";
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import { ModelValueItf } from "@/components/businessPanel/public/types";
import { setTimeType } from "@/utils/common";
import { getAssetsImage } from "@/utils/getImage";

const transactionTime = ref<ModelValueItf>({
  timeType: "THIS_WEEK",
  dateRange: [],
});
const transactionInfoData = ref([]);
const transactionDetails = ref(false);

const timeList = [
  { label: "近7天", value: "THIS_WEEK" },
  { label: "近30天", value: "THIS_MONTH" },
  { label: "近1年", value: "THIS_YEAR" },
];

const changeTransactionTime = () => {
  transactionEvent();
};
const close = () => {
  transactionDetails.value = false;
};
const showIot = () => {
  transactionDetails.value = true;
};
// 交易信息
const transactionEvent = async () => {
  let res = await porkBimStatSummary({ type: setTimeType(transactionTime.value.timeType) });
  transactionInfoData.value = [
    {
      name: "交易金额",
      value: res.tradeAmount,
      chainRatio: res.qoqTradeAmount,
      unit: "元",
    },
    {
      name: "交易佣金",
      value: res.tradeCommission,
      chainRatio: res.qoqTradeCommission,
      unit: "元",
    },
    {
      name: "交易均价",
      value: res.tradeAverageAmount,
      chainRatio: res.qoqTradeAverageAmount,
      unit: "元",
    },
    {
      name: "实际均价",
      value: res.actualAverageAmount,
      chainRatio: res.qoqActualAverageAmount,
      unit: "元/kg",
    },
    {
      name: "交易重量",
      value: res.tradeWeight,
      chainRatio: res.qoqTradeWeight,
      unit: "kg",
    },
    {
      name: "交易片数",
      value: res.tradeSlices,
      chainRatio: res.qoqTradeSlices,
      unit: "片",
    },
  ];
};
</script>

<style scoped lang="less">
.transaction-info-box {
  display: flex;
  justify-content: space-around;
  align-items: center;
  flex-wrap: wrap;
  cursor: pointer;
  font-size: 16px;

  .transaction-info {
    margin: 10px;
    color: #fff;

    .transaction-info-title {
      font-size: 12px;

      img {
        width: 16px;
        height: 16px;
      }
    }

    .transaction-info-data {
      font-size: 22px;

      .unit {
        font-size: 12px;
      }
    }
  }
}

.ringRatio {
  display: flex;
  align-items: center;
  // justify-content: space-between;
  width: 100px;
  color: #fff;
  font-size: 16px;

  .downtriangle {
    width: 0;
    height: 0;
    border-left: 8px solid transparent;
    border-right: 8px solid transparent;
    border-bottom: 8px solid #d2fff3;
    margin-right: 3px;
    transform: rotate(180deg);
  }

  .uptriangle {
    border-bottom: 8px solid #ffcece;
    transform: rotate(0deg);
  }
}
</style>
