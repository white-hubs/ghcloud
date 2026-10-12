<template>
  <div class="panel">
    <SubPanelTemplate title="今日设备总览">
      <OperateDays :value="deviceNum" title="设备总数" class="body-num" />
      <div class="flex-between">
        <PlanPie :pieData="alarmSituationPieData" class="alarm-total-pie" pie-class="alarm-total-pie-chart">
          <div class="content">
            <img :src="getAssetsImage('overView5.png')" alt="">
          </div>
        </PlanPie>
        <PieList :roundPieData="alarmSituationPieData" class="alarm-total-list"></PieList>
      </div>
    </SubPanelTemplate>
    <SubPanelTemplate title="报警态势">
      <template #extra>
        <DateInlineForm v-model:modelValue="receiveOverviewTime" @search="changeHandleReceiveOverviewTime">
        </DateInlineForm>
      </template>
      <a-radio-group @change="changeHandleReceiveOverviewTime" class="body-num" v-model:value="alarmApplication"
        button-style="solid">
        <a-radio-button value="atrend">设备报警统计</a-radio-button>
        <a-radio-button value="statistics">报警等级统计</a-radio-button>
      </a-radio-group>
      <OperateDays title="报警数" :value="alarmCon.count" class="body-num">
        <div class="extra flex-start">
          <div class="mode">环比</div>
          <div :class="['downtriangle', alarmCon.ratio > 0 && 'uptriangle']"></div>
          <div :class="[alarmCon.ratio < 0 ? 'down' : 'up']">{{ alarmCon.ratio }}%</div>
        </div>
      </OperateDays>
      <div class="flex-between">
        <PlanPie :pieData="alarmCon.alarmStatusStatistics" class="alarm-total-pie" pie-class="alarm-total-pie-chart">
          <div class="content">
            <img :src="getAssetsImage('overView21.png')" alt="">
          </div>
        </PlanPie>
        <PieList :roundPieData="alarmCon.alarmStatusStatistics" class="alarm-total-list"></PieList>
      </div>
    </SubPanelTemplate>
    <SubPanelTemplate title="报警趋势" class="fire-alarm">
      <template #extra>
        <DateInlineForm v-model:modelValue="topTimeFrame" @search="changeTopTimeFrame"></DateInlineForm>
      </template>
      <a-radio-group @change="changeTopTimeFrame" class="body-num" v-model:value="alarmTrend" button-style="solid">
        <a-radio-button value="trend">设备报警趋势</a-radio-button>
        <a-radio-button value="statistics">区域报警统计</a-radio-button>
      </a-radio-group>
      <div class="body">
        <GridContainer @clickItem="clickItem" :data="alarmStatusData"></GridContainer>
        <div class="chart" v-if="alarmTrend==='trend'">
          <stackedLine :title="lineData.title" :yData="lineData.yData" :xData="lineData.xData"
            :color="['#2989FF', '#FF6E23']"></stackedLine>
        </div>
        <div v-else="alarmTrend==='statistics'" class="chart">
          <overviewChartBar :xData="barData.xData" :yData="barData.yData"></overviewChartBar>
        </div>
      </div>
    </SubPanelTemplate>
  </div>
  <!-- 异常设备清单弹窗 -->
  <FailedEquipmentModal :date="topTimeFrame.dateRange" :alarmStatusEnum="alarmStatusEnum" title="异常设备清单"
    v-if="deviceModal" v-model="deviceModal" @close="deviceModal = false" :footer="null" />
</template>

<script setup lang="ts">
import { ref, reactive,onMounted} from 'vue'
import SubPanelTemplate from "../public/subPanelTemplate.vue";
import OperateDays from "../public/operateDays.vue";
import PlanPie from "../public/charts/pie/planePie.vue";
import PieList from "../public/pieList.vue";
import DateInlineForm from "../public/dateInlineForm.vue";
import { ModelValueItf } from "../public/types";
import { getAssetsImage } from "../../../utils/getImage";
import GridContainer from "../public/gridContainer.vue";
import stackedLine from "../public/charts/stackedLine/stackedLine.vue";
import useCommon from '@/components/hooks/useCommon'
import { statisticsLevel, statisticsStatus } from '@/api/alarm'
import { storeMenu } from '@/piniaStore/menu'
import { storeArea } from '@/piniaStore/area'
import  overviewChartBar from "../hospital/overview-chartBar.vue"
import { deviceAlarmArea, deviceAlarmNum, deviceAlarmTrend } from "@/api/device";
import FailedEquipmentModal from '@/components/businessPanel/surgical-demonstration/components/failed-equipment-modal.vue';
let alarmStatusData = ref([]);
const alarmStatusEnum = ref('')
const piniaStoreMenu = storeMenu();
const piniaStoreArea = storeArea();
let xData = ref<string[]>([]);
let yData = ref<number[]>([]);
const deviceModal = ref<boolean>(false);
const alarmCon = ref({
  count: 0,
  ratio: 10,
  alarmStatusStatistics:[]
});
let deviceStatusType = {
    ALARM: "报警",
    TROUBLE: "故障",
    OFFLINE: "离线",
    NORMAL: "正常",
}

