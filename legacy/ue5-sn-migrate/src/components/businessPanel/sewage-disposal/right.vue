<template>
  <div class="panel">
    <SubPanelTemplate title="设备报警趋势">
      <template #extra>
        <DateInlineForm v-model:modelValue="topTimeFrame" @search="getAlarmsNumber"></DateInlineForm>
      </template>
      <div class="body">
        <OperateDays title="报警数" :value="alarmInfo.count" class="body-num">
          <div class="ringRatio">
            <span>环比</span>
            <!-- uptriangle 向上三角根据Prop改变 -->
            <div :class="['downtriangle', alarmInfo.ratio > 0 && 'uptriangle']"></div>
            <div :class="[alarmInfo.ratio > 0 ? 'up' : 'down']">
              {{ alarmInfo.ratio + "%" }}
            </div>
          </div>
        </OperateDays>
        <GridContainer :data="alarmStatusData"></GridContainer>
        <div class="chart">
          <LineChart :gridTop="'0'" :x-data="xData" :series="[
              {
                data: yData,
                linearGradientColor: ['rgb(86, 142, 255)', 'rgb(86, 142, 255,0)'],
              },
            ]" />
        </div>
      </div>
    </SubPanelTemplate>
    <SubPanelTemplate title="事件区域top5" class="alarm-event">
      <template #extra>
        <DateInlineForm v-model:modelValue="handleTime" @search="areaAlarmStatistic"></DateInlineForm>
      </template>
      <div class="body" style="min-height: 190px">
        <EventAlarmItem v-for="(item, index) in areaAlarmRank" :sort="index + 1" :name="item.name"
          :linkRatio="item.chainRatio" :count="item.alarmNum" :ratio="item.ratio + '%'" />
      </div>
    </SubPanelTemplate>
    <SubPanelTemplate title="水处理实时数据">
      <div class="trafficBox">
        <traffic :unit="'项'" v-for="item in trafficList" :key="item.color" :trafficInfo="item"></traffic>
      </div>
      <RollTable :column="alarmColumn" :data="listData" :showLength="6">
        <template #index="{ record }">
          <span v-if="record.index === 'ammonianitrogen'">氨氮</span>
          <span v-else-if="record.index === 'paracolon'">大肠杆菌</span>
          <span v-else>{{ record.index }}</span>
        </template>
        <template #inlet="{ record }">
          <span v-if="record.index === 'paracolon'">{{ record.inlet?`${record.inlet} CFU/ml`:'--' }} </span>
          <span v-else-if="record.index === 'PH'">{{ record.inlet?record.inlet:'--' }} </span>
          <span v-else>{{ record.inlet?`${record.inlet} mg/L`:'--' }} </span>
        </template>
        <template #effluent="{ record }">
          <span v-if="record.index === 'paracolon'">{{ record.effluent?`${record.effluent} CFU/ml`:'--' }} </span>
          <span v-else-if="record.index === 'PH'">{{ record.effluent?record.effluent:'--' }} </span>
          <span v-else>{{ record.effluent?`${record.effluent} mg/L`:'--' }} </span>
          <ArrowUpOutlined v-if="record.exceeding" :style="{color:'red'}"></ArrowUpOutlined>
        </template>
      </RollTable>
    </SubPanelTemplate>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive,onMounted} from 'vue'
import { ArrowUpOutlined , StarFilled, StarTwoTone } from '@ant-design/icons-vue';
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
import SubPanelTemplate from "../public/subPanelTemplate.vue";
import { ModelValueItf } from '../public/types'
import traffic from "../public/traffic.vue";
import { storeArea } from "@/piniaStore/area";
import OperateDays from "../public/operateDays.vue";
import LineChart from "../public/lineChart.vue";
import RollTable from "../public/rollTable/index.vue";
import { storeMenu } from "@/piniaStore/menu";
import { statisticsAreaTop } from '@/api/alarm'
import EventAlarmItem from "../public/eventAlarmItem.vue";
import GridContainer from "../public/gridContainer.vue";
import { AlarmAreaTop, AlarmStatus } from '@/api/models/alarm'
import { alarmTrend, equipmentNumber } from '@/utils/requestData/alarm'
import { waterTreatment } from '@/api/device'

