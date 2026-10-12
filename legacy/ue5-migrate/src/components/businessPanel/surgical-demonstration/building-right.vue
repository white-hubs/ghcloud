<template>
    <div >
        <SubPanelTemplate title="今日直播" class="product-table">
            <RollTable :column="product.column" :data="product.tableData">
                <template #name="{ record }">
                    <span v-if="record.name === '腹腔镜示教镜示教'" style="color: #FFAB10;">[直播中]</span>
                    <span v-else>[未开始]</span>{{ record.name }}
                </template>
            </RollTable>
        </SubPanelTemplate>
        <SubPanelTemplate title="示教课程分类" class="product-table">
            <div class="chart">
                <Pie3D :data="courseData" label-key="name" value-key="alarmNum" :falg="true" />
            </div>
            <Pie3dList :roundPieData="courseData"></Pie3dList>
        </SubPanelTemplate>
        <SubPanelTemplate title="示教视频播放量">
            <div class="body" v-show="alarmTop.length > 0" style="min-height: 250px">
                <EventAlarmItem v-for="(item, index) in alarmTop" :modes="'次'" :sort="index + 1" :name="item.name"
                    :count="item.value" :ratio="item.ratio" />
            </div>
        </SubPanelTemplate>
    </div>
</template>

<script setup lang="ts">
import SubPanelTemplate from "../public/subPanelTemplate.vue";
import RollTable from "../public/rollTable/index.vue";
import Pie3D from "@/components/businessPanel/public/charts/pie/pie.vue";
import { AlarmLevelType } from "@/api/models/alarm";
import Pie3dList from '../public/Pie3d-list.vue'
import EventAlarmItem from "../public/eventAlarmItem.vue";
import moment from "moment";
import { ref, reactive, toRefs, onMounted, onUnmounted } from 'vue'
const product = reactive({
    column: [
        {
            title: "课程名称",
            dataIndex: "name",
            slots: {
                customRender: "name",
            },
        },
        {
            title: "开始时间",
            dataIndex: "time",
        },
        {
            title: "手术室",
            dataIndex: "situation",
        },

    ],
    tableData: [
        {
            time: moment().format("YYYY-MM-DD mm:ss"),
            name: "腹腔镜示教镜示教",
            situation: "1号手术室",
        },
        {
            time: moment('2023-06-17 17:10:00').format("YYYY-MM-DD mm:ss"),
            name: "牙科示教",
            situation: "2号手术室",
        },
        {
            time: moment('2023-06-17 17:00:00').format("YYYY-MM-DD mm:ss"),
            name: "腹腔镜示教",
            situation: "3号手术室",
        },
        {
            time: moment('2023-06-17 16:40:00').format("YYYY-MM-DD mm:ss"),
            name: "骨折内固定术示教",
            situation: "4号手术室",
        },
        {
            time: moment('2023-06-17 16:10:00').format("YYYY-MM-DD mm:ss"),
            name: "胆囊切除示教",
            situation: "5号手术室",
        },
        {
            time: moment('2023-06-17 16:30:00').format("YYYY-MM-DD mm:ss"),
            name: "甲状腺癌根治示教",
            situation: "6号手术室",
        },
        {
            time: moment('2023-06-17 16:00:00').format("YYYY-MM-DD mm:ss"),
            name: "食道癌根示教",
            situation: "7号手术室",
        },
    ],
});
const courseData = ref([
    {
        alarmNum: 0,
        name: "远程会诊",
    },
    {
        alarmNum: 0,
        name: "远程指导",
    },
    {
        alarmNum: 0,
        name: "远程培训",
    },
    {
        alarmNum: 0,
        name: "科室内训",
    },
]);
const alarmTop = ref([
    {
        name: '手术视频1',
        value: 0,
        ratio: '0%'
    },
    {
        name: '手术视频2',
        value: 0,
        ratio: '0%'
    },
    {
        name: '手术视频3',
        value: 0,
        ratio: '0%'
    },
    {
        name: '手术视频4',
        value: 0,
        ratio: '0%'
    },
    {
        name: '手术视频5',
        value: 0,
        ratio: '0%'
    },
]);
let timer = null
let fakeIndex = 1
let fakeData = [
    [
        {
            alarmNum: 15,
            name: "远程会诊",
        },
        {
            alarmNum: 20,
            name: "远程指导",
        },
        {
            alarmNum: 23,
            name: "远程培训",
        },
        {
            alarmNum: 28,
            name: "科室内训",
        },
    ],
    [
        {
            alarmNum: 28,
            name: "远程会诊",
        },
        {
            alarmNum: 39,
            name: "远程指导",
        },
        {
            alarmNum: 37,
            name: "远程培训",
        },
        {
            alarmNum: 45,
            name: "科室内训",
        },
    ],
    [
        {
            alarmNum: 38,
            name: "远程会诊",
        },
        {
            alarmNum: 45,
            name: "远程指导",
        },
        {
            alarmNum: 50,
            name: "远程培训",
        },
        {
            alarmNum: 55,
            name: "科室内训",
        },
    ],
    [
        {
            alarmNum: 65,
            name: "远程会诊",
        },
        {
            alarmNum: 45,
            name: "远程指导",
        },
        {
            alarmNum: 32,
            name: "远程培训",
        },
        {
            alarmNum: 44,
            name: "科室内训",
        },
    ],
    [
        {
            alarmNum: 75,
            name: "远程会诊",
        },
        {
            alarmNum: 80,
            name: "远程指导",
        },
        {
            alarmNum: 47,
            name: "远程培训",
        },
        {
            alarmNum: 55,
            name: "科室内训",
        },
    ],
]
let top5Data = [
    [{
        name: '手术视频1',
        value: 50,
        ratio: '30%'
    },
    {
        name: '手术视频2',
        value: 42,
        ratio: '26%'
    },
    {
        name: '手术视频3',
        value: 34,
        ratio: '22%'
    },
    {
        name: '手术视频4',
        value: 28,
        ratio: '18%'
    },
    {
        name: '手术视频5',
        value: 17,
        ratio: '12%'
    }], [{
        name: '手术视频1',
        value: 69,
        ratio: '48%'
    },
    {
        name: '手术视频2',
        value: 55,
        ratio: '36%'
    },
    {
        name: '手术视频3',
        value: 48,
        ratio: '30%'
    },
    {
        name: '手术视频4',
        value: 37,
        ratio: '20%'
    },
    {
        name: '手术视频5',
        value: 20,
        ratio: '19%'
    }], [{
        name: '手术视频1',
        value: 80,
        ratio: '56%'
    },
    {
        name: '手术视频2',
        value: 76,
        ratio: '48%'
    },
    {
        name: '手术视频3',
        value: 70,
        ratio: '42%'
    },
    {
        name: '手术视频4',
        value: 61,
        ratio: '31%'
    },
    {
        name: '手术视频5',
        value: 52,
        ratio: '28%'
    }], [{
        name: '手术视频1',
        value: 92,
        ratio: '77%'
    },
    {
        name: '手术视频2',
        value: 75,
        ratio: '66%'
    },
    {
        name: '手术视频3',
        value: 63,
        ratio: '60%'
    },
    {
        name: '手术视频4',
        value: 52,
        ratio: '53%'
    },
    {
        name: '手术视频5',
        value: 42,
        ratio: '39%'
    }], [{
        name: '手术视频1',
        value: 109,
        ratio: '85%'
    },
    {
        name: '手术视频2',
        value: 92,
        ratio: '79%'
    },
    {
        name: '手术视频3',
        value: 83,
        ratio: '72%'
    },
    {
        name: '手术视频4',
        value: 71,
        ratio: '68%'
    },
    {
        name: '手术视频5',
        value: 63,
        ratio: '57%'
    }],
]
onMounted(() => {
    timer = setInterval(() => {
        courseData.value[0] = fakeData[fakeIndex][0]
        courseData.value[1] = fakeData[fakeIndex][1]
        courseData.value[2] = fakeData[fakeIndex][2]
        courseData.value[3] = fakeData[fakeIndex][3]
        alarmTop.value[0] = top5Data[fakeIndex][0]
        alarmTop.value[1] = top5Data[fakeIndex][1]
        alarmTop.value[2] = top5Data[fakeIndex][2]
        alarmTop.value[3] = top5Data[fakeIndex][3]
        alarmTop.value[4] = top5Data[fakeIndex][4]
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
.panel {
    .product-table {
        height: 270px;
    }

    .chart {
        height: 140px;
    }
}
</style>