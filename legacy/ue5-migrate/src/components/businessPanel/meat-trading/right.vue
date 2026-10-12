<template>
    <div >
        <SubPanelTemplate title="数据总览">
            <dataOverviewPanel :overviewData="overViewPanelData"></dataOverviewPanel>
        </SubPanelTemplate>
        <SubPanelTemplate title="区域总览">
            <areaProgressPanel :overviewData="areaProgressData"></areaProgressPanel>
        </SubPanelTemplate>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, toRefs, onMounted, onUnmounted } from 'vue'
import SubPanelTemplate from "../public/subPanelTemplate.vue"
import dataOverviewPanel from "./components/data-overview-panel.vue"
import areaProgressPanel from "./components/area-progress-panel.vue"
import { AreaProgressData } from "../public/types";

const overViewPanelData = ref([
    {
        imgPath: 'd1-icon.png',
        value: 2350,
        name: '占地面积',
        unit: '㎡'
    },
    {
        imgPath: 'd2-icon.png',
        value: 20,
        name: '楼栋数',
        unit: '栋'
    },
])
const areaProgressData = ref<AreaProgressData[]>([
    {
        statistic: { name: '东区', total: 41281.00, ratio: '25', buildCount: 10, businessCount: 100 },
        buildData: { total: 100, rented: 90, UnRent: 10, imgPath: 'd3-icon.png', iconPath: ''},
        businessData: { total: 80, online: 70, offline: 10, imgPath: 'd4-icon.png', iconPath: '' },
    },
    {
        statistic: { name: '南区', total: 5641.00, ratio: '45', buildCount: 10, businessCount: 100 },
        buildData: { total: 78, rented: 55, UnRent: 23, imgPath: 'd3-icon.png', iconPath: ''},
        businessData: { total: 45, online: 25, offline: 20, imgPath: 'd4-icon.png', iconPath: '' },
    },
    {
        statistic: { name: '西区', total: 1255.00, ratio: '53', buildCount: 10, businessCount: 100 },
        buildData: { total: 91, rented: 90, UnRent: 1, imgPath: 'd3-icon.png', iconPath: ''},
        businessData: { total: 30, online: 20, offline: 10, imgPath: 'd4-icon.png', iconPath: '' },
    },
    {
        statistic: { name: '北区', total: 2312.00, ratio: '36', buildCount: 10, businessCount: 100 },
        buildData: { total: 78, rented: 65, UnRent: 13, imgPath: 'd3-icon.png', iconPath: ''},
        businessData: { total: 66, online: 60, offline: 6, imgPath: 'd4-icon.png', iconPath: '' },
    },
])

</script>
<style scoped lang="less">
.monitorPanelBox {
    display: flex;
    align-items: center;
    justify-content: space-between;
}

</style>