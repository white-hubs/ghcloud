<template>
  <div class="panel">
    <SubPanelTemplate title="隧道今日车流量分析">
      <GridContainer style="margin-top: 10px" :data="alarmStatusData"></GridContainer>
      <div class="charts">
        <LineChart :x-data="xData" :series="yData" :showLegend="true" :showBackground="true" :titles="titles" gridTop="15"
          :unit="{ x: '', y: '人次' }" :axisPointer="true" />
      </div>
    </SubPanelTemplate>
    <SubPanelTemplate title="设备离线率" class="alarm-event">
      <div class="equipmentInfo">
        <waterPolo
          title=""
          :value="faultRate"
          unit="%"
          bgColor="#FFC700"
          color="#FFC700"
        ></waterPolo>
        <deviceModule :data-list="dataList"></deviceModule>
      </div>
    </SubPanelTemplate>
    <SubPanelTemplate title="设备报警事件统计">
      <template #extra>
        <DateInlineForm
        v-model:modelValue="timeFrame"
        @search="getAlarmLevel"
        ></DateInlineForm>
      </template>
      <div class="equipmentAlarm">
        <RoundPie :data="roundPieData" :eventNum="devicesNum">
          <div class="content">
            <span>{{ devicesNum }}</span> <br />报警总数
          </div>
        </RoundPie>
        <pieList :roundPieData="roundPieData"></pieList>
      </div>
    </SubPanelTemplate>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive,onMounted} from 'vue'
import GridContainer from "@/components/businessPanel/public/gridContainer.vue";
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
import pieList from "../public/pieList.vue";
import RoundPie from "../public/charts/roundPie/roundPie.vue";
import LineChart from "@/components/businessPanel/public/lineChart.vue";
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import { AlarmRateList, ModelValueItf } from '../public/types'
import waterPolo from "../public/charts/waterPolo/waterPolo.vue";
import deviceModule from "../public/deviceModule.vue";
import useCommon from '@/components/hooks/useCommon'
import { statisticsLevel } from '@/api/alarm'
import { trafficFlowTunnels } from '@/api/securitymanagement'
import moment from 'moment'

const { getEquipmentNumber,piniaStoreMenu,piniaStoreArea } = useCommon();
const colorList = ["#328BF7", "#19F8F7", "#FFC700", "#EF424A"];
const roundPieData = ref([]);
const devicesNum = ref(0);
const alarmStatusData = ref([
  {alarmStatus: "0", alarmStatusName: "进入", alarmNum: 0, color: 'rgb(255, 199, 0)'},
  {alarmStatus: "1", alarmStatusName: "离开", alarmNum: 0, color: 'rgb(0, 242, 123)'},
]);
let timeFrame = ref<ModelValueItf>();
const xData = ref<string[]>([])
const yData = ref<{name:string; data: number[]; linearGradientColor?:string[];lineColor?:string; showSymbol?:boolean; smooth?:boolean; symbolSize?:number;}[]>([
 {
  data: [0],
   linearGradientColor: ['rgb(255, 162, 0.1)', 'rgb(255, 222, 165,1)'],
   name:'进入'
  },
 {
  data: [0],
  linearGradientColor: ['rgba(120, 252, 252, 1)', 'rgba(120, 252, 252, 0.1)'], lineColor: 'rgba(120, 252, 252, 1)',
  name:'离开'
  },
])
const titles = ref<string[]>([])
const faultRate = ref<number>(0);
const dataList = reactive<AlarmRateList[]>([
  {
    title: "设备总数",
    value: 0,
    ringRatio: false,
  },
  {
    title: "离线总数",
    value: 0,
    ringRatio: true,
    label: 0,
    unit: "%",
  },
]);
/**
 * 设备类型分布
 */
 const equipmentStatistic = async () => {
  const res = await getEquipmentNumber();
  if (JSON.stringify(res) === "{}") {
    return;
  }
  res.deviceStatusNums.forEach((item) => {
    if (item.name === "OFFLINE" && res.deviceNum !== 0) {
      faultRate.value = Math.round((item.num / res.deviceNum) * 10000) / 100.0;
      dataList[0].value = res.deviceNum;
      dataList[1].value = item.num;
      dataList[1].label = faultRate.value;
    }
  });
};
// 获取报警级别分布数据
async function getAlarmLevel() {
  let params = {
    sceneType: piniaStoreMenu.currentMenu,
    areaId: piniaStoreArea.currentAreaId,
    period: timeFrame.value.dateRange.join(","),
    type: timeFrame.value.timeType,
  };
  let res = await statisticsLevel(params);
  devicesNum.value = 0
  roundPieData.value = res.map((item,index) => {
    devicesNum.value += item.alarmNum;
    return {
      label:item.name += "报警",
      color:colorList[index],
      value:item.alarmNum
    };
  });
}
const getTrafficFlowTunnels =async () => {
 const res = await trafficFlowTunnels({period:[moment().format('YYYY-MM-DD 00:00:00'), moment().format("YYYY-MM-DD HH:mm:ss")].join(",")})
 alarmStatusData.value[0].alarmNum = res.directionTotalIn
 alarmStatusData.value[1].alarmNum = res.directionTotalOut
 xData.value = res.xtitle.map(item => {
     return item+'时'
    });
    yData.value[0].data = res.xtitle.map(xItem=>{
        return res.directionInList.find(item=>item.timeFlag===xItem)?res.directionInList.find(item=>item.timeFlag===xItem).num:0
    })
    yData.value[1].data = res.xtitle.map(xItem=>{
        return res.directionOutList.find(item=>item.timeFlag===xItem)?res.directionOutList.find(item=>item.timeFlag===xItem).num:0
    })
}
onMounted(()=>{
  equipmentStatistic()
  getTrafficFlowTunnels()
})
</script>
<style lang="less" scoped>
.charts {
  height: 250px;
}
:deep(.ant-statistic) {
  display: flex;
  align-items: center;
  justify-content: space-around;
}
.equipmentInfo {
  display: flex;
  justify-content: space-between;
  padding: 10px 16px 0 20px;
}
.equipmentAlarm {
  display: flex;
  justify-content: space-around;
  align-items: center;
  .content {
    font-size: 12px;
  }
}
</style>