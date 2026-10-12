<template>
  <div class="panel">
    <CallStatisticsPanel />
    <SubPanelTemplate title="呼叫趋势">
      <template #extra>
        <DateInlineForm v-model:modelValue="receptionTrendsTime" @search="getCallTrends"></DateInlineForm>
      </template>
      <div :style="{ height: px2rem(chartHeight + 'px') }">
        <LineChart :x-data="receptionTrendsChartData.xData" :series="receptionTrendsChartData.yData" :showLegend="false"
          gridTop="15" :unit="{ x: '', y: '次' }" />
      </div>
    </SubPanelTemplate>
    <SubPanelTemplate title="设备状态总览">
      <OperateDays title="设备总数" :value="deviceTotal">
      </OperateDays>
      <GridContainer :data="deviceStatistic" class="body-bum"></GridContainer>
      <div class="chart">
        <pieGuidance :y-data="yData" height="70%"></pieGuidance>
      </div>
      <RollTable :column="alarmColumn" :data="alarmListData">
      </RollTable>
    </SubPanelTemplate>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive,onMounted} from 'vue'
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import CallStatisticsPanel from './components/call-statistics-panel.vue';
import pieGuidance from "@/components/businessPanel/public/charts/pie/pie-guidance.vue"
import { storeArea } from "@/piniaStore/area";
import { storeMenu } from "@/piniaStore/menu";
import {callTrends} from '@/api/medical-intercom'
import { ModelValueItf } from '@/components/businessPanel/public/types'
import GridContainer from "@/components/businessPanel/public/gridContainer.vue";
import RollTable from "@/components/businessPanel/public/rollTable/index.vue";
import { px2rem } from '@/utils/common'
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
import LineChart from "@/components/businessPanel/public/lineChart.vue";
import OperateDays from "@/components/businessPanel/public/operateDays.vue";
import useCommon from '@/components/hooks/useCommon'

const piniaStoreMenu = storeMenu();
const piniaStoreArea = storeArea();
//呼叫趋势==================================================================
const receptionTrendsTime = ref<ModelValueItf>();

const receptionTrendsChartData = reactive({
  xData: ['4', '8', '12', '16', '20', '24h'],
  yData: [
    { data: [], linearGradientColor: ['rgba(120, 252, 252, 1)', 'rgba(120, 252, 252, 0.1)'], lineColor: 'rgba(120, 252, 252, 1)' },
  ]
})
const chartHeight= 160
//设备状态总览==================================================================
const deviceTotal = ref(0);
const deviceStatistic = ref([]);
const colorList = [
  "#2F8DFF",
  "#19F8F7",
  "#7786a3",
  "#FFAB10",
]
const deviceStatusType = {
    ALARM: "报警",
    TROUBLE: "故障",
    OFFLINE: "离线",
    NORMAL: "正常",
}
const yData = ref([
])
const alarmColumn = [
  {
    title: "设备状态",
    dataIndex: "status",
    width: 120,
  },
  {
    title: "设备总数",
    dataIndex: "num",
  },
  {
    title: "设备占比",
    dataIndex: "proportion",
  },
];
const alarmListData = ref([])
//设备分类数据
const { getEquipmentNumber } = useCommon()
const getEquipmentInfo = async () => {
    yData.value.length = 0
    let res:any = await getEquipmentNumber()
    if (!res.deviceNum) {
        return
    }
    deviceTotal.value=res.deviceNum
    deviceStatistic.value.length = 0
    res.deviceStatusNums.forEach((item, index) => {
        yData.value.push({
            name: deviceStatusType[item.name],
            value: item.num,
            itemStyle:{color:colorList[index]} 
        })
        deviceStatistic.value.push({
            alarmStatusName: deviceStatusType[item.name],
            color: colorList[index],
            alarmNum: item.num,
        })
        alarmListData.value.push({
          status:deviceStatusType[item.name],
          num:item.num,
          proportion:Math.round(item.num/res.deviceNum)*100+'%'})
    })
    
}
//呼叫趋势数据
const getCallTrends= async () => {
  let params = {
      sceneType: piniaStoreMenu.currentMenu,
      areaId: piniaStoreArea.currentAreaId,
      period: receptionTrendsTime.value.dateRange.join(","),
      type: receptionTrendsTime.value.timeType,
    };
  const res= await callTrends(params)
  receptionTrendsChartData.xData=res.xtitle
  receptionTrendsChartData.yData[0].data=res.xtitle.map(xItem=>{
                return res.callTrends.find(item=>item.timeFlag===xItem)?res.callTrends.find(item=>item.timeFlag===xItem).num
:0
            });
}
onMounted(()=>{
  getEquipmentInfo()
  getCallTrends()
})
</script>
<style lang="less" scoped>
.content {
  text-align: left;
  color: #fff;
  font-size: 14px;
  line-height: 40px;

  .total-num {
    font-size: 16px;
  }
}

.dataTitle {
  color: #ABB8CB;
  font-size: 14px;
  text-align: right;

  .dataTitle-right {
    cursor: pointer;
  }
}
</style>