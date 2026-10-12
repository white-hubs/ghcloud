<template>
  <div class="panel">
    <SubPanelTemplate title="冷热源实时数据">
      <div class="flex-between">
          <PlanPie :pieData="monitorSituationPieData">
            <div class="content">
              <div class="total-num">{{ alarmTotal }}</div>
              <div>设备总数</div>
            </div>
          </PlanPie>
          <PieList
            :roundPieData="monitorSituationPieData"
          ></PieList>
        </div>
    </SubPanelTemplate>
    <SubPanelTemplate title="设备报警趋势">
      <template #extra>
        <DateInlineForm
          v-model:modelValue="hiddenDangerTime"
          @search="alarmTrendInfo"
        ></DateInlineForm>
      </template>
      <OperateDays title="报警数" :value="alarmCon.count" class="body-bum">
        <div class="extra flex-start">
            <div class="mode">环比</div>
            <div :class="['downtriangle', alarmCon.ratio > 0 && 'uptriangle']"></div>
            <div :class="[alarmCon.ratio < 0 ? 'down' : 'up']">{{ alarmCon.ratio }}%</div>
        </div>
      </OperateDays>
       <GridContainer :data="alarmStatusData"></GridContainer>
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
    </SubPanelTemplate>
    <SubPanelTemplate title="设备报警率">
      <template #extra>
        <DateInlineForm
          v-model:modelValue="deviceAlarmTime"
          @search="equipmentAlarm"
        ></DateInlineForm>
      </template>
      <div class="equipmentInfo">
        <waterPolo
            title=""
            :value="alarmData"
            unit="%"
            bgColor="#FE090E"
            color="#FE090E"
          ></waterPolo>
          <deviceModule :data-list="dataList"></deviceModule>
      </div>
    </SubPanelTemplate>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive,onMounted} from 'vue'
import SubPanelTemplate from '../public/subPanelTemplate.vue';
import DateInlineForm from "../public/dateInlineForm.vue";
import OperateDays from "../public/operateDays.vue";
import GridContainer from "../public/gridContainer.vue";
import LineChart from "../public/lineChart.vue";
import PlanPie from "../public/charts/pie/planePie.vue";
import PieList from "../public/pieList.vue";
import deviceModule from "../public/deviceModule.vue";
import waterPolo from "../public/charts/waterPolo/waterPolo.vue";
import { AlarmStatus } from "@/api/models/alarm";
import { equipmentTotal } from '@/api/equipment'
import {
  alarmTrend,
  equipmentNumber,
  equipmentAlarmRateData,
} from "@/utils/requestData/alarm";
import { storeArea } from "@/piniaStore/area";
import { storeMenu } from "@/piniaStore/menu";
import { isArray } from '@pansy/utils'

const piniaStoreMenu = storeMenu();
const piniaStoreArea = storeArea();
const alarmStatusList = ["#FFC700", "#74AEE7", "#00F27B", "#29C2FF"];
const colorList = [
  "#FFAB10",
  "#2F8DFF",
  "#F14545",
  "#19F8F7",
]
const deviceStatusType = {
    ALARM: "报警",
    TROUBLE: "故障",
    OFFLINE: "离线",
    NORMAL: "正常",
}
const monitorSituationPieData = ref<{ label: string; value: number; color: string }[]>([]);
const alarmTotal = ref(0)
const alarmStatusData = ref<AlarmStatus[]>([
  {
    alarmNum: 10,
    alarmStatus: '',
    alarmStatusName: '处理中',
    color: '#FFC700'
  },
  {
    alarmNum: 10,
    alarmStatus: '',
    alarmStatusName: '挂起',
    color: '#74AEE7'
  },
  {
    alarmNum: 10,
    alarmStatus: '',
    alarmStatusName: '已处理',
    color: '#00F27B'
  },
  {
    alarmNum: 10,
    alarmStatus: '',
    alarmStatusName: '待确认',
    color: '#29C2FF'
  },
]);
const alarmData = ref(0);
const xData = ref<string[]>(['12-4','12-5','12-6','12-7','12-8']);
const yData = ref<number[]>([1,2,3,4,5]);
const alarmCon = ref({
  count: 0,
  ratio: 0,
});
const dataList = reactive<AlarmRateList[]>([
  {
    title: "设备总数",
    value: 0,
    ringRatio: false,
  },
  {
    title: "报警设备总数",
    value: 0,
    ringRatio: true,
    label: 0,
    unit: "%",
  },
]);
const hiddenDangerTime = ref<ModelValueItf>();
const deviceAlarmTime = ref<ModelValueItf>();
const changeHandleHiddenDangerTime = async()=>{}
const changeHandleDeviceAlarmTime = async()=>{}

// 设备实时数据
const deviceDataInfo = async () => {
    let res: any = await equipmentTotal({ sceneType: piniaStoreMenu.currentMenu,
    areaId: piniaStoreArea.currentAreaId});
    if (!res.deviceNum) {
        return;
    }
    monitorSituationPieData.value.length = 0;
    alarmTotal.value = 0;
    res.deviceStatusNums.forEach((item, index) => {
        alarmTotal.value += item.num;
        let obj = {
            label: deviceStatusType[item.name],
            color: colorList[index],
            value: item.num,
        };
        monitorSituationPieData.value.push(obj);
    });
};
// 设备报警趋势
const alarmTrendInfo = async () => {
  let param = {
    sceneType: piniaStoreMenu.currentMenu,
    areaId: piniaStoreArea.currentAreaId,
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
// 设备报警率
const equipmentAlarm = async () => {
  let param = {
    sceneType: piniaStoreMenu.currentMenu,
    areaId: piniaStoreArea.currentAreaId,
    period: deviceAlarmTime.value.dateRange.join(","),
    type: deviceAlarmTime.value.timeType,
  };
  let res = await equipmentAlarmRateData(param);
  alarmData.value = Math.round(Number(res.proportion) * 10000) / 100.0;
  dataList[0].value = Number(res.deviceTotal);
  dataList[1].value = Number(res.alarmNum);
  dataList[1].label = Math.round(Number(res.chainRatio) * 10000) / 100.0;
};
onMounted(()=>{
  deviceDataInfo()
})
</script>
<style lang="less" scoped>
.content {
    text-align: center;
    color: #fff;
    font-size: 14px;

    .total-num {
      font-size: 16px;
    }
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
.body-bum{
  margin-bottom:10px;
}
.chart {
    height: 220px;
}

.equipmentInfo {
  display: flex;
  justify-content: space-between;
  padding: 10px 10px 0 30px;
  align-items: center;
  height:300px;
}
</style>