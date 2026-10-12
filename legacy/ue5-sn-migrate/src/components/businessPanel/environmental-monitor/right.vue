<template>
    <div class="panel">
        <SubPanelTemplate title="报警区域top5">
            <div class="header">
                <DateInlineForm v-model:modelValue="handleTime" @search="changeHandleTime"></DateInlineForm>
            </div>
            <div class="body" style="min-height: 250px;" v-show="alarmRank.list.length > 0">
                <EventAlarmItem v-for="(item, index) in alarmRank.list" :key="item.id" :sort="index + 1" :name="item.name"
                    :linkRatio="item.chainRatio" :count="item.alarmNum" :ratio="item.ratio + '%'" />
            </div>
            <div class="body" style="min-height: 150px;" v-show="alarmRank.list.length <= 0">
                <noData></noData>
            </div>
        </SubPanelTemplate>
        <SubPanelTemplate title="动环设备">
            <OperateDays title="设备总数" :value="equipmentData.deviceNum" class="body-num"></OperateDays>
            <GridContainer :data="devicestatistic"></GridContainer>
            <div class="chart">
                <RingChart :pieData="pieData" seriesName="设备类型统计" :total="equipmentData.deviceNum"></RingChart>
            </div>
            <div class="statistic-lenged">
                <div class="statistic-item" v-for="(item, index) in pieData">
                    <a-statistic :value="item.value" :valueStyle="statisticStyle">
                        <template #title>
                            <div class="title flex-start">
                                <div class="box" :style="statisticValueStyle(index)"></div>
                                <span>{{ item.name }}</span>
                            </div>
                        </template>
                        <template #suffix>
                            <span>{{ item.ratio }}</span>
                        </template>
                    </a-statistic>
                </div>
            </div>
        </SubPanelTemplate>
    </div>
</template>
<script lang="ts" setup>
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue';
import SubPanelTemplate from '../public/subPanelTemplate.vue';
import DateInlineForm from '../public/dateInlineForm.vue';
import EventAlarmItem from '../public/eventAlarmItem.vue';
import OperateDays from '../public/operateDays.vue';
import GridContainer from '../public/gridContainer.vue';
import noData from '@/components/businessPanel/public/noData.vue'
import RingChart from '../public/charts/ring/ring.vue';
import { storeArea } from "@/piniaStore/area"
import { ModelValueItf } from '../public/types'
import { AlarmAreaTop } from '@/api/models/alarm'
import { statisticsAreaTop } from '@/api/alarm'
import useCommon from '../../hooks/useCommon'
import { storeMenu } from "@/piniaStore/menu"
const piniaStoreMenu = storeMenu();
interface AlarmHandlType {
    list: AlarmAreaTop[]
}
let timer: any = reactive(null)

let handleTime = ref<ModelValueItf>()
let deviceStatusType = {
    'ALARM': '报警',
    'TROUBLE': '故障',
    'OFFLINE': '离线',
    'NORMAL': '正常',
}
let colorList = ['#328BF7', '#19F8F7', '#FFC700', '#EF424A']

const piniaStoreArea = storeArea();

const devicestatistic = ref([])

const pieData = ref([])
const alarmRank = reactive<AlarmHandlType>({
    list: []
})
let equipmentData = reactive({
    deviceNum: 0,
    devices: [],
    deviceGenreNums: {}
})
const statisticValueStyle = computed(() => (index) => {
    return {
        width: '8px',
        height: '8px',
        borderRadius: '50%',
        background: pieData[index]?.color
    }
})
const statisticStyle = computed(() => {
    return {
        fontSize: '16px',
        color: '#FFFFFF',
        paddingLeft: '16px'
    }
})
watch(() => piniaStoreArea.currentAreaId, () => {
    clearInterval(timer)
    timer = setInterval(() => {
        init()
    }, (window as any).config.pageLoopRequestTime)
    init()
})
const { getEquipmentNumber } = useCommon()

// 报警处理排名
function changeHandleTime() {
    getAlarmHandlTop()
}
async function getAlarmHandlTop() {
    let params = {
        sceneType: piniaStoreMenu.currentMenu,
        areaId: piniaStoreArea.currentAreaId,
        period: handleTime.value.dateRange.join(','),
        type: handleTime.value.timeType,
    }
    alarmRank.list = await statisticsAreaTop(params)

}
// 动环设备
const getEquipmentInfo = async () => {
    pieData.value.length = 0
    devicestatistic.value.length = 0
    let res:any = await getEquipmentNumber()
    if (!res.deviceNum) {
        return
    }
    equipmentData.deviceNum = res.deviceNum
    equipmentData.devices = res.devices
    equipmentData.deviceGenreNums = res.deviceGenreNums
    res.deviceStatusNums.forEach((item, index) => {
        devicestatistic.value.push({
            alarmStatusName: deviceStatusType[item.name],
            alarmNum: item.num,
            color: colorList[index]
        })
    })
    res.deviceGenreNums.forEach((item, index) => {
        pieData.value.push({
            name: item.genreName,
            value: item.num,
            color: colorList[index]
        })
    })
}

function init() {
    getAlarmHandlTop()
    getEquipmentInfo()
}
onMounted(() => {
    getEquipmentInfo()
    timer = setInterval(() => {
        init()
    }, (window as any).config.pageLoopRequestTime)
})
onBeforeUnmount(() => {
    clearInterval(timer)
})
</script>
<style lang="less" scoped>
.body-num {
    margin-bottom: 10px;
}

.chart {
    height: 200px;
}
</style>