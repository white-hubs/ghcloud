<template>
<SubPanelTemplate title="安全分析">
  <DeviceStatistics
        imgPath="business-icon/triage-queue/6.png"
        :statistic="deviceStatisticsData"
      ></DeviceStatistics>
    <div class="chart">
      <LineChart :x-data="trendsData.xData" :series="trendsData.yData" :showLegend="false" gridTop="5" />
    </div>
  </SubPanelTemplate>
  <SubPanelTemplate title="设备总览" class="alarm-event">
      <div class="chart flex-start">
        <elevator-analysis-pie style="width: 50%" :pieData="pieData" :radius="'75'">
          <div style="color: #fff; text-align: center; font-size: 0.072rem">
            {{ deviceStatisticsData.total }}
          </div>
          <div style="color: #fff; text-align: center; font-size: 0.0625rem">设备总数</div>
        </elevator-analysis-pie>
        <elevatorAnalysisList
          :contentList="pieData"
          style="width: 50%;"
        ></elevatorAnalysisList>
      </div>
    </SubPanelTemplate>
    <SubPanelTemplate title="人车通行">
      <div class="chart">
        <stackedLine :title="lineData.title" :yData="lineData.yData" :xData="lineData.xData"
          :color="['#2989FF', '#FF6E23']"></stackedLine>
      </div>
    </SubPanelTemplate>
</template>

<script setup lang="ts">
import { ref, reactive,onMounted, onBeforeUnmount} from 'vue'
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import { ModelValueItf } from '@/components/businessPanel/public/types';
import * as echarts from "echarts";
import DeviceStatistics from "@/components/businessPanel/security-monitoring-safty/device-statistics.vue";
import elevatorAnalysisPie from "@/components/businessPanel/public/charts/pie/elevator-analysis-pie.vue"
import elevatorAnalysisList from "@/components/businessPanel/public/elevator-analysis-list.vue"
import traffic from "@/components/businessPanel/public/traffic.vue";
import stackedLine from "@/components/businessPanel/public/charts/stackedLine/stackedLine.vue";
import LineChart from "@/components/businessPanel/public/lineChart.vue";

const trendsData = reactive({
  xData: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
  yData: [
    { 
      data: [21, 18, 19, 23, 29, 33, 31],
      linearGradientColor: ['rgba(47, 141, 255, 0.50)', 'rgba(47, 141, 255, 0.02)'],
      lineColor: 'rgba(47, 141, 255, 0.50)' 
    }
  ]
})
const alarmStatisticsData = reactive({
  title: "报警总量",
  total: 0,
  ratio:0,
  itemize: [
    {
      label: "真实报警数：",
      value: 0,
      ratio:0,
      color: '#2AE8BD',
      alarmHandlerResult:'ALARM_ACTUAL'
    },
    {
      label: "误报数：",
      value: 0,
      ratio:0,
      color: '#FFAB10',
      alarmHandlerResult:'ALARM_IMPRACTICAL'
    },
  ],
  list: [],
});
const trafficList = reactive([
  {
    color: "#2989FF",
    label: "驶入",
    value: 0,
  },
  {
    color: "#FF6E23",
    label: "驶出",
    value: 0,
  },
]);
const lineData = reactive({
  title: "辆",
  xData: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
  yData: [
    {
      data: [120, 132, 101, 134, 90, 230, 210],
      name: "驶入",
      colors: [
        {
          offset: 0,
          color: "rgba(41, 137, 255, 1)",
        },
        {
          offset: 1,
          color: "rgba(41, 137, 255, 0.20)",
        },
      ],
    },
    {
      data: [89, 90, 101, 134, 90, 230, 210],
      name: "驶出",
      colors: [
        {
          offset: 0,
          color: "rgba(255, 110, 35, 1)",
        },
        {
          offset: 1,
          color: "rgba(255, 110, 35, 0.02)",
        },
      ],
    },
  ],
});
const pieData = ref([
  {
    name: '消防设备',
    value: 300,
    color: '#2AE8BD',
  },
  {
    name: '办公设备',
    value: 14,
    color: '#2989FF',
  },
  {
    name: '报警设备',
    value: 10,
    color: '#FFC700',
  },
  {
    name: '其他设备',
    value: 10,
    color: '#F14545',
  },
])
const deviceStatisticsData = reactive({
  title: "报警数",
  total: 48,
  itemize: [
    {
      name: "实报",
      label: "误报",
      value: 33,
      offline: 15,
      key: "OFFLINE1",
    },
  ],
});


</script>
<style lang="less" scoped>
.visiting-data {
  :deep(.sub-panel-content) {
    display: flex;
    flex-wrap: wrap;

    .item {
      height: 60px;
      width: 50%;
      margin-top: 30px;
      margin-bottom: 10px;
      justify-content: center;
      box-sizing: border-box;
      padding-left: 20px;

      .unit {
        font-size: 12px;
      }

      .ant-statistic {
        display: inline-flex;
        flex-flow: column-reverse;

        .ant-statistic-content {
          height: 29px;

          .ant-statistic-content-value {
            color: #fff;
            font-size: 22px;
            font-weight: 400;
            position: relative;
            top: -25px;
          }
        }

        .ant-statistic-title {
          color: #D0DEEE;
          font-size: 16px;
          font-weight: bold;
          margin: 0;
        }
      }
    }
  }

  .ringRatio {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 12px;
  }

  .downtriangle {
    width: 0;
    height: 0;
    border-left: 8px solid transparent;
    border-right: 8px solid transparent;
    border-bottom: 8px solid #d2fff3;
    margin: 0 3px;
    transform: rotate(180deg);
  }

  .uptriangle {
    border-bottom: 8px solid #ffcece;
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

.elevator-analysis {
  display: flex;
  justify-content: space-between;
  padding: 0 10px;
  align-items: center;

  div {
    color: #fff;
    text-align: center;
    font-size: 14px;
  }
}

.chart {
  flex: 1;
  height: 180px;
}

.elevatorAnalysisList {
  margin-left: 10px;
  width: 180px;
}

.DeviceStatistics {
  height: 60px;
}

.radar {
  width: 100%;
  height: 220px;
}

.table-box {
  height: 200px;
}
.chart {
  flex: 1;
  height: 170px;
}
.trafficBox {
  display: flex;
  align-items: center;
  justify-content: space-around;
  margin-top: 12px;
}
</style>