<template>
    <div class="panel">
        <SubPanelTemplate title="设备情况总览">
            <div class="monitorPanelBox">
                <monitorPanel @handel-click-itemize=" handelClickDeviceItemize(index)"
                    v-for="(item, index) in monitorPanelData" :key="item.name" :monitorPanelData="item"></monitorPanel>
            </div>
            <div class="elevator-analysis">
                <div class="chart">
                    <elevator-analysis-pie :pieData="pieData">
                        <div style="color: #fff;text-align: center;font-size: 14px;">{{ alarmTotal }}</div>
                        <div style="color: #fff;text-align: center;font-size: 14px;">总量</div>
                    </elevator-analysis-pie>
                </div>
                <elevatorAnalysisList :contentList="pieData" style="margin-left: 10px;"></elevatorAnalysisList>
            </div>
        </SubPanelTemplate>
        <SubPanelTemplate title="设备离线情况" class="product-table">
            <!-- <template #extra>
                <DateInlineForm v-model:modelValue="overviewTime" @search="changeHandleOverviewTime">
                </DateInlineForm>
            </template> -->
            <DeviceStatistics  @handel-click-itemize=" handelClickDeviceItemize" imgPath="overView21.png" :statistic="deviceStatisticsData"></DeviceStatistics>
            <RollTable :column="product.column" :data="product.tableData">
                <template #offline="{ record }">
                    <div style="display: flex;align-items: center;justify-content: center;">
                        <span class="offlineBox" style="background-color: #35D93D;"></span> <span
                        class="os1">{{ record.offline }}</span>
                    </div>
                </template>
                <template #onLine="{ record }">
                    <div style="display: flex;align-items: center;justify-content: center;">
                        <span class="offlineBox"></span> <span class="os1">{{ record.onLine }}</span>
                    </div>
                </template>
            </RollTable>
        </SubPanelTemplate>
        <SubPanelTemplate title="设备故障情况">
            <div class="faultBox" >
                <LightingRound class="LightingRoundBox" :data="roundData"></LightingRound>
                <div class="faultBox-right">
                    <faultBox :data="faultData"></faultBox>
                </div>
            </div>

        </SubPanelTemplate>
    </div>
    <modal-equipment-table :show-modal="deviceModalShow" @close="closeModal"
        :parameter="deviceParameter"></modal-equipment-table>
</template>

<script setup lang="ts">
import { ref, reactive, toRefs, onMounted, onUnmounted } from 'vue'
import monitorPanel from "@/components/businessPanel/hospital/monitor-panel.vue"
import elevatorAnalysisPie from "@/components/businessPanel/public/charts/pie/elevator-analysis-pie.vue"
import elevatorAnalysisList from "@/components/businessPanel/public/elevator-analysis-list.vue"
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
import LightingRound from "@/components/businessPanel/intelligent-lighting/components/lighting-round.vue";
import RollTable from "@/components/businessPanel/public/rollTable/index.vue";
import DeviceStatistics from "@/components/businessPanel/triage-queue/components/device-statistics.vue"
import modalEquipmentTable from "@/components/modal-table/modal-equipment-table.vue";
import faultBox from "./faultBox.vue"
import { EquipmentSituation } from '@/mock/hospital'
import { ModelValueItf } from '@/components/businessPanel/public/types'
const deviceModalShow = ref<boolean>(false);
const deviceParameter = ref<Record<string, any>>({
    status: "",
});
const deviceStatisticsData = reactive({
    title: "设备数",
    total: 334,
    itemize: [
        {
            name: '离线率',
            label: "离线",
            value: 14,
            key: "OFFLINE",
        }
    ]
});
const monitorPanelData = ref([
    {
        imgPath: 'overView5.png',
        value: 10,
        name: '系统总量'
    },
    {
        imgPath: 'overView29.png',
        value: 334,
        name: '设备总量'
    },
])
const faultData = ref([
    {
        color: '#2989FF',
        name: '设备数',
        value: 334
    },
    {
        color: '#FFC700',
        name: '故障数',
        value: 32
    },
])
const pieData = ref([
{
    name: '正常',
    value: 300,
    color: '#2AE8BD',
  },
  {
    name: '离线',
    value: 14,
    color: '#2989FF',
  },
  {
    name: '故障',
    value: 10,
    color: '#FFC700',
  },
  {
    name: '告警',
    value: 10,
    color: '#F14545',
  },
])
const roundData = reactive([
    {
        statistic: { title: '故障率', total: ' 9.58%' },
    }
])
const overviewTime = ref<ModelValueItf>()
const product = reactive({
    column: [
        {
            title: "系统名称",
            dataIndex: "name",
        },
        {
            title: "在线",
            dataIndex: "offline",
            slots: {
                customRender: "offline",
            },
        },
        {
            title: "离线",
            dataIndex: "onLine",
            slots: {
                customRender: "onLine",
            },
        },
    ],
    tableData: [
        {
            name: '给排水',
            offline: 45,
            onLine: 5,
        },
        {
            name: '送排风',
            offline: 37,
            onLine: 3,
        },
        {
            name: '空调管理',
            offline: 40,
            onLine: 3,
        },
        {
            name: '智能照明',
            offline: 176,
            onLine: 3,
        },
        {
            name: '净水系统',
            offline: 20,
            onLine: 2,
        },
    ],
});
const changeHandleOverviewTime = () => {
};
let alarmTotal = ref<number>(334)
let timer = null
let fakeIndex = 1
const handelClickDeviceItemize = (item?: any) => {

    if (item !== 0) {
        deviceModalShow.value = true;
    }
    // deviceParameter.value = { applicationCode: item?.applicationCode };
}
const closeModal = () => {
    deviceModalShow.value = false;
};
const fakeData = [
    { total: 3345, offlineNum: 234 },
    { total: 3345, offlineNum: 635 },
    { total: 3345, offlineNum: 1201 },
    { total: 3345, offlineNum: 1549 },
    { total: 3345, offlineNum: 2134 },
]
onMounted(() => {
    timer = setInterval(() => {
        // pieData.value = EquipmentSituation(fakeIndex)
        // alarmTotal.value = pieData.value[3].value
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
<style scoped lang="less">
.monitorPanelBox {
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.elevator-analysis {
    display: flex;
    justify-content: space-between;
    padding: 10px 10px;
    align-items: center;
}

.chart {
    width: 250px;
    height: 180px;
}

.offlineBox {
    display: inline-block;
    width: 6px;
    height: 6px;
    background: #D0DEEE;
    border-radius: 50%;
}

.faultBox {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-top: 20px;

    .LightingRoundBox {
        flex: 1
    }
}

.product-table {
    height: 360px;
}
.os1{
    margin-left: 4px; font-size: 14px !important;
}
</style>