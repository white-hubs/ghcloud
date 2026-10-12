<template>
    <div >
        <SubPanelTemplate title="发布信息总览">
            <OperateDays title="全部信息数" :value="infoData.deviceNum" class="body-num"></OperateDays>
            <div class="body">
                <RollTable @clickRow="clickRow" :column="column" :data="infoData.devices">
                </RollTable>
            </div>
        </SubPanelTemplate>
        <SubPanelTemplate title="报警级别统计" class="alarm-level">
            <template #extra>
                <DateInlineForm v-model:modelValue="topTimeFrame" @search="changeTopTimeFrame"></DateInlineForm>
            </template>
            <div class="body">
                <div class="chart">
                    <Pie3D :data="fakeData" label-key="name" value-key="alarmNum" />
                </div>
                <div class="footer">
                    <AlarmStatisticsItem v-for="(item, index) in fakeData" :key="item.name" :level="index + 1"
                        :alarmNum="item.alarmNum" :chainRatio="item.chainRatio" :name="item.name" :is-grow="item.isGrow" />
                </div>
            </div>
        </SubPanelTemplate>
        <SubPanelTemplate title="设备报警Top5" class="alarm-event">
            <template #extra>
                <DateInlineForm v-model:modelValue="handleTime" @search="areaAlarmStatistic"></DateInlineForm>
            </template>
            <div class="body" style="min-height: 250px">
                <EventAlarmItem v-for="(item, index) in areaAlarmRank" :sort="index+1" :name="item.name"
                    :linkRatio="item.chainRatio" :count="item.alarmNum" :ratio="item.ratio + '%'" />
            </div>
        </SubPanelTemplate>
    </div>
    <modal-table :show="showModal" title="发布内容监控" @close="showModal=false">
        <monitoringContent></monitoringContent>
    </modal-table>
</template>

<script setup lang="ts">
import { ref, reactive, toRefs, onMounted, onUnmounted } from 'vue'
import SubPanelTemplate from "../public/subPanelTemplate.vue";
import Pie3D from "../public/charts/pie/pie.vue";
import AlarmStatisticsItem from "../public/alarmStatisticsItem.vue";
import DateInlineForm from "../public/dateInlineForm.vue";
import RollTable from "../public/rollTable/index.vue";
import EventAlarmItem from "../public/eventAlarmItem.vue";
import modalTable from "@/components/modal-table/modal.vue";
import { ModelValueItf } from '../public/types'
import { storeArea } from "@/piniaStore/area";
import { storeMenu } from "@/piniaStore/menu";
import { AlarmAreaTop, AlarmLevelType } from '@/api/models/alarm'
import { statisticsDeviceTop, statisticsLevel } from '@/api/alarm'
import monitoringContent from "./components/monitoring-content.vue";
import OperateDays from "../public/operateDays.vue";
import { equipmentTotal } from '@/api/equipment';
import { useStateStore } from '@/pages/state/use-state-store';

const handleTime = ref<ModelValueItf>();
let topTimeFrame = ref<ModelValueItf>();
let showModal = ref(false);
const { globalState } = useStateStore()
const areaAlarmRank = ref<AlarmAreaTop[]>([]);
const infoData = reactive({
    deviceNum:0,
    devices:[]
})
const fakeData = ref<AlarmLevelType[]>([
  {
    alarmNum: 0,
    name: "一级报警",
    chainRatio: 0,
    isGrow: false,
  },
]);
const column = reactive([
  {
    title: "设备名称",
    dataIndex: "deviceName",
  },
  {
    title: "所属区域",
    dataIndex: "areaName",
  },
  {
    title: "设备状态",
    dataIndex: "deviceStatus",
  }
]);

// 设备实时数据
const deviceDataInfo = async () => {
  let params = {
    sceneType: globalState.business.currentMenu,
    areaId: globalState.business.currentAreaId,
  }
    let res: any = await equipmentTotal(params);
    Object.assign(infoData,res)
    if (!res.deviceNum) {
        return;
    }
    
};
// 报警级别分布
function changeTopTimeFrame() {
  getAlarmLevel();
}
// 获取报警级别分布数据
async function getAlarmLevel() {
  let params = {
    sceneType: globalState.business.currentMenu,
    areaId: globalState.business.currentAreaId,
    period: topTimeFrame.value?.dateRange.join(","),
    type: topTimeFrame.value?.timeType,
  };
  let res = await statisticsLevel(params);
  fakeData.value = res.map((item) => {
    item.chainRatio <= 0 ? (item.isGrow = false) : (item.isGrow = true);
    item.name += "报警";
    return item;
  });
}
/**
 * 区域报警Top5
 */
 const areaAlarmStatistic = async () => {
  let params = {
    sceneType: globalState.business.currentMenu,
    areaId: globalState.business.currentAreaId,
    period: handleTime.value.dateRange.join(","),
    type: handleTime.value.timeType,
  };
  const res = await statisticsDeviceTop(params);
  areaAlarmRank.value = res;
};
// 发布信息总览
const informationOverview = async ()=>{
}
const clickRow = ()=>{
    showModal.value = true
}
onMounted(()=>{
    informationOverview()
    deviceDataInfo()
})
</script>
<style scoped lang="less">
.chart {
    height: 140px;
}

.product-table {
    height: 360px;

    .radioBar {
        text-align: right;
        margin: 6px 0;

        :deep(.ant-radio-button-wrapper) {
            height: 28px;
            line-height: 28px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 2px 2px 2px 2px;
            font-size: 12px;
            color: #ABB8CB;
            margin-left: 6px;

            background: rgba(216, 216, 216, .1) !important;
            border: 1px solid rgba(96, 112, 128, 0.6) !important;
            border-radius: 2px;
            color: #fff;
        }

        :deep(.ant-radio-button-wrapper-checked) {
            background: rgba(216, 216, 216, .1) !important;
            border: 1px solid rgba(96, 112, 128, 0.6) !important;
            border-radius: 2px;
            color: #fff;
        }
    }

    :deep(.ant-radio-button-wrapper:not(:first-child)::before) {
        display: none;
    }
}

.group {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;

    .camera {
        width: 168px;
        height: 90px;
        margin-top: 10px;
    }
}

.alarm-level {
    height: 350px;
    .chart {
        display: flex;
        height: 120px;
    }

    .footer {
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;
    }
}

.body {
    height: 140px;
    margin-top: 10px;
}
</style>