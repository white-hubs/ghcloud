<template>
  <div class="panel">
    <SubPanelTemplate title="呼叫时段分布">
      <div :style="{ height: px2rem(chartHeight + 'px') }">
        <LineChart :x-data="distributionChartData.xData" :series="distributionChartData.yData"  :showLegend="false"
          gridTop="15" :unit="{ x: '', y: '次' }" />
      </div>
    </SubPanelTemplate>
    <SubPanelTemplate title="设备分类">
      <pieGuidance :y-data="monitorSituationPieData" position="inside" :radius="['50%','90%']" height="80%">
      </pieGuidance>
    </SubPanelTemplate>
    <SubPanelTemplate title="设备异常统计">
      <template #extra>
        <DateInlineForm v-model:modelValue="receptionTrendsTime" @search="getAbnormalStatistics"></DateInlineForm>
      </template>
      <div class="alarmInfo">
      <deviceModule :data-list="alarmStatusData"></deviceModule>
      </div>
      <RollTable :column="alarmColumn" :data="listData">
        <template #situation="{ record }">
          <span v-if="record.situation === 'ALARM_UN_CONFIRMED'" style="color: #f14545">待处理</span>
          <span v-else-if="record.situation === 'ALARM_PROGRESS_CONFIRMED'" style="color: #ffab10">处理中</span>
          <span v-else="record.situation === 'ALARM_CONFIRMED'" style="color: #00f27b">已处理</span>
        </template>
      </RollTable>
    </SubPanelTemplate>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive,onMounted} from 'vue'
import { px2rem } from '@/utils/common'
import LineChart from "@/components/businessPanel/public/lineChart.vue";
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import { AlarmRateList, ModelValueItf } from '@/components/businessPanel/public/types'
import { storeMenu } from "@/piniaStore/menu";
import { storeArea } from "@/piniaStore/area";
import waterPolo from "@/components/businessPanel/public/charts/waterPolo/waterPolo.vue";
import deviceModule from "@/components/businessPanel/public/deviceModule.vue";
import useCommon from '@/components/hooks/useCommon'
import pieGuidance from "@/components/businessPanel/public/charts/pie/pie-guidance.vue"
import RollTable from "@/components/businessPanel/public/rollTable/index.vue";
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
import { abnormalStatistics } from '@/api/alarm'
import moment from "moment";
import { callTrends } from '@/api/medical-intercom'
const piniaStoreMenu = storeMenu();
const piniaStoreArea = storeArea();
//呼叫时段分布==================================================================
const distributionTime = ref<ModelValueItf>();
const chartHeight= 160
const distributionChartData = reactive({
  xData: ['4', '8', '12', '16', '20', '24h'],
  yData: [
    { data: [],smooth:false, linearGradientColor: ['rgba(24, 144, 255, 1)', 'rgba(120, 252, 252, 0.1)'], lineColor: 'rgba(120, 252, 252, 1)' },
  ]
})
//设备分类==============================================================
const monitorSituationPieData = ref<{ name: string; value: number; color: string }[]>(
    [
       
    ]
);
const colorList = [
  "#2F8DFF",
  "#19F8F7",
  "#7786a3",
  "#FFAB10",
]
//设备异常统计==============================================================
const alarmStatusData = reactive<AlarmRateList[]>([
  {
    title: "异常设备数量",
    value: 0,
    ringRatio: false,
  },
  {
    title: "报警次数",
    value: 0,
    ringRatio: false,
    label: 0,
    unit: "%",
  },
]);
const alarmColumn = [
  {
    title: "日期",
    dataIndex: "timeFlag",
    width: 120,
  },
  {
    title: "异常设备数量",
    dataIndex: "equipmentNum",
  },
  {
    title: "报警次数",
    dataIndex: "alarmNum",
    width: 140,
  }
];
const listData = ref([])
const receptionTrendsTime = ref<ModelValueItf>();

//设备分类数据
const { getEquipmentNumber } = useCommon()
const getEquipmentInfo = async () => {
    monitorSituationPieData.value.length = 0
    let res:any = await getEquipmentNumber()
    if (!res.deviceNum) {
        return
    }
    res.deviceGenreNums.forEach((item, index) => {
        monitorSituationPieData.value.push({
            name: item.genreName,
            value: item.num,
            color:colorList[index]
        })
    })
}
//设备异常数据
const getAbnormalStatistics=async()=>{
  let param = {
    sceneType: piniaStoreMenu.currentMenu,
    areaId: piniaStoreArea.currentAreaId,
    period: receptionTrendsTime.value.dateRange.join(","),
    type: receptionTrendsTime.value.timeType,
  };
  const res = await abnormalStatistics(param)
  alarmStatusData[0].value=res.equipmentDeviceTotal
  alarmStatusData[1].value=res.equipmentTotal
  listData.value=res.equipmentList
  if(receptionTrendsTime.value.timeType==='THIS_YEAR'){
    listData.value.forEach(x=>{
      x.timeFlag=x.timeFlag+'月'
    })
  }
  if(receptionTrendsTime.value.timeType==='TODAY'){
    res.equipmentList?.forEach(x=>{
      x.timeFlag=x.timeFlag+'时'
    })
  }
}
//呼叫时段分布
const getCallTrends=async()=>{
  let param = {
    sceneType: piniaStoreMenu.currentMenu,
    areaId: piniaStoreArea.currentAreaId,
    period: [moment().format('YYYY-MM-DD 00:00:00'), moment().format("YYYY-MM-DD HH:mm:ss")].join(","),
    type: 'TODAY',
  };
  const res = await callTrends(param)
  distributionChartData.xData=res.xtitle
  distributionChartData.yData[0].data=res.xtitle.map(xItem=>{
                return res.callTrends.find(item=>item.timeFlag===xItem)?res.callTrends.find(item=>item.timeFlag===xItem).num
:0
            });
}
onMounted(()=>{
  getEquipmentInfo()
  getCallTrends()
  getAbnormalStatistics()
})
</script>
<style lang="less" scoped>
.alarmInfo {
  padding: 10px 16px 0 20px;
  display: flex;
  padding: 0.05208rem 0.08333rem 0 0.10417rem;
  flex-direction: column;
  align-items: center;
  :deep(.deviceList) {
  display: flex;
}
  :deep(.titleBox){
    text-align: center;
  }
  :deep(.ringRatio){
    display: block !important;
    // align-items: center !important;
    text-align: center;
  }
}


</style>