<template>
  <div class="panel">
    <SubPanelTemplate title="交通灯控制状态分布">
      <div class="flex-between">
        <PlanPie :pieData="pieData">
          <div class="content">
            <div class="total-num">{{ alarmTotal }}</div>
            <div>设备总数</div>
          </div>
        </PlanPie>
        <PieList :roundPieData="pieData"></PieList>
      </div>
    </SubPanelTemplate>
    <SubPanelTemplate title="报警记录">
      <template #extra>
        <DateInlineForm
        v-model:modelValue="takeNotes"
        @search="changeTakeNotes"
        ></DateInlineForm>
      </template>
      <div class="body">
        <OperateDays
          title="报警总数"
          :value="alarmCon.count"
          class="body-num"
        ></OperateDays>
        <div class="pie-chart">
          <Pie :data="alarmsNumber" :x-data="pieDataAlarm" />
          <TipsCount
            v-for="(item, index) in pieDataAlarm"
            :status="String(index)"
            :count="item.value"
          />
        </div>
        <div class="footer">
          <RollTable
            :column="column"
            :data="listData"
            @click-row="handelClickRow"
          >
            <template #alarmStatus="{ record }">
              <span
                v-if="record.alarmStatus === 'ALARM_UN_CONFIRMED'"
                style="color: #f14545"
                >待处理</span
              >
              <span
                v-else-if="record.alarmStatus === 'ALARM_PROGRESS_CONFIRMED'"
                style="color: #ffab10"
                >处理中</span
              >
              <span
                v-else="record.alarmStatus === 'ALARM_CONFIRMED'"
                style="color: #00f27b"
                >已处理</span
              >
            </template>
          </RollTable>
        </div>
      </div>
    </SubPanelTemplate>
    <SubPanelTemplate title="设备在线情况">
      <div class="charts">
        <stackedBarChart :x-data="barXData" :y-data="barYData"></stackedBarChart>
      </div>
    </SubPanelTemplate>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive,onMounted} from 'vue'
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import DateInlineForm from "../public/dateInlineForm.vue";
import stackedBarChart from '@/components/businessPanel/Information-release/stacked-bar-chart.vue'
import PlanPie from "../public/charts/pie/planePie.vue";
import OperateDays from "../public/operateDays.vue";
import Pie from "../public/pie.vue";
import TipsCount from "../public/tipsCount.vue";
import RollTable from "../public/rollTable/index.vue";
import PieList from "../public/pieList.vue";
import { storeArea } from "@/piniaStore/area";
import { storeMenu } from "@/piniaStore/menu";
import { equipmentTotal } from '@/api/equipment'
import useCommon from '@/components/hooks/useCommon'
import bus from '@/utils/bus'
import { statusNum } from '@/api/securitymanagement'

const piniaStoreMenu = storeMenu();
const piniaStoreArea = storeArea();
const {
  takeNotes,
  getAlarmTakeNotes,
  getAlarmsNumber,
} = useCommon();
const barXData = ref<string[]>(['1号楼','2号楼','3号楼'])
const barYData = ref<{name:string; data: number[]; color:string;}[]>([
{
    name:'正常',
    data:[],
    color: '#2AE8BD'
    
  },  {
    name:'离线',
    data:[],
    color: '#2989FF'
  },
])
const column = reactive([
  {
    title: "报警时间",
    dataIndex: "alarmTime",
    width: 120,
  },
  {
    title: "报警级别",
    dataIndex: "alarmLevelName",
  },
  {
    title: "报警事件",
    dataIndex: "alarmEventName",
  },
  {
    title: "状态",
    dataIndex: "alarmStatus",
    slots: {
      customRender: "alarmStatus",
    },
  },
]);
const alarmTotal = ref(0)
const pieData = ref([]);
const deviceStatusType = {
    ALARM: "报警",
    TROUBLE: "故障",
    OFFLINE: "离线",
    NORMAL: "正常",
}
const colorList = [
  "#2F8DFF",
  "#D0DEEE",
  "#FFAB10",
  "#F14545",
]
const alarmCon = ref({
  count: 0,
  ratio: 10,
});
let listData = reactive([]);
let alarmsNumber = ref<number>(0);
let pieDataAlarm = reactive([]);
// 设备实时数据
const deviceDataInfo = async () => {
  let params = {
    sceneType: piniaStoreMenu.currentMenu,
    areaId: piniaStoreArea.currentAreaId,
  }
    let res: any = await equipmentTotal(params);
    if (!res.deviceNum) {
        return;
    }
    pieData.value.length = 0
    alarmTotal.value = 0;
    res.deviceStatusNums.forEach((item, index) => {
        alarmTotal.value += item.num;
        let obj = {
            label: deviceStatusType[item.name],
            color: colorList[index],
            value: item.num,
        };
        pieData.value.push(obj);
    });
};
const handelClickRow = (record) => {
  if (record.alarmTargetCode) {
    bus.emit("equipmentPosition", record);
  }
};
// 报警记录
async function changeTakeNotes() {
  let param = {
    sceneType: piniaStoreMenu.currentMenu,
    areaId: piniaStoreArea.currentAreaId,
    period: takeNotes.value.dateRange.join(","),
    type: takeNotes.value.timeType,
    pageSize: 1000,
    pageNumber: 1,
  };
  let data = await getAlarmTakeNotes(param);
  alarmCon.value = await getAlarmsNumber(param);
  listData = data.listData;
  alarmsNumber.value = data.alarmsNumber;
  pieDataAlarm = data.pieData;
}
const getStatusNum = async () => {
  const res = await statusNum({applicationCode:'TRAFFIC_LIGHT_SYS'})
  barXData.value = res.areaStatusNum.map(item=>{
    return item.areaName
  })
  barYData.value[0].data = res.areaStatusNum.map(item=>{
    return item.onNum
  })
  barYData.value[1].data = res.areaStatusNum.map(item=>{
    return item.offlineNum
  })
}
onMounted(()=>{
  deviceDataInfo()
  getStatusNum()
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
.body-num {
  margin: 10px 0;
}
.pie-chart {
  display: flex;
  height: 100px;
  justify-content: center;

  > div {
    width: 100px;
    align-items: center;
    margin-left: 10px;
  }
}
.footer{
  height: 200px;
}
.charts {
  height: 230px;
}
</style>