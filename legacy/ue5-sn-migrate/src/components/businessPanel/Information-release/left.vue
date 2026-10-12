<template>
    <div class="panel">
        <SubPanelTemplate title="设备状态总览">
            <div class="chart">
                <pieGuidance :y-data="yData"></pieGuidance>
            </div>
        </SubPanelTemplate>
        <SubPanelTemplate title="设备分类统计">
            <div class="appointment-data">
                <!-- <pieGuidance :y-data="monitorSituationPieData">
                </pieGuidance> -->
                <PlanPie :pieData="monitorSituationPieData">
                    <img :src="getAssetsImage('business-icon/triage-queue-appointment.png')" />
                </PlanPie>
                <elevatorAnalysisList :contentList="monitorSituationPieData" style="margin-left: 10px;">
                </elevatorAnalysisList>
            </div>
        </SubPanelTemplate>
        <SubPanelTemplate title="报警记录" class="product-table">
            <template #extra>
                <DateInlineForm v-model:modelValue="takeNotes" @search="changeTakeNotes"></DateInlineForm>
            </template>
            <div class="footer">
                <RollTable :column="column" :data="listData" :limitScrollNum="4">
                    <template #alarmStatus="{ record }">
                        <span v-if="record.alarmStatus === 'ALARM_UN_CONFIRMED'" style="color: #f14545">待处理</span>
                        <span v-else-if="record.alarmStatus === 'ALARM_PROGRESS_CONFIRMED'"
                            style="color: #ffab10">处理中</span>
                        <span v-else="record.alarmStatus === 'ALARM_CONFIRMED'" style="color: #00f27b">已处理</span>
                    </template>
                </RollTable>
            </div>
        </SubPanelTemplate>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, toRefs, onMounted } from 'vue'
import SubPanelTemplate from "../public/subPanelTemplate.vue";
import DateInlineForm from "../public/dateInlineForm.vue";
import pieGuidance from "../public/charts/pie/pie-guidance.vue"
import RollTable from "../public/rollTable/index.vue";
import PlanPie from "@/components/businessPanel/public/charts/pie/planePie.vue";
import elevatorAnalysisList from "../public/elevator-analysis-list.vue"
import { getAssetsImage } from '@/utils/getImage';
import useCommon from '@/components/hooks/useCommon'
import { storeMenu } from '@/piniaStore/menu'
import { storeArea } from '@/piniaStore/area'
import { alarmStatisticsList, recordStatus } from '@/api/alarm'
import moment from 'moment'
import { ModelValueItf } from '../public/types'

const piniaStoreMenu = storeMenu();
const piniaStoreArea = storeArea();
let takeNotes = ref<ModelValueItf>();

const { getEquipmentNumber } = useCommon()
let deviceStatusType = {
    'ALARM': '报警',
    'TROUBLE': '故障',
    'OFFLINE': '离线',
    'NORMAL': '正常',
}
let colorList = ['#328BF7', '#19F8F7', '#FFC700', '#EF424A']
const yData = ref([
    { name: '在线', value: 5.6, itemStyle: { color: "#2F8DFF" } },
    { name: '离线', value: 1, itemStyle: { color: "#2AE8BD" } },
    { name: '关屏', value: 1, itemStyle: { color: "#ccc" } },
])
const listData = ref<{ label: string; value: number; color?: string }[]>([])

const product = reactive({
    column: [
        {
            title: "设备名称",
            dataIndex: "name",
        },
        {
            title: "离线时间",
            dataIndex: "offlineDuration",
        },
        {
            title: "离线时长",
            dataIndex: "offlineTime",
        },
    ],
    tableData: [
        {
            name: "门诊大厅屏01",
            offlineDuration: '6月16日 12:23',
            offlineTime: "1天2小时23分",
        },
        {
            name: "电梯屏01",
            offlineDuration: '6月15日 15:46',
            offlineTime: "2天1小时46分",
        },
        {
            name: "候诊屏04",
            offlineDuration: '6月1日5 13:13',
            offlineTime: "2天5小时13分",
        },
        {
            name: "门诊大厅屏01",
            offlineDuration: '6月16日 12:23',
            offlineTime: "1天2小时23分",
        },
    ],
});
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
    width: 140,
  },
  {
    title: "状态",
    dataIndex: "alarmStatus",
    slots: {
      customRender: "alarmStatus",
    },
  },
]);
const monitorSituationPieData = ref<{ name: string; value: number; color: string }[]>(
    [
        { name: "门诊大厅屏", value: 30000, color: "#FFAB10" },
        { name: "电梯屏", value: 2000, color: "#2F8DFF" },
        { name: "候诊排队屏", value: 748, color: "#F14545" },
        { name: "病房走廊屏", value: 6000, color: "#19F8F7" },
        { name: "诊间门口频", value: 6000, color: "#2AE8BD" },
    ]
);

// 报警记录
function changeTakeNotes() {
  getAlarmTakeNotes();
}
// 获取报警列表
async function getAlarmTakeNotes() {
  let params = {
    sceneType: piniaStoreMenu.currentMenu,
    areaId: piniaStoreArea.currentAreaId,
    period: takeNotes.value.dateRange.join(","),
    type: takeNotes.value.timeType,
    pageSize: 50,
    pageNumber: 1,
  };
  let res: any = await alarmStatisticsList(params);
  listData.value = res.records.map((item) => {
    return {
      ...item,
      alarmTime: moment(item.alarmTime).format("YYYY-MM-DD"),
    };
  });
}
const getEquipmentInfo = async () => {
    monitorSituationPieData.value.length = 0
    yData.value.length = 0
    let res:any = await getEquipmentNumber()
    if (!res.deviceNum) {
        return
    }
    res.deviceStatusNums.forEach((item, index) => {
        yData.value.push({
            name: deviceStatusType[item.name],
            value: item.num,
            itemStyle:{color:colorList[index]} 
        })
    })
    res.deviceGenreNums.forEach((item, index) => {
        monitorSituationPieData.value.push({
            name: item.genreName,
            value: item.num,
            color: colorList[index]
        })
    })
}
onMounted(()=>{
    getEquipmentInfo()
})
</script>
<style scoped lang="less">
.chart {
    height: 220px;
}

.product-table {
    height: 360px;
}

.content {
    text-align: center;
    color: #fff;
    font-size: 14px;

    .total-num {
        font-size: 16px;
    }
}

:deep(.policeList) {
    height: 200px;
}

.appointment-data {
    display: flex;
    align-items: center;
    height: 180px;
    margin-top: 20px;
}
</style>