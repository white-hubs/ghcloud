<template>
  <SubPanelTemplate title="充电桩运行统计分析">
    <template #extra>
      <DateInlineForm v-model:modelValue="overviewTime" @search="changeHandleOverviewTime">
      </DateInlineForm>
    </template>
    <div class="echarts">
      <LineChart :x-data="xData" :series="yData" :showLegend="true" :showBackground="true" :titles="titles" gridTop="15"
        :unit="{ x: '', y: '间' }" :axisPointer="true" />
    </div>
  </SubPanelTemplate>
  <SubPanelTemplate title="充电桩区域分布">
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
  <SubPanelTemplate title="车位使用统计">
    <template #extra>
      <DateInlineForm v-model:modelValue="overviewTime" @search="changeHandleOverviewTime">
      </DateInlineForm>
    </template>
    <div class="table-box">
      <RollTable :column="columns" :data="data" :showLength="8">
      </RollTable>
    </div>
  </SubPanelTemplate>

</template>

<script setup lang="ts">
import { ref, reactive,onMounted} from 'vue'
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import { ModelValueItf } from '../../public/types'
import LineChart from "@/components/businessPanel/public/lineChart.vue";
import RollTable from "@/components/businessPanel/public/rollTable/index.vue";
import DeviceStatistics from "@/components/businessPanel/triage-queue/components/device-statistics.vue"
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
import overviewChartBar from "@/components/businessPanel/hospital/overview-chartBar.vue"

const xData = ref<string[]>(['行政区','生产区','仓储物流','公共区','其他区域'])
const titles = ref<string[]>(['使用','闲置'])
const yData = ref<{name:string; data: number[]; linearGradientColor?:string[];lineColor?:string; showSymbol?:boolean; smooth?:boolean; symbolSize?:number;}[]>(
  [{
    name:'使用',
    data:[34,78,16,92,45],
    linearGradientColor:['rgba(120, 252, 252, 0.5)', 'rgba(120, 252, 252, 0.1)'],
    lineColor:'rgba(120, 252, 252, 1)',
    smooth:true,
    symbolSize: 8
  },{
    name:'闲置',
    data:[34,78,16,92,45],
    linearGradientColor:['rgba(86, 142, 255, 0.5)', 'rgba(86, 142, 255, 0.1)'],
    lineColor:'rgba(86, 142, 255, 1)',
    smooth:true,
    symbolSize: 8
  }
])

const deviceStatisticsData1 = reactive({
    title: "总数",
    total: 300,
    itemize: [
        {
            name: '使用占比',
            label: "已使用",
            value: 20,
            key: "OFFLINE",
        }
    ]
});
const columns = ref([
  {
    title: "区域",
    dataIndex: "areaName",
    width: 120,
  },
  {
    title: "车牌号",
    dataIndex: "CarNumber",
  },
  {
    title: "停车时长",
    dataIndex: "time",
  },
]);
const barData = reactive({
    xData: ['行政区','生产区','仓储物流','公共区','其他区域'],
    yData: [
        {
            data: [10, 20, 30, 40,80],
            name: '',
            color: ['rgba(41, 137, 255, 0.80)', 'rgba(41, 137, 255, 0)']
        }
    ]
})
const generateRandomCarNumber=()=> {
      const letters = String.fromCharCode(65 + Math.floor(Math.random() * 26));
      const numbers = Math.floor(10000 + Math.random() * 90000).toString().padStart(5, '0');
      return `粤${letters}${numbers}`;
    }

const generateRandomTime=()=> {
      const hours = Math.floor(Math.random() * 11);
      const minutes = Math.floor(Math.random() * 60);
      return `${hours}小时${minutes}分钟`;
}
const generateData=()=>{
  const dataList = [];
    for (let i = 0; i < 20; i++) {
      const areaName = xData.value[Math.floor(Math.random() * xData.value.length)];
      const carNumber = generateRandomCarNumber();
      const timeStr = generateRandomTime();
      const data = {
        "areaName": areaName,
        "CarNumber": carNumber,
        "time": timeStr
      };
      dataList.push(data);
    }
    return dataList
}
const data = ref<any>([
  ...generateData()
]);
const overviewTime = ref<ModelValueItf>({
  timeType: 'TODAY',
  dateRange: []
})
const changeHandleOverviewTime = () => {
};
onMounted(()=>{
})
</script>
<style lang="less" scoped>
.chart {
  height: 160px;
}

.delect {
  color: #f14545;
  cursor: pointer;
}

.table-box {
  height: 290px;
}
</style>