const piniaStoreMenu = storeMenu();
const piniaStoreArea = storeArea();
const topTimeFrame = ref<ModelValueItf>();
const handleTime = ref<ModelValueItf>();
const xData = ref<string[]>([]);
const yData = ref<number[]>([]);
const areaAlarmRank = ref<AlarmAreaTop[]>([]);
const trafficList = reactive([
  {
    color: "#2989FF",
    label: "监测",
    value: 6,
  },
  {
    color: "#FF6E23",
    label: "异常",
    value: 0,
  },
]);
const alarmInfo = reactive({
  count: 0,
  ratio: 0,
});
const dataExceeding = {
  codcr:250,
  bod5:100,
  ss:60,
  ammonianitrogen:45,
  paracolon:5000,
}
const alarmColumn = [
  {
    title: "指标",
    dataIndex: "index",
    slots: {
      customRender: "index",
    },
    width: 120,
  },
  {
    title: "进水(mg/L)",
    dataIndex: "inlet",
    slots: {
      customRender: "inlet",
    },
  },
  {
    title: "出水(mg/L)",
    dataIndex: "effluent",
    slots: {
      customRender: "effluent",
    },
    width: 140,
  }
];
const listData = ref([
  {
    index:'CODcr',
    inlet:'',
    effluent:'',
    exceeding:false,
  },
  {
    index:'BOD5',
    inlet:'',
    exceeding:false,
    effluent:''
  },
  {
    index:'SS',
    inlet:'',
    exceeding:false,
    effluent:''
  },
  {
    index:'ammonianitrogen',
    inlet:'',
    exceeding:false,
    effluent:''
  },
  {
    index:'paracolon',
    inlet:'',
    exceeding:false,
    effluent:''
  },
  {
    index:'PH',
    inlet:'',
    exceeding:false,
    effluent:''
  }
])
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
// 报警状态统计&报警趋势折线图统计
async function getAlarmsNumber() {
  let params = {
    sceneType: piniaStoreMenu.currentMenu,
    areaId: piniaStoreArea.currentAreaId,
    period: topTimeFrame.value.dateRange.join(","),
    type: topTimeFrame.value.timeType,
  };
  xData.value.length = 0;
  yData.value.length = 0;
  let res: any = await alarmTrend(params);
  let data: any = await equipmentNumber(params);
  alarmStatusData.value = data.alarmStatusStatistics;
  xData.value = res.xdata;
  yData.value = res.ydata;
  Object.assign(alarmInfo,{
    count: data.alarmNum,
    ratio: data.chainRatio,
  })
}
/**
 * 区域报警Top5
 */
 const areaAlarmStatistic = async () => {
  let params = {
    sceneType: piniaStoreMenu.currentMenu,
    areaId: piniaStoreArea.currentAreaId,
    period: handleTime.value.dateRange.join(","),
    type: handleTime.value.timeType,
  };
  areaAlarmRank.value = await statisticsAreaTop(params);
};

const getWaterTreatment = async () => {
  const res = await waterTreatment()
  trafficList[1].value = 0
  listData.value.forEach(item=>{
    for (const key in res) {
       if (key.split('_')[0].toUpperCase()  === item.index.toUpperCase() ) {
        res[key] = Number(res[key])
        if (key.split('_')[1] === 'in') {
          item.inlet = res[key]
        }else{
          item.effluent = res[key]
          if (res[key]>dataExceeding[key.split('_')[0]]) {
            item.exceeding = true
            trafficList[1].value++
          }
        }
        if (key.split('_')[0].toUpperCase() === 'PH' && key.split('_')[1] === 'out') {
          if (res[key]&&!(res[key]>=6 && res[key]<=9)) {
            item.exceeding = true
            trafficList[1].value++
          }
        }
       }
    }
  })
   
}
onMounted(()=>{
  getWaterTreatment()
})
</script>
<style lang="less" scoped>
.body-num {
  margin-bottom: 10px;
}

.ringRatio {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 12px;
  margin-left: 6px;
}

.chart {
  height: 180px;
}

.trafficBox {
  display: flex;
  align-items: center;
  justify-content: space-around;
  margin-bottom: 12px;
}

.body-num {
  margin-bottom: 10px;
}
</style>