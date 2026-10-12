<template>
  <SubPanelTemplate title="租赁面积统计" class="visiting-data">
    <div class="item" v-for="item in visitingData" :key="item.title">
      <a-statistic :title="item.title">
        <template #formatter>
          <count-to :startVal="0" :endVal="item.value" :duration="2000" separator=""></count-to>
          <div class="ringRatio">
            <span style="white-space: nowrap;">环比</span>
            <!-- uptriangle 向上三角根据Prop改变 -->
            <div :class="['downtriangle', item.ratio > 0 && 'uptriangle']"></div>
            <div :class="[item.ratio > 0 ? 'up' : 'down']">{{ item.ratio + "%" }}</div>
          </div>
        </template>
      </a-statistic>
    </div>
  </SubPanelTemplate>
  <SubPanelTemplate title="租赁使用分析" class="lease-analysis">
    <template #extra>
      <DateInlineForm v-model:modelValue="trendTime" @search="getTemplateData"></DateInlineForm>
    </template>
    <GridContainer style="margin-top: 12px" :data="alarmStatusData"></GridContainer>
    <div class="charts-box">
      <LineChart :x-data="xData" :series="yData" :showLegend="true" :showBackground="true" :titles="titles" gridTop="15"
        :unit="{ x: '', y: '' }" :axisPointer="true" />
    </div>
  </SubPanelTemplate>
  <SubPanelTemplate title="租赁区域满意率分析">
    <template #extra>
      <DateInlineForm v-model:modelValue="overviewTime" @search="changeHandleOverviewTime">
      </DateInlineForm>
    </template>
    <DeviceStatistics class="DeviceStatistics" imgPath="overView21.png" :statistic="deviceStatisticsData1">
    </DeviceStatistics>
    <div class="chart">
      <overviewChartBar :xData="barData.xData" :yData="barData.yData"></overviewChartBar>
    </div>
  </SubPanelTemplate>
</template>

<script setup lang="ts">
import { ref, reactive,onMounted} from 'vue'
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import CountTo from "@/components/businessPanel/public/count-to/count-to.vue";
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
import DeviceStatistics from "@/components/businessPanel/triage-queue/components/device-statistics.vue"
import overviewChartBar from "@/components/businessPanel/hospital/overview-chartBar.vue"
import { ModelValueItf } from '@/components/businessPanel/public/types';
import LineChart from "@/components/businessPanel/public/lineChart.vue";
import GridContainer from "@/components/businessPanel/public/gridContainer.vue";
import { getXaxleData } from '@/utils/common';
import { getCarData } from "@/mock/security-situation"
const colorList = ['rgba(120, 252, 252, 1)', 'rgba(86, 142, 255, 1)']
const linearList = [['rgba(120, 252, 252, 0.5)', 'rgba(120, 252, 252, 0.1)'], ['rgba(86, 142, 255, 0.5)', 'rgba(86, 142, 255, 0.1)']]
const visitingData = ref([
    { title: "行政办公区", value: 7800, ratio: 12.3 },   
    { title: "生产研发区", value: 4500, ratio: 50.0 },   
    { title: "仓储物流区", value: 1500, ratio: -5.0 },      
    { title: "公共服务区", value: 800, ratio: 8.7 },    
]);
const alarmStatusData = ref([
  {alarmStatus: "0", alarmStatusName: "使用", alarmNum: 0, color: 'rgb(255, 199, 0)'},
  {alarmStatus: "1", alarmStatusName: "控制", alarmNum: 0, color: 'rgb(0, 242, 123)'},
  {alarmStatus: "2", alarmStatusName: "使用率", alarmNum: '', color: 'rgb(41, 194, 255)'}
]);
const overviewTime = ref<ModelValueItf>({
  timeType: 'TODAY',
  dateRange: []
})
const titles = ref<string[]>([])
const alarmStatusInit = ref([...alarmStatusData.value])
const trendTime = ref<ModelValueItf>({timeType: 'TODAY', dateRange: []});
  const chartData = ref<{ label: string; data?:number[];}[]>([]);
  const xData = ref<string[]>([])
    const yData = ref<{name:string; data: number[]; linearGradientColor?:string[];lineColor?:string; showSymbol?:boolean; smooth?:boolean; symbolSize?:number;}[]>([])
