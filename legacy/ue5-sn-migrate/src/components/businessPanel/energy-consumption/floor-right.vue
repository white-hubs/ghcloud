<template>
    <div class="panel">
        <SubPanelTemplate title="费用信息">
            <template #extra>
                <DateInlineForm v-model:modelValue="costTime" @search="changecostTime"></DateInlineForm>
            </template>
            <div class="flex-between">
                <PlanPie :pieData="monitorSituationPieData">
                    <div class="content">
                        <div class="total-num">{{ total }}元</div>
                        <div>费用金额</div>
                    </div>
                </PlanPie>
                <PieList :roundPieData="monitorSituationPieData"></PieList>
            </div>
        </SubPanelTemplate>
        <SubPanelTemplate title="用能分析">
            <template #extra>
                <DateInlineForm v-model:modelValue="workOrderTime" @search="changeAppointmentTime"></DateInlineForm>
            </template>
            <div class="flex-between analysis" v-for="item in energyAnalysis" :key="item.title">
                <PlanPie :pieData="item.data">
                    <div class="content">
                        <div>{{ item.title }}</div>
                    </div>
                </PlanPie>
                <PieList class="pieList" :roundPieData="item.data"></PieList>
            </div>
        </SubPanelTemplate>
        <SubPanelTemplate title="设备信息">
            <div class="deviceInfo">
                <div class="deviceInfoBox" v-for="(item, index) in deviceInfo" :key="index">
                    <img width="30" height="30" :src="getAssetsImage('overView5.png')" alt="">
                    <div class="deviceInfoBox-right">
                        <div>{{ item.name + index }}</div>
                        <div :style="{ 'color': (item.state == '在线' ? '#2AE8BD' : '#F14545') }">{{ item.state }}</div>
                    </div>
                </div>
            </div>
        </SubPanelTemplate>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, toRefs, onMounted, onUnmounted } from 'vue'
import { ModelValueItf } from "../public/types";
import SubPanelTemplate from "../public/subPanelTemplate.vue";
import DateInlineForm from "../public/dateInlineForm.vue";
import PlanPie from "../public/charts/pie/planePie.vue";
import PieList from "../public/pieList.vue";
import { getCostInfoData, EnergySnalysis } from '@/mock/energy-consumption'
import { getAssetsImage } from '@/utils/getImage';
const workOrderTime = ref<ModelValueItf>({
    timeType: 'TODAY',
    dateRange: ['']
});
const costTime = ref<ModelValueItf>({
    timeType: 'TODAY',
    dateRange: ['']
});
const monitorSituationPieData = ref<{ label: string; value: number; color: string }[]>(
    [
        { label: "电能", value: 120, color: "#FFAB10" },
        { label: "水能", value: 420, color: "#2F8DFF" },
        { label: "燃气", value: 335, color: "#F14545" },
        { label: "蒸汽", value: 450, color: "#19F8F7" },
    ]
);
const energyAnalysis = ref([
    {
        data: [
            { label: "动力用电", value: 30000, color: "#FFAB10" },
            { label: "生活用电", value: 2000, color: "#2F8DFF" },
            { label: "生产用电", value: 748, color: "#F14545" },
            { label: "其他用电", value: 6000, color: "#19F8F7" },
        ],
        title: '电力'
    },
    {
        data: [
            { label: "生活用水", value: 30000, color: "#FFAB10" },
            { label: "生成用水", value: 2000, color: "#2F8DFF" },
            { label: "医疗用水", value: 748, color: "#F14545" },
            { label: "其他用水", value: 6000, color: "#19F8F7" },
        ],
        title: '水'
    },
    {
        data: [
            { label: "生活用气", value: 30000, color: "#FFAB10" },
            { label: "生产用气", value: 2000, color: "#2F8DFF" },
            { label: "动力用气", value: 748, color: "#F14545" },
            { label: "其他用气", value: 6000, color: "#19F8F7" },
        ],
        title: '燃气'
    },
])
const deviceInfo = ref([
    {
        name: '设备',
        state: '在线'
    },
    {
        name: '设备',
        state: '在线'
    },
    {
        name: '设备',
        state: '在线'
    },
    {
        name: '设备',
        state: '离线'
    },
    {
        name: '设备',
        state: '在线'
    },
    {
        name: '设备',
        state: '离线'
    },
])
const total = ref(1320)
const changecostTime = () => {
    total.value = 0
    monitorSituationPieData.value = getCostInfoData(costTime.value.timeType)
    monitorSituationPieData.value.forEach(item => {
        total.value += item.value
    })
}
const changeAppointmentTime = () => {
    energyAnalysis.value = EnergySnalysis(workOrderTime.value.timeType)
}
let timer = null
let fakeData = ['TODAY', 'THIS_WEEK', 'THIS_MONTH', 'THIS_YEAR']
let fakeIndex = 1
onMounted(() => {
    timer = setInterval(() => {
        workOrderTime.value.timeType = fakeData[fakeIndex]
        changeAppointmentTime()
        changecostTime()
        fakeIndex++;
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
.content {
    text-align: center;
    color: #fff;
    font-size: 14px;

    .total-num {
        font-size: 16px;
    }
}

.flex-between {
    justify-content: space-between;
}

:deep(.analysis) {
    .power-factor {
        width: 100px;
        height: 100px;
    }

    .pieList {
        width: 200px;
    }

    .pie-box {
        position: relative;
        width: 100px;
        height: 100px;
    }

    .content {
        text-align: center;
        color: #fff;
        font-size: 12px;
    }
}

.deviceInfo {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;

    .deviceInfoBox {
        display: flex;
        align-items: center;
        justify-content: space-between;
        color: #fff;
        font-size: 12px;
        padding: 5px;
        width: 100px;
        background-color: rgba(108, 128, 151, 0.3);
        margin-bottom: 10px;
    }
}
</style>