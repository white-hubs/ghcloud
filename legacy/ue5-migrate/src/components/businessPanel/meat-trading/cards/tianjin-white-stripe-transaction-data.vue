<template>
  <SubPanelTemplate title="白条交易数据">
    <template #extra>
      <DateInlineForm :timeList="timeList" v-model:modelValue="transactionTime" @search="changeTransactionTime"></DateInlineForm>
    </template>
    <div class="transaction-list" v-for="item in transactionData" :key="item.name">
      <div class="transaction-column">
        <span class="transaction-column-drop"></span>
        <span class="transaction-column-name">{{ item.name }}</span>
      </div>
      <div class="transaction-box">
        <div class="transaction-info" v-for="data in item.transactionInfoData" :key="item.name" @click="showIot(data)">
          <div class="transaction-info-title">
            <span>{{ data.name }}</span>
          </div>
          <div class="transaction-info-data">
            <count-to :startVal="0" :endVal="data.value || 0" :duration="2000" separator=""></count-to
            ><span class="unit">{{ data.unit }}</span>
          </div>
          <div class="ringRatio">
            <span>环比</span>
            <!-- uptriangle 向上三角根据Prop改变 -->
            <div :class="['downtriangle', Number(data.chainRatio || 0) > 0 && 'uptriangle']"></div>
            <div :class="[Number(data.chainRatio || 0) > 0 ? 'up' : 'down']">
              {{ Number(data.chainRatio || 0).toFixed(2) + "%" }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </SubPanelTemplate>
  <modalIouTable
    @close="close"
    :time="transactionTime.timeType"
    :type-name="transactionTitle"
    :unit="transactionUnit"
    :show-modal="transactionDetails"
  >
  </modalIouTable>
</template>

<script setup lang="ts">
import { ref } from "vue";

import modalIouTable from "../components/modal-iou-table.vue";
import { porkBimStatSummary, porkBimStatSupplyData } from "@/api/slide-tianjin";
import CountTo from "@/components/businessPanel/public/count-to/count-to.vue";
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import { ModelValueItf } from "@/components/businessPanel/public/types";
import { setTimeType } from "@/utils/common";

const transactionData = ref<any>();
const transactionTime = ref<ModelValueItf>({
  timeType: "THIS_WEEK",
  dateRange: [],
});

const timeList = [
  { label: "今日", value: "TODAY" },
  { label: "近7天", value: "THIS_WEEK" },
  { label: "近30天", value: "THIS_MONTH" },
  { label: "近1年", value: "THIS_YEAR" },
];

const changeTransactionTime = async () => {
  let data = await porkBimStatSummary({ type: setTimeType(transactionTime.value.timeType) });
  let summarydata = await porkBimStatSupplyData({ type: setTimeType(transactionTime.value.timeType) });
  transactionData.value = [
    {
      name: "交易量",
      transactionInfoData: [
        {
          name: "交易片数",
          value: data.tradeSlices,
          chainRatio: data.qoqTradeSlices,
          unit: "片",
        },
        {
          name: "交易重量",
          value: data.tradeWeight,
          chainRatio: data.qoqTradeWeight,
          unit: "kg",
        },
      ],
    },
    {
      name: "交易均价",
      transactionInfoData: [
        {
          name: "交易均价",
          value: data.tradeAverageAmount,
          chainRatio: data.qoqTradeAverageAmount,
          unit: "元/kg",
        },
        {
          name: "实际均价",
          value: data.actualAverageAmount,
          chainRatio: data.qoqActualAverageAmount,
          unit: "元/kg",
        },
      ],
    },
    {
      name: "交易金额",
      transactionInfoData: [
        {
          name: "交易金额",
          value: data.tradeAmount,
          chainRatio: data.qoqTradeAmount,
          unit: "元",
        },
        {
          name: "交易佣金",
          value: data.tradeCommission,
          chainRatio: data.qoqTradeCommission,
          unit: "元",
        },
      ],
    },
    {
      name: "供货量",
      transactionInfoData: [
        {
          name: "供货片数",
          value: summarydata.supplySlices,
          chainRatio: summarydata.qoqSupplySlices,
          unit: "片",
        },
        {
          name: "供货重量",
          value: Number(summarydata.supplyWeight),
          chainRatio: summarydata.qoqSupplyWeight,
          unit: "kg",
        },
      ],
    },
  ];
};

const transactionTitle = ref("");
const transactionUnit = ref("");
const transactionDetails = ref(false);

const close = () => {
  transactionDetails.value = false;
};
const showIot = (item) => {
  if (["供货片数", "供货重量"].includes(item.name)) {
    return;
  }
  transactionTitle.value = item.name;
  transactionUnit.value = item.unit;
  transactionDetails.value = true;
};
</script>

<style scoped lang="less">
.transaction-box {
  margin-top: 10px;
  display: flex;
  justify-content: space-around;
  align-items: center;

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
  color: #fff;

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

.transaction-list {
  margin-bottom: 20px;

  .transaction-column {
    display: flex;
    align-items: center;
    font-size: 14px;
    width: 340px;
    height: 24px;
    background: rgba(41, 137, 255, 0.2);
    padding-left: 8px;
    color: #fff;

    .transaction-column-drop {
      width: 4px;
      height: 4px;
      background: #ffab10;
      border-radius: 50%;
      margin-right: 8px;
    }
  }
}

.transaction-list,
.supply-material-box {
  font-size: 14px;
}
</style>