const topTimeFrame = ref({
  timeType:'rili',
});
const getTemplateData = () => {
  // TODO  接口调用
  const { timeType } = trendTime.value
  xData.value = getXaxleData(timeType)
  titles.value = chartData.value.map((item)=> item.label)
  chartData.value = getCarData({formPage: 'PARK', timeType: timeType as TimeType})
  chartData.value.forEach((item, index) => {
    yData.value = chartData.value.map((item, index) => {
      return {
        name: item.label,
        lineColor: colorList[index] ?? '#2AE8BD',
        linearGradientColor: linearList[index],
        data: item.data,
        // showSymbol:true,
        smooth:true,
        symbolSize: 8
      }
    })
  })
  alarmStatusData.value = alarmStatusInit.value
  const inNum = chartData.value.filter((item)=> item.label === '驶入')[0].data.reduce(function (total, value) {
    return total + value;
  }, 0);
  const outNum = chartData.value.filter((item)=> item.label === '驶出')[0].data.reduce(function (total, value) {
    return total + value;
  }, 0);
  const exitNum = inNum - outNum 
  alarmStatusData.value[0].alarmNum = inNum
  alarmStatusData.value[1].alarmNum = outNum
  alarmStatusData.value[2].alarmNum = (inNum / outNum * 100).toFixed(0) + '%' 
}
const appointmentChartData = ref<{ name: string; value: number; color: string; ratio?: string }[]>(
  []
);
const deviceStatisticsData1 = reactive({
    title: "总记录数",
    total: 100,
    itemize: [
        {
            name: '满意率',
            label: "满意数",
            value: 10,
            key: "OFFLINE",
        }
    ]
});
const barData = reactive({
    xData: ['行政办公区', '生产研发区', '仓储物流区', '公共服务区'],
    yData: [
        {
            data: [10, 20, 30, 40],
            name: '满意',
            color: ['rgba(41, 137, 255, 0.80)', 'rgba(41, 137, 255, 0)']
        },
        {
            data: [18, 25, 48, 52],
            name: '不满意',
            color: ['rgba(42, 232, 189, 0.80)', 'rgba(42, 232, 189, 0)']
        },
    ]
})
const changeHandleOverviewTime = () => {
};
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

.lease-analysis {
  :deep(.ant-statistic) {
    display: flex;
    align-items: center;
    justify-content: space-around;
  }

  :deep(.ant-statistic-title) {
    white-space: nowrap;
    margin-bottom: 0;
  }

  :deep(.ant-statistic-content) {
    font-size: 14px !important;
    padding-left: 0 !important;
  }

  :deep(.grid-container) {
    display: flex;
    width: 100%;
  }

  :deep(.grid-item) {
    flex: 1;
  }

  .appointment-data {
    display: flex;
    align-items: center;
    height: 100%;

    img {
      width: 20px;
      height: 20px;
    }

    :deep(.policeList) {
      display: flex;
      flex-flow: column;
      justify-content: center;

      .thePolice {
        margin-bottom: 6px;
        background: rgba(171, 177, 189, 0.12);

        .thePoliceLeft {
          overflow: visible;
        }
      }
    }
  }

  .elevator-analysis {
    display: flex;
    justify-content: space-between;
    padding: 0 10px;
    align-items: center;
  }

  .chart {
    flex: 1;
    height: 220px;
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
  height: 160px;
}

.elevatorAnalysisList {
  margin-left: 10px;
  width: 180px;
}

.DeviceStatistics {
  height: 60px;
}
.charts-box{
  height: 220px;
}
</style>