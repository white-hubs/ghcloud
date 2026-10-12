<!-- 停车管理 -->
<template>
    <div class="panel">
        <SubPanelTemplate title="收费总览">
            <DateInlineForm v-model:modelValue="collectFees" @search="getChargingOverviewInfo"></DateInlineForm>
            <div class="chargingModuleBox">
                <chargingModule :collectFeesData="item" v-for="(item, index) in collectFeesList.arr" :key="index">
                </chargingModule>
            </div>
        </SubPanelTemplate>
        <SubPanelTemplate title="支付方式占比">
            <!-- <template #bar>
                <div class="right-bar">查看更多》</div>
            </template> -->
            <DateInlineForm v-model:modelValue="pay" @search="paymentProportion"></DateInlineForm>
            <OperateDays style="margin-top: 10px;" :value="total" title="实收总金额">
            </OperateDays>
            <div class="equipmentAlarm">
                <RoundPie :data="roundPieData.arr">
                    <div>
                        <img width="25" height="25" :src="getAssetsImage('money1.png')" alt="">
                    </div>
                </RoundPie>
                <pieList :roundPieData="roundPieData.arr"></pieList>
            </div>
        </SubPanelTemplate>
        <SubPanelTemplate title="收费区间分布">
            <DateInlineForm v-model:modelValue="range" @search="tollIntervalInfo"></DateInlineForm>
            <pillar :x-data="barData.xData" :y-data="barData.yData" :blg-color="'rgba(170, 140, 34, 0.20)'"
                :bar-color="'#FFC700'"></pillar>
        </SubPanelTemplate>
    </div>
</template>
<script lang="ts" setup>
import SubPanelTemplate from "../../equipmentPanel/businessPanel/public/subPanelTemplate.vue";
import DateInlineForm from '@/components/businessPanel/public/dateInlineForm.vue'
import changeBar from "../public/changeBar.vue"
import chargingModule from '../public/chargingModule.vue'
import OperateDays from '../public/operateDays.vue';
import RoundPie from "../public/charts/roundPie/roundPie.vue"
import pieList from "../public/pieList.vue"
import pillar from '../public/charts/pillar/pillar.vue'
import { getAssetsImage } from "../../../utils/getImage";
import { onBeforeUnmount, onMounted, reactive, ref, watch } from "vue";
import { chargingOverview, paymentMethod, tollInterval, chargingTrends } from '@/utils/requestData/parkingSpaceManage'
import { storeArea } from "@/piniaStore/area"
const piniaStoreArea = storeArea();
watch(() => piniaStoreArea.currentAreaId, () => {
    clearInterval(timer)
    timer = setInterval(() => {
        init()
    }, (window as any).config.pageLoopRequestTime)
    init()
})
let collectFees = ref()
let pay = ref()
let range = ref()
let total = ref(0)
let timer: any = reactive(null)
let colorList = ["#328BF7", "#FFC700", "#19F8F7", "#EF424A", "#CBE2FF"]
let roundPieData = reactive({
    arr: []
});

const barData = reactive({
    xData: ['1月', '2月', '3月', '4月', '5月', '6月'],
    yData: [120, 200, 150, 80, 70, 110]
})
let collectFeesList: any = reactive({
    arr: []
})

// 收费总览
const getChargingOverviewInfo = async () => {
    collectFeesList.arr = await chargingOverview({ dimension: collectFees.value.timeType })
}
// 支付方式占比
const paymentProportion = async () => {
    let res = await paymentMethod({ dimension: pay.value.timeType })
    roundPieData.arr = res.arr.map((item, index) => {
        item.color = colorList[index]
        return item
    })
    total.value = res.total
}
// 支付方式占比
const tollIntervalInfo = async () => {
    let res = await tollInterval({ dimension: pay.value.timeType })
    barData.xData = res.xdata
    barData.yData = res.series[0].value
}
const init = () => {
    getChargingOverviewInfo()
    paymentProportion()
    tollIntervalInfo()
}
onMounted(() => {
    timer = setInterval(() => {
        init()
    }, (window as any).config.pageLoopRequestTime)
})
onBeforeUnmount(() => {
    clearInterval(timer)
})
</script>
<style lang="less" scoped>
.chargingModuleBox {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 30px;
}

.ringRatio {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 12px;
    margin-left: 6px;
}

.equipmentAlarm {
    display: flex;
    justify-content: space-around;
    align-items: center;
    margin-top: 10px;
}
</style>