const barData = reactive({
  xData: ['安防报警', '消防报警', '电气报警', '入侵报警'],
  yData: [
    {
      data: [10, 20, 30, 40],
      name: '区域',
    }
  ]
})
const clickItem = (data)=>{
 alarmStatusEnum.value = data.alarmStatus
 deviceModal.value = true
}
const { getEquipmentNumber } = useCommon();

let colorList = ["#2AE8BD", "#99C7FF", "#FFC700", "#F14545"];
const alarmApplication = ref('atrend')
const alarmTrend = ref('trend')
const alarmTotal = ref<number>(10);
const deviceNum = ref(0)
const alarmSituationPieData = ref<any>([
  {
    color:'#FFAB10',
    value:0,
    label:'故障',
  },  {
    color:'#2F8DFF',
    value:0,
    label:'离线',
  },  {
    color:'#F14545',
    value:0,
    label:'报警',
  },  {
    color:'#19F8F7',
    value:0,
    label:'在线',
  },
]);
const lineData = reactive({
    title: "次",
    xData: [],
    yData: [],
});
const receiveOverviewTime = ref<ModelValueItf>()
const topTimeFrame = ref<ModelValueItf>()
// 报警态势
const changeHandleReceiveOverviewTime = async ()=>{
  let params = {
      sceneType: piniaStoreMenu.currentMenu,
      areaId: piniaStoreArea.currentAreaId,
      period: receiveOverviewTime.value.dateRange.join(","),
      type: receiveOverviewTime.value.timeType,
    };
    alarmCon.value.alarmStatusStatistics=[]
    let status = await statisticsStatus(params);
    alarmCon.value.count = status.alarmNum
    alarmCon.value.ratio = status.chainRatio
  if(alarmApplication.value === 'atrend'){
 let num =  await deviceAlarmNum(params)
    alarmCon.value.alarmStatusStatistics = num.result.map((item,index)=>{
        return {
        color:colorList[index],
        value:item.alarmNum,
        label:item.genreName,
        }
      })
  }else{
  let res = await statisticsLevel(params);
    alarmCon.value.alarmStatusStatistics = res.map((item,index) => {
    return {
      color:colorList[index],
      value:item.alarmNum,
      label:item.name,
    }
    });
  }
}
// 报警趋势
const changeTopTimeFrame = async ()=>{
  let params = {
    sceneType: piniaStoreMenu.currentMenu,
    areaId: piniaStoreArea.currentAreaId,
    period: topTimeFrame.value.dateRange.join(","),
    type: topTimeFrame.value.timeType,
  };
  xData.value.length = 0;
  yData.value.length = 0;
   let Status = await statisticsStatus(params);
   let Trend = await deviceAlarmTrend(params);
  lineData.yData = []
  lineData.xData = []
  for (const key in Trend) {
    let obj = {
      data:[],
      name:''
    }
      lineData.xData = Trend[key].map(item=>{
        if (params.type === "TODAY") {
            item.period += "时";
          } else if (params.type === "THIS_YEAR") {
            item.period += "月";
          } else {
            item.period += "号";
          }
      return item.period
    })
    obj.data = Trend[key].map(item=>{
      return item.alarmNum
    })
    obj.name = key
    lineData.yData.push(obj)
  }
   alarmStatusData.value = Status.alarmStatusStatistics.map((item, index) => {
    item.color = colorList[index];
    return item;
  });
  let area =await deviceAlarmArea(params)
  barData.xData = []
  barData.yData = []
  let data = []
  area.forEach(item=>{
    barData.xData.push(item.name)
    data.push(item.num)
  })
  barData.yData.push({
    name:'区域',
    data
  })
}
// 今日设备总览
const deviceDataInfo = async () => {
    let res: any = await getEquipmentNumber();
    if (!res.deviceNum) {
        return;
    }
    alarmSituationPieData.value.length = 0;
    deviceNum.value = res.deviceNum
    res.deviceStatusNums.forEach((item, index) => {
        alarmTotal.value += item.num;
        let obj = {
            label: deviceStatusType[item.name],
            color: colorList[index],
            value: item.num,
        };
        alarmSituationPieData.value.push(obj);
    });
};
onMounted(()=>{
  deviceDataInfo()
})

</script>
<style lang="less" scoped>
.device-total-pie,
.device-total-list,
.device-total-pie-chart,
.alarm-total-pie,
.alarm-total-list,
.alarm-total-pie-chart {
  height: 140px !important;
}

.content {
  text-align: center;
  color: #fff;
  font-size: 14px;

  img {
    width: 24px;
    height: 24px;
  }
}

:deep(.device-total-pie-chart),
:deep(.alarm-total-pie-chart) {
  height: 140px !important;
}

:deep(.ant-radio-button-wrapper) {
  background: none;
  border: none;
  color: #fff;
}

:deep(.ant-radio-button-wrapper-checked) {
  background: linear-gradient(180deg, rgba(41, 137, 255, 0.4) 0%, rgba(41, 137, 255, 0.8) 100%) !important;
}

.chart {
  height: 240px;
}

.body-num {
  margin-bottom: 10px;
}
</style>