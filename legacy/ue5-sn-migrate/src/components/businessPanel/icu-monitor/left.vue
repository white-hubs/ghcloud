<template>
  <div class="panel">
    <SubPanelTemplate title="设备状态总览">
      <OperateDays title="设备总数" :value="deviceTotal">
      </OperateDays>
      <GridContainer :data="deviceStatistic" class="body-bum"></GridContainer>
      <div class="chart">
        <pieGuidance :y-data="yData" height="55%"></pieGuidance>
      </div>
    </SubPanelTemplate>
    <SubPanelTemplate title="设备报警明细"  style="maxHeight: 200px;" class="product-table">
      <template #extra>
        <div class="dataTitle">
          <div class="dataTitle-right" style="color: #5EA6FF;" @click="handleAll">查看更多>></div>
        </div>
      </template>
      <RollTable :column="alarmColumn" :data="alarmListData" :showLength="4">
        <template #alarmStatus="{ record }">
          <span v-if="record.alarmStatus === 'ALARM_UN_CONFIRMED'" style="color: #f14545">待接收</span>
          <span v-else-if="record.alarmStatus === 'ALARM_PROGRESS_CONFIRMED'" style="color: #ffab10">处理中</span>
          <span v-else="record.alarmStatus === 'ALARM_CONFIRMED'" style="color: #00f27b">已处理</span>
        </template>
      </RollTable>
    </SubPanelTemplate>
    <SubPanelTemplate title="设备报警趋势" class="alarm-event">
      <DateInlineForm v-model:modelValue="trend" @search="alarmTrendInfo"></DateInlineForm>
      <OperateDays :value="alarmNum" title="报警总数">
        <div class="ringRatio">
          <span>环比</span>
          <!-- uptriangle 向上三角根据Prop改变 -->
          <div :class="['downtriangle', chainRatio > 0 && 'uptriangle']"></div>
          <div :class="[chainRatio > 0 ? 'up' : 'down']">{{ chainRatio + "%" }}</div>
        </div>
      </OperateDays>
      <GridContainer style="margin-top: 12px" :data="alarmStatusData"></GridContainer>
      <LineChart :x-data="xData.arr" :series="series" :title="'次'"></LineChart>
    </SubPanelTemplate>
    <!-- 设备报警记录弹窗 -->
    <modal-alarm-table :show-modal="deviceModal" @close="closeModal" :parameter="alarmParameter"></modal-alarm-table>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive,onMounted} from 'vue'
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import pieGuidance from "../public/charts/pie/pie-guidance.vue"
import modalAlarmTable from "@/components/modal-table/modal-alarm-tableNew.vue";
import { storeArea } from "@/piniaStore/area";
import { storeMenu } from "@/piniaStore/menu";
import { ModelValueItf } from '../public/types'
import GridContainer from "../public/gridContainer.vue";
import RollTable from "../public/rollTable/index.vue";
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
import LineChart from "@/components/businessPanel/public/lineChart.vue";
import OperateDays from "../public/operateDays.vue";
import useCommon from '@/components/hooks/useCommon'
import { alarmStatisticsList } from '@/api/alarm'
import { alarmTrend, equipmentNumber } from '@/utils/requestData/alarm'

const piniaStoreMenu = storeMenu();
const piniaStoreArea = storeArea();
//设备状态总览==================================================================
const deviceTotal = ref(0);
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
const deviceStatistic = ref([]);
const yData = ref([
    { name: '正常', value: 5.6, itemStyle: { color: "#2F8DFF" } },
    { name: '离线', value: 1, itemStyle: { color: "#2AE8BD" } },
    { name: '故障', value: 1, itemStyle: { color:  "#7786a3" } },
    { name: '告警', value: 1, itemStyle: { color: "#f7c741" } },
])
//设备报警明细=========================================================================
const alarmColumn = [
  {
    title: "设备名称",
    dataIndex: "alarmTargetName",
    width: 120,
  },
  {
    title: "所属区域",
    dataIndex: "areaName",
  },
  {
    title: "报警事件",
    dataIndex: "alarmEventName",
  },
  {
    title: "当前状态",
    dataIndex: "status",
    width: 140,
    slots: {
      customRender: "alarmStatus",
    },
  }
];
const alarmListData = ref([])
const deviceModal = ref<boolean>(false);
const alarmParameter = ref<Record<string, any>>({});
const handleAll = () => {
  deviceModal.value = true
}
const closeModal = () => {
    deviceModal.value = false;
};
//设备报警趋势==============================================================================
const trend = ref<ModelValueItf>();
let alarmStatusData = reactive([]);
const alarmNum = ref<number>(0);
const chainRatio = ref<number>(0);
const xData = reactive({
  arr: ["1时", "2时", "3时", "4时", "5时"],
});
const series = reactive([
  {
    data: [0],
    linearGradientColor: ["rgb(86, 142, 255)", "rgb(86, 142, 255,0)"],
  },
]);
//数据请求===========================================================================================
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

    })
}
// 获取报警列表
async function getAlarmTakeNotes() {
  let params = {
    sceneType: piniaStoreMenu.currentMenu,
    areaId: piniaStoreArea.currentAreaId,
    pageSize: 50,
    pageNumber: 1,
  };
  let res: any = await alarmStatisticsList(params);
  alarmListData.value = res.records.map((item) => {
    return {
      ...item
    };
  });
}
//获取报警趋势
const alarmTrendInfo = async () => {
  let param = {
    sceneType: piniaStoreMenu.currentMenu,
    areaId: piniaStoreArea.currentAreaId,
    period: trend.value.dateRange.join(","),
    type: trend.value.timeType,
  };
  let res: any = await alarmTrend(param);
  let data: any = await equipmentNumber(param);
  alarmStatusData = data.alarmStatusStatistics;
  alarmNum.value = data.alarmNum;
  chainRatio.value = data.chainRatio;
  xData.arr = res.xdata;
  series[0].data = res.ydata;
};
onMounted(()=>{
  getEquipmentInfo()
  getAlarmTakeNotes()
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
.ringRatio {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 12px;
  margin-left: 6px;
}
.chart{
  height: 200px;
}
</style>