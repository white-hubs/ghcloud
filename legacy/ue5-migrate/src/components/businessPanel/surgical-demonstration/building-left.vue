<template>
    <div >
        <SubPanelTemplate title="设备在线情况" class="supply-merchant">
            <situationAnalysis imgPath="overView5.png" :statistic="deviceSituationAnalysis"
                @click-num="handelClickDeviceNum"></situationAnalysis>
            <div class="chart">
                <pieGuidance :y-data="yData"></pieGuidance>
            </div>
        </SubPanelTemplate>
        <SubPanelTemplate title="异常设备清单" class="product-table">
            <div class="dataTitle">
                <div class="dataTitle-left">
                    当前未处理：<span>45</span>
                </div>
                <div class="dataTitle-right" style="color: #5EA6FF;" @click="handleAll">查看全部>></div>
            </div>
            <RollTable :column="product.column" :data="product.tableData">
                <template #situation="{ record }">
                    <span v-if="record.situation === 'ALARM_UN_CONFIRMED'" style="color: #f14545">待处理</span>
                    <span v-else-if="record.situation === 'ALARM_PROGRESS_CONFIRMED'" style="color: #ffab10">处理中</span>
                    <span v-else="record.situation === 'ALARM_CONFIRMED'" style="color: #00f27b">已处理</span>
                </template>
            </RollTable>
        </SubPanelTemplate>
        <SubPanelTemplate title="告警类型TOP5">
            <template #extra>
                <DateInlineForm v-model:modelValue="workOrderTime" @search="changeHandleworkOrderTime"></DateInlineForm>
            </template>
            <div class="chart">
                <barChart :title="''" :x-data="alarmType.xData"
                    :data="[{ color: '#1890FF', name: '', data: alarmType.yData }]" class="columnBox" />
            </div>
        </SubPanelTemplate>
    </div>
    <!-- 异常设备清单弹窗 -->
    <FailedEquipmentModal title="异常设备清单" v-model="deviceModal" @close="closeModal" :footer="null" />
</template>
<script setup lang="ts">
import { onMounted, reactive, ref, onUnmounted } from "vue";
import situationAnalysis from "../overview/situation-analysis.vue";
import SubPanelTemplate from "../public/subPanelTemplate.vue";
import DateInlineForm from "../public/dateInlineForm.vue";
import barChart from "../public/charts/bar/barChart.vue";
import RollTable from "../public/rollTable/index.vue";
import pieGuidance from "../public/charts/pie/pie-guidance.vue"
import { ModelValueItf } from "../public/types";
import { AlarmTypeTop } from '@/mock/elevator-monitoring'
import moment from "moment";
import FailedEquipmentModal from './components/failed-equipment-modal.vue';

const deviceModal = ref<boolean>(false);

const handleAll = () => {
    deviceModal.value = true
}
const closeModal = () => {
    deviceModal.value = false;
};

const deviceModalShow = ref<boolean>(false);
const deviceParameter = ref<Record<string, any>>({
    status: "",
});
const workOrderTime = ref<ModelValueItf>();
const deviceSituationAnalysis = reactive({
    title: "设备总数",
    total: 0,
    itemize: [
        {
            label: "在线",
            value: 0,
            color: "#35D93D",
            key: "NORMAL",
        },
        {
            label: "离线",
            value: 0,
            color: "#D0DEEE",
            key: "OFFLINE",
        },
        {
            label: "故障",
            value: 0,
            color: "#FFC700",
            key: "TROUBLE",
        },
        {
            label: "报警",
            value: 0,
            color: "#F14545",
            key: "ALARM",
        },
    ],
});
const product = reactive({
    column: [
        {
            title: "设备名称",
            dataIndex: "name",
        },
        {
            title: "异常情况",
            dataIndex: "situation",
            slots: {
                customRender: "situation",
            },
        },
        {
            title: "上报时间",
            dataIndex: "time",
        },
    ],
    tableData: [
        {
            time: moment().format("YYYY-MM-DD"),
            name: "术野摄像机",
            situation: "离线",
        },
        {
            time: moment().format("YYYY-MM-DD"),
            name: "术野摄像机",
            situation: "离线",
        },
        {
            time: moment().format("YYYY-MM-DD"),
            name: "术野摄像机",
            situation: "离线",
        },
        {
            time: moment().format("YYYY-MM-DD"),
            name: "摄像头",
            situation: "离线",
        },
        {
            time: moment().format("YYYY-MM-DD"),
            name: "摄像头",
            situation: "故障",
        },
        {
            time: moment().format("YYYY-MM-DD"),
            name: "摄像头",
            situation: "告警",
        },
        {
            time: moment().format("YYYY-MM-DD"),
            name: "摄像头",
            situation: "告警",
        },
    ],
});

