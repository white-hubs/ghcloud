<template>
  <SubPanelTemplate title="份额交易概览">
    <template #extra>
      <DateInlineForm v-model:modelValue="transactionTime" @search="changeTransactionTime"></DateInlineForm>
    </template>
    <div class="environment-box">
      <div class="environment-item" v-for="item in transactionList">
        <div class="environment-item-title">{{ item.label }}</div>
        <div class="environment-item-box">
          <div class="environment-item-value">{{ item.value || 0 }}</div>
          <div class="extra flex-start">
            <div class="mode">环比</div>
            <div :class="['downtriangle', item.ratio > 0 && 'uptriangle']"></div>
            <div :class="[item.ratio < 0 ? 'down' : 'up']">{{ item.ratio }}%</div>
          </div>
        </div>
      </div>
    </div>
    <div class="pie-chart">
      <pieGuidance :showLegend="false" :y-data="yData" height="80%"></pieGuidance>
    </div>
  </SubPanelTemplate>
</template>

<script setup lang="ts">
import { ref } from "vue";

import { transactionCopiesStat, transactionCopiesTypeStat } from "@/api/onecard";
import pieGuidance from "@/components/businessPanel/public/charts/pie/pie-guidance.vue";
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import { ModelValueItf } from "@/components/businessPanel/public/types";

const yData = ref([
  {
    name: "退款",
    value: 10,
    color: "#0099FF",
  },
  {
    name: "消费",
    value: 20,
    color: "#FF9900",
  },
  {
    name: "充值",
    value: 30,
    color: "#63a35c",
  },
]);
const transactionList = ref([
  {
    label: "交易份数",
    value: "100",
    ratio: 10,
  },
  {
    label: "交易笔数",
    value: "100",
    ratio: 10,
  },
  {
    label: "单笔平均份数",
    value: "100",
    ratio: 10,
  },
]);
const transactionTime = ref<ModelValueItf>();

const changeTransactionTime = async () => {
  let colorList = ["#2AE8BD", "#99C7FF", "#FFC700", "#F14545"];
  const res = await transactionCopiesStat({ type: transactionTime.value.timeType, period: transactionTime.value.dateRange.join(",") });
  transactionList.value[0].value = res.amount;
  transactionList.value[0].ratio = res.qoqAmount;
  transactionList.value[1].value = res.num;
  transactionList.value[1].ratio = res.qoqNum;
  transactionList.value[2].value = res.avgAmount;
  transactionList.value[2].ratio = res.qoqAvgAmount;
  const data = await transactionCopiesTypeStat({ type: transactionTime.value.timeType, period: transactionTime.value.dateRange.join(",") });
  yData.value = data.map((item, index) => {
    return {
      name: item.name,
      value: item.value,
      itemStyle: { color: colorList[index] },
    };
  });
};
</script>

<style lang="less" scoped>
.pie-chart {
  height: 250px;
}

.extra {
  margin-left: 16px;
  font-size: 12px;
  font-weight: 400;
  font-family: Roboto-Regular, Roboto;

  .mode {
    color: #e7f0ff;
  }

  .downtriangle {
    width: 0;
    height: 0;
    border-left: 4px solid transparent;
    border-right: 4px solid transparent;
    border-bottom: 4px solid #d2fff3;
    margin: 0 3px;
    transform: rotate(180deg);
  }

  .uptriangle {
    border-bottom: 4px solid #ffcece;
    transform: rotate(0deg);
  }

  .down {
    color: #2ae8bd;
    font-family: Roboto-Regular, Roboto;
  }

  .up {
    color: #f14545;
    font-family: Roboto-Regular, Roboto;
  }
}

.environment-box {
  display: flex;
  justify-content: space-between;
  .environment-item {
    background: rgba(142, 172, 206, 0.1);
    padding: 4px;

    .environment-item-title {
      font-size: 16px;
      color: #fff;
    }

    .environment-item-box {
      display: flex;

      .environment-item-value {
        color: #fff;
        font-size: 14px;
      }
    }
  }
}
</style>
