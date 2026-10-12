<template>
  <SubPanelTemplate title="设备报警趋势" zoomable zoom-title="设备报警趋势">
    <template #extra>
      <DateInlineForm v-model:modelValue="hiddenDangerTime" @search="alarmTrendInfo" data-no-zoom></DateInlineForm>
    </template>
    <div class="body-bum" data-no-zoom>
      <AiAnalysisPopover :content="aiAnalysisContent">
        <OperateDays title="报警数" :value="alarmCon.count">
          <div class="extra flex-start">
            <div class="mode">环比</div>
            <div :class="['downtriangle', alarmCon.ratio > 0 && 'uptriangle']"></div>
            <div :class="[alarmCon.ratio < 0 ? 'down' : 'up']">{{ alarmCon.ratio }}%</div>
          </div>
        </OperateDays>
      </AiAnalysisPopover>
    </div>
    <GridContainer :data="alarmStatusData" data-no-zoom></GridContainer>
    <div class="chart" data-no-zoom>
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
    <template #zoom-content>
      <div class="zoom-trend-content">
        <div class="zoom-body-bum" data-no-zoom>
          <AiAnalysisPopover :content="aiAnalysisContent">
            <OperateDays title="报警数" :value="alarmCon.count" class="zoom-operate-days">
              <div class="extra flex-start">
                <div class="mode">环比</div>
                <div :class="['downtriangle', alarmCon.ratio > 0 && 'uptriangle']"></div>
                <div :class="[alarmCon.ratio < 0 ? 'down' : 'up']">{{ alarmCon.ratio }}%</div>
              </div>
            </OperateDays>
          </AiAnalysisPopover>
        </div>
        <GridContainer :data="alarmStatusData" class="zoom-grid-container" data-no-zoom></GridContainer>
        <div class="zoom-chart" data-no-zoom>
          <LineChart
            :x-data="xData"
            :series="[
              {
                data: yData,
                linearGradientColor: ['rgb(86, 142, 255)', 'rgb(86, 142, 255,0)'],
              },
            ]"
            :height="320"
          />
        </div>
      </div>
    </template>
  </SubPanelTemplate>
</template>

<script setup lang="ts">
import { ref } from "vue";

import { ModelValueItf } from "../../public/types";
import AiAnalysisPopover from "./ai-analysis-popover.vue";
import { AlarmStatus } from "@/api/models/alarm";
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
import GridContainer from "@/components/businessPanel/public/gridContainer.vue";
import LineChart from "@/components/businessPanel/public/lineChart.vue";
import OperateDays from "@/components/businessPanel/public/operateDays.vue";
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import { useStateStore } from "@/pages/state/use-state-store";
import { alarmTrend, equipmentNumber } from "@/utils/requestData/alarm";

const { globalState } = useStateStore();
const aiAnalysisContent =
  "今日告警总量 7 条，含消防、电气、冷库设备、危险作业隐患各 1 条，其余为现场运营预警，无一级紧急险情；当前高温高湿、冷库满负荷运转，设备故障易发，动火、用电、仓储类隐患均不符合消防、冷库安全规范及园区作业规程，属于督查重点；昨日告警 12 条，整体隐患环比下降，但冷链、动火等高风险问题未清零，持续高温或将造成告警反弹，7 条隐患均已现场核查，5 条当场整改，设备故障已派发维保工单今日闭环，建议加密冷库、动火、装卸重点区域日间巡检，防范火情与生鲜损耗风险。";
const hiddenDangerTime = ref<ModelValueItf>();
const alarmStatusData = ref<AlarmStatus[]>([
  {
    alarmNum: 10,
    alarmStatus: "",
    alarmStatusName: "处理中",
    color: "#FFC700",
  },
  {
    alarmNum: 10,
    alarmStatus: "",
    alarmStatusName: "挂起",
    color: "#74AEE7",
  },
  {
    alarmNum: 10,
    alarmStatus: "",
    alarmStatusName: "已处理",
    color: "#00F27B",
  },
  {
    alarmNum: 10,
    alarmStatus: "",
    alarmStatusName: "待确认",
    color: "#29C2FF",
  },
]);
const xData = ref<string[]>(["12-4", "12-5", "12-6", "12-7", "12-8"]);
const yData = ref<number[]>([1, 2, 3, 4, 5]);
const alarmCon = ref({
  count: 0,
  ratio: 0,
});
// 设备报警趋势
const alarmTrendInfo = async () => {
  let param = {
    sceneType: globalState.business.currentMenu,
    areaId: globalState.business.currentAreaId,
    period: hiddenDangerTime.value.dateRange.join(","),
    type: hiddenDangerTime.value.timeType,
  };

  let res: any = await alarmTrend(param);
  let data: any = await equipmentNumber(param);
  alarmStatusData.value = data.alarmStatusStatistics;
  alarmCon.value.count = data.alarmNum;
  alarmCon.value.ratio = data.chainRatio;
  xData.value = res.xdata;
  yData.value = res.ydata;
};
</script>
<style lang="less" scoped>
.body-bum {
  margin-bottom: 10px;
}
.chart {
  height: 220px;
}

// 放大弹窗内的样式
.zoom-trend-content {
  padding: 20px;
  min-height: 500px;

  .zoom-body-bum {
    margin-bottom: 20px;

    .zoom-operate-days {
      font-size: 18px;
    }
  }

  .zoom-grid-container {
    margin: 20px 0;
  }

  .zoom-chart {
    height: 320px;
  }
}
</style>
