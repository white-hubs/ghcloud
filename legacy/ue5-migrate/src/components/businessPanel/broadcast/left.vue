<template>
  <div >
    <SubPanelTemplate title="广播设备监控" class="alarm-event">
      <GridContainer :data="deviceStatistic" ></GridContainer>
      <div class="flex-between mg-10">
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
      <div class="footer">
         <RollTable :column="column" :data="listData" :limitScrollNum="4">
         </RollTable>
       </div>
    </SubPanelTemplate>
    <SubPanelTemplate title="广播设备报警趋势">
      <template #extra>
        <DateInlineForm
          v-model:modelValue="topTimeFrame"
          @search="getAlarmsNumber"
        ></DateInlineForm>
      </template>
      <div class="body">
        <OperateDays title="报警数" :value="alarmCon.count" class="body-num">
          <div class="extra flex-start">
            <div class="mode">环比</div>
            <div :class="['downtriangle', alarmCon.ratio > 0 && 'uptriangle']"></div>
            <div :class="[alarmCon.ratio < 0 ? 'down' : 'up']">{{ alarmCon.ratio }}%</div>
          </div>
        </OperateDays>
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
      </div>
    </SubPanelTemplate>
    <SubPanelTemplate title="设备类型分布">
      <div class="equipmentAlarm">
        <RoundPie :data="roundPieData" :eventNum="eventNum">
          <div class="content">
            <span>{{ alarmTotal }}</span> <br />设备总数
          </div>
        </RoundPie>
        <pieList :roundPieData="roundPieList"></pieList>
      </div>
    </SubPanelTemplate>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive,onMounted} from 'vue'
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
import SubPanelTemplate from "../public/subPanelTemplate.vue";
import GridContainer from "../public/gridContainer.vue";
import PlanPie from "../public/charts/pie/planePie.vue";
import LineChart from "../public/lineChart.vue";
import OperateDays from "../public/operateDays.vue";
import PieList from "../public/pieList.vue";
import RollTable from "../public/rollTable/index.vue";
import RoundPie from "../public/charts/roundPie/roundPie.vue";
import pieList from "../public/pieList.vue";
import { equipmentTotal } from '@/api/equipment'
import { statisticsTrend, statisticsStatus } from "@/api/alarm";
import { ModelValueItf } from '../public/types'
import { useStateStore } from '@/pages/state/use-state-store';
const { globalState } = useStateStore();
const deviceStatusType = {
    ALARM: "报警",
    TROUBLE: "故障",
    OFFLINE: "离线",
    NORMAL: "正常",
}
const colorList = [
  "#FFAB10",
  "#2F8DFF",
  "#F14545",
  "#19F8F7",
]
const topTimeFrame = ref<ModelValueItf>();
const alarmTotal = ref(0)
const deviceStatistic = ref([]);
const monitorSituationPieData = ref([]);
const xData = ref<string[]>([]);
const yData = ref<number[]>([]);
const column = [
  {
    title: "状态",
    dataIndex: "name",
    width: 120,
  },
  {
    title: "数量",
    dataIndex: "number",
  },
  {
    title: "占比",
    dataIndex: "value",
    width: 140,
  }
];
const listData = ref([
  {
    alarmTime:'111',
    alarmLevelName:'222',
    alarmEventName:'333'
  },
  {
    alarmTime:'xxx',
    alarmLevelName:'222',
    alarmEventName:'333'
  },
  {
    alarmTime:'aaa',
    alarmLevelName:'222',
    alarmEventName:'333'
  },
])
const lineData = reactive({
    title: "次",
    xData: ['4', '8', '12', '16', '20', '24'],
    yData: [
        {
            data: [1, 2, 4, 5, 6, 8, 7],
            name: "故障次数",
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
            data: [10, 12, 14, 5, 86, 8, 7],
            name: "告警次数",
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
const trafficList = reactive([
  {
    color: "#2989FF",
    label: "故障次数",
    value: 0,
  },
  {
    color: "#FF6E23",
    label: "告警次数",
    value: 0,
  },
]);
const roundPieData = ref([]);
const roundPieList = ref([]);
const eventNum = ref<number>(0);
const alarmCon = ref({
  count: 0,
  ratio: 0,
});
// 设备实时数据
const deviceDataInfo = async () => {
  let params = {
    sceneType: globalState.business.currentMenu,
    areaId: globalState.business.currentAreaId,
  }
    let res: any = await equipmentTotal(params);
    if (!res.deviceNum) {
        return;
    }
    monitorSituationPieData.value.length = 0;
    deviceStatistic.value.length = 0
    listData.value.length = 0
    roundPieData.value.length = 0
    roundPieList.value.length = 0
    alarmTotal.value = 0;
    res.deviceStatusNums.forEach((item, index) => {
        alarmTotal.value += item.num;
        let obj = {
            label: deviceStatusType[item.name],
            color: colorList[index],
            value: item.num,
        };
        monitorSituationPieData.value.push(obj);
        deviceStatistic.value.push({
          alarmStatusName: deviceStatusType[item.name],
            color: colorList[index],
            alarmNum: item.num,
        })
        const deviceList = {
          name:deviceStatusType[item.name],
          value:((item.num/res.deviceNum)*100).toFixed(2),
          number:item.num
        }
        //@ts-ignore
        listData.value.push(deviceList)
    });
    res.deviceGenreNums.forEach((item, index) => {
    let obj = {
      name: `${item.genreName}(${
        Math.round((item.num / res.deviceNum) * 10000) / 100.0
      }%)`,
      color: colorList[index],
      value: item.num,
    };
    roundPieData.value.push(obj);
    roundPieList.value.push({
      label:`${item.genreName}(${
        Math.round((item.num / res.deviceNum) * 10000) / 100.0
      }%)`,
      color: colorList[index],
      value: item.num,
    })
  });
};
// 报警状态统计&报警趋势折线图统计
async function getAlarmsNumber() {
  let params = {
    sceneType: globalState.business.currentMenu,
    areaId: globalState.business.currentAreaId,
    period: topTimeFrame.value.dateRange.join(","),
    type: topTimeFrame.value.timeType,
  };
  xData.value.length = 0;
  yData.value.length = 0;
  let Status = await statisticsStatus(params);
  let Trend = await statisticsTrend(params);
  alarmCon.value = {
    count: Status.alarmNum,
    ratio: Status.chainRatio,
  };
  Trend.forEach((item) => {
    let time = "";
    if (params.type === "TODAY") {
      time = "时";
    } else if (params.type === "THIS_YEAR") {
      time = "月";
    } else {
      time = "号";
    }
    xData.value.push(item.period + time);
    yData.value.push(item.alarmNum);
  });
}
const changeAlarmTime =async () => {}
onMounted(()=>{
  deviceDataInfo();
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
  .mg-10{
    margin-top:10px;
  }
  .chart {
        height: 200px;
  }
  .trafficBox {
    display: flex;
    align-items: center;
    justify-content: space-around;
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