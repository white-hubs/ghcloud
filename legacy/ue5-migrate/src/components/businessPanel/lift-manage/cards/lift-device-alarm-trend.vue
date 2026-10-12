<template>
  <SubPanelTemplate title="设备报警趋势">
    <template #extra>
      <DateInlineForm v-model:modelValue="topTimeFrame" @search="getAlarmsNumber"></DateInlineForm>
    </template>
    <div class="body">
      <OperateDays title="报警数" :value="alarmCon.count" class="body-num">
        <div class="extra flex-start">
          <div class="mode">环比</div>
          <div :class="['downtriangle', alarmCon.ratio > 0 && 'uptriangle']"></div>
          <div :class="[alarmCon.ratio < 0 ? 'down' : 'up']">{{ alarmCon.ratio }}%</div>
        </div>
      </OperateDays>
      <div class="chart">
        <LineChart
          :x-data="xData"
          :series="[
            {
              data: yData,
              linearGradientColor: ['rgb(86, 142, 255)', 'rgb(86, 142, 255,0)'],
            },
          ]"
        />
      </div>
    </div>
  </SubPanelTemplate>
</template>

<script setup lang="ts">
import { ref } from "vue";

import { statisticsStatus, statisticsTrend } from "@/api/alarm";
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
import LineChart from "@/components/businessPanel/public/lineChart.vue";
import OperateDays from "@/components/businessPanel/public/operateDays.vue";
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import { ModelValueItf } from "@/components/businessPanel/public/types";
import { useStateStore } from "@/pages/state/use-state-store";

const { globalState } = useStateStore();
const topTimeFrame = ref<ModelValueItf>({
  timeType: "TODAY",
  dateRange: [],
});
const xData = ref<string[]>([]);
const yData = ref<number[]>([]);
const alarmCon = ref({
  count: 0,
  ratio: 0,
});

// 报警状态统计&报警趋势折线图统计
async function getAlarmsNumber() {
  let params = {
    sceneType: globalState.business.currentMenu,
    areaId: globalState.business.currentAreaId,
    period: topTimeFrame.value.dateRange.join(","),
    type: topTimeFrame.value.timeType,
  };
  xData.value.length = 0;
  yData.value.length = 0;
  let Status = await statisticsStatus(params);
  let Trend = await statisticsTrend(params);
  alarmCon.value = {
    count: Status.alarmNum,
    ratio: Status.chainRatio,
  };
  Trend.forEach((item: any) => {
    let time = "";
    if (params.type === "TODAY") {
      time = "时";
    } else if (params.type === "THIS_YEAR") {
      time = "月";
    } else {
      time = "号";
    }
    xData.value.push(item.period + time);
    yData.value.push(item.alarmNum);
  });
}
</script>

<style lang="less" scoped>
.chart {
  height: 300px;
}
.downtriangle {
  width: 0;
  height: 0;
  border-left: 5px solid transparent;
  border-right: 5px solid transparent;
  border-top: 6px solid #2ae8bd;
  margin: 0 5px;
}
.uptriangle {
  border-top: none;
  border-bottom: 6px solid #f14545;
}
.down {
  color: #2ae8bd;
}
.up {
  color: #f14545;
}
.extra {
  display: flex;
  align-items: center;
  font-size: 14px;
  color: #fff;
  .mode {
    margin-right: 5px;
  }
}
</style>