const yData = ref([
    { name: '在线', value: 5.6, itemStyle: { color: "#2AE8BD" } },
    { name: '离线', value: 1, itemStyle: { color: "#2970FF" } },
])
const alarmType = reactive({
    xData: ['心脏内科', '耳鼻喉科', '烧伤科', '心脏外科', '呼吸道科'],
    yData: [5, 8, 10, 15, 20]
})
const handelClickDeviceNum = (item?: any) => {
    deviceModalShow.value = true;
    deviceParameter.value = { status: item?.key };
};
const handleClickItemize = (item: any) => {
    deviceParameter.value = {
        areaId: item.areaId,
        applicationCode: 'SECURITY_MONITORING'
    }
    deviceModalShow.value = true
}
const changeHandleworkOrderTime = () => {
    alarmType.yData = AlarmTypeTop(workOrderTime.value.timeType)
};
let timer = null
let fakeIndex = 1
const fakeData = [
    [15, 0, 1, 1],
    [17, 1, 0, 2],
    [20, 2, 3, 1],
    [18, 1, 3, 4],
    [25, 3, 1, 2]
]
const pieYdata = [
    [20, 4],
    [25, 17],
    [32, 4],
    [50, 11],
    [43, 29],
]
onMounted(() => {
    timer = setInterval(() => {
        deviceSituationAnalysis.itemize[0].value = fakeData[fakeIndex][0]
        deviceSituationAnalysis.itemize[1].value = fakeData[fakeIndex][1]
        deviceSituationAnalysis.itemize[2].value = fakeData[fakeIndex][2]
        deviceSituationAnalysis.itemize[3].value = fakeData[fakeIndex][3]
        deviceSituationAnalysis.total = 0
        deviceSituationAnalysis.itemize.forEach(item => {
            deviceSituationAnalysis.total += item.value
        })
        yData.value[0].value = pieYdata[fakeIndex][0]
        yData.value[1].value = pieYdata[fakeIndex][1]
        fakeIndex++
        if (fakeIndex > fakeData.length - 1) {
            fakeIndex = 0
            clearInterval(timer)
        }
    }, (window as any).config.pageLoopRequestTime)
})
onUnmounted(() => {
    clearInterval(timer)
})
</script>
<style lang="less" scoped>
.panel {
    .dataTitle {
        display: flex;
        justify-content: space-between;
        align-items: center;
        color: #ABB8CB;
        font-size: 14px;

        .dataTitle-left {
            display: flex;
            justify-content: space-between;
            align-items: center;
            background: linear-gradient(270deg,  rgba(255,199,0,0) 0%,rgba(255,199,0,0.5) 100%);
            span {
                color: #FFC700;
            }
        }

        .dataTitle-right {
            cursor: pointer;
        }
    }

    .product-table {
        height: 260px;
    }

    .chart {
        height: 220px;
    }

    .content {
        text-align: center;
        color: #fff;
        font-size: 14px;

        .total-num {
            font-size: 16px;
        }
    }
}
</style>
  