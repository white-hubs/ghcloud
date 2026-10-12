<template>
    <div class="panel">
        <SubPanelTemplate title="医用气体用量" class="visiting-data">
            <template #extra>
                <DateInlineForm v-model:modelValue="workOrderTime" @search="changeHandleworkOrderTime"></DateInlineForm>
            </template>
            <div class="item" v-for="item in visitingData" :key="item.title">
                <VisitingDataPic :img="item.img" />
                <a-statistic :title="item.title">
                    <template #formatter>
                        <count-to :startVal="0" :endVal="item.value" :duration="2000" separator=""></count-to>
                        <span class="unit">{{ item.unit }}</span>
                        <div class="ringRatio">
                            <span style="white-space: nowrap;">环比</span>
                            <!-- uptriangle 向上三角根据Prop改变 -->
                            <div :class="['downtriangle', item.ratio > 0 && 'uptriangle']"></div>
                            <div :class="[item.ratio > 0 ? 'up' : 'down']">{{ item.ratio + "%" }}</div>
                        </div>
                    </template>
                </a-statistic>
            </div>
        </SubPanelTemplate>
        <SubPanelTemplate title="今日会议情况">
            <DeviceStatistics imgPath="overView43.png" :statistic="deviceStatisticsData"></DeviceStatistics>
            <div class="call-statistics">
                <div class="total-num">
                    <img :src="getAssetsImage('circel1.png')" class="img1 rotate" />
                    <img :src="getAssetsImage('circel-halo1.png')" class="img2 rotate reverse" />
                    <a-progress class=" rotate " :stroke-color="{ '0%': '#2970FF', '100%': '#c3dffc', }" :percent="30"
                        type="circle" strokeLinecap="square" trailColor="rgba(255, 255, 255, 0.1)" />
                    <img :src="getAssetsImage('bubble.png')" class="img3 rotate" />
                    <div class="value">
                        <CountTo :startVal="0" :endVal="callStatisticsData.totalNum" :duration="2000" separator="" />
                        <span>总数</span>
                    </div>
                </div>
                <div class="call-list">
                    <div class="call-box" v-for="item in callStatisticsData.list" :key="item.title">
                        <div class="call-left">
                            <span class="call-color" :style="{ backgroundColor: item.color }"> </span>
                            <span class="call-name">
                                {{ item.title }}
                            </span>
                        </div>
                        <count-to :startVal="0" :endVal="item.value" :duration="2000" separator="" decimals="0"></count-to>
                    </div>
                </div>
            </div>
        </SubPanelTemplate>
        <SubPanelTemplate title="示教开展情况">
            <teachView :contentList="contentList"></teachView>
        </SubPanelTemplate>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, toRefs, onMounted, onUnmounted } from 'vue'
import VisitingDataPic from "@/components/businessPanel/triage-queue/components/visiting-data-pic.vue";
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import DeviceStatistics from "@/components/businessPanel/triage-queue/components/device-statistics.vue"
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
import teachView from "./teach-view.vue";
import { getAssetsImage } from '@/utils/getImage';
import { MeetingSituation } from '@/mock/hospital'
import CountTo from "@/components/businessPanel/public/count-to/count-to.vue";
import { ModelValueItf } from '@/components/businessPanel/public/types'
const workOrderTime = ref<ModelValueItf>();
// 群控组实时数据
const visitingData = ref([
    { title: "氧气", value: 3345, img: getAssetsImage('overView36.png'), ratio: 0.5, unit: 'm³' },
    { title: "二氧化碳", value: 2346, img: getAssetsImage('overView35.png'), ratio: 0.5, unit: 'm³' },
    { title: "笑气", value: 1345, img: getAssetsImage('overView34.png'), ratio: 0.5, unit: 'm³' },
    { title: "压缩空气", value: 345, img: getAssetsImage('overView38.png'), ratio: 0.5, unit: 'm³' },
    { title: "负压吸引", value: 345, img: getAssetsImage('overView37.png'), ratio: 0.5, unit: 'm³' },
    { title: "氦气", value: 345, img: getAssetsImage('overView39.png'), ratio: 0.5, unit: 'm³' },
])
const callStatisticsData = reactive({
    totalNum: 10,
    list: [
        { title: "进行中(20%)", value: 2, color: '#FFC700' },
        { title: "已结束(20%)", value: 2, color: '#2989FF' },
        { title: "未开始(60%)", value: 6, color: '#19F8F7' },
    ]
})
const contentList = ref([
    {
        img: 'overView41.png',
        name: '示教直播',
        value: 10,
        unit: '场'
    },
    {
        img: 'overView43.png',
        name: '示教录播',
        value: 8,
        unit: '场'
    },
    {
        img: 'overView40.png',
        name: '示教视频',
        value: 11,
        unit: '个'
    },
])
const deviceStatisticsData = reactive({
    title: "会议室",
    total: 10,
    itemize: [
        {
            label: "使用中",
            value: 2,
            key: "OFFLINE",
        }
    ]
});
const changeHandleworkOrderTime = () => {
    // requestFlowNumberStatistic();
};
let timer = null
let fakeIndex = 1
const fakeData = [
    { total: 10, offlineNum: 234 },
    { total: 10, offlineNum: 635 },
    { total: 10, offlineNum: 1201 },
    { total: 10, offlineNum: 1549 },
    { total: 10, offlineNum: 2134 },
]
const contentData = [
    [18, 25, 29],
    [25, 30, 35],
    [27, 34, 38],
    [38, 44, 51],
    [46, 60, 59],
]
onMounted(() => {
    timer = setInterval(() => {
        contentList.value[0].value = contentData[fakeIndex][0]
        contentList.value[1].value = contentData[fakeIndex][1]
        contentList.value[2].value = contentData[fakeIndex][2]
        const { value, list } = MeetingSituation(fakeIndex)
        callStatisticsData.list = list
        // deviceStatisticsData.itemize[0].value = value
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
.visiting-data {
    :deep(.sub-panel-content) {
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;

        .item {
            width: 50%;
            height: 60px;
            margin-top: 30px;
            margin-bottom: 10px;
            display: inline-flex;
            align-items: center;
            box-sizing: border-box;
            padding-left: 20px;

            .unit {
                font-size: 12px;
            }

            .ant-statistic {
                display: inline-flex;
                flex-flow: column-reverse;

                .ant-statistic-content {
                    height: 29px;

                    .ant-statistic-content-value {
                        color: #fff;
                        font-size: 22px;
                        font-weight: 400;
                        position: relative;
                        top: -25px;
                    }
                }

                .ant-statistic-title {
                    color: #D0DEEE;
                    font-size: 12px;
                    margin: 0;
                }
            }
        }
    }
}

.ringRatio {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 12px;
}

.downtriangle {
    width: 0;
    height: 0;
    border-left: 8px solid transparent;
    border-right: 8px solid transparent;
    border-bottom: 8px solid #d2fff3;
    margin: 0 3px;
    transform: rotate(180deg);
}

.uptriangle {
    border-bottom: 8px solid #ffcece;
    transform: rotate(0deg);
}

.down {
    color: #2ae8bd;
    font-family: Roboto-Regular, Roboto;
}

.up {
    color: #f14545;
    font-family: Roboto-Regular, Roboto;
}

.call-statistics {
    display: flex;
    align-items: center;
    justify-content: space-around;

    :deep(.ant-statistic-content-value) {
        color: #fff;
        font-size: 22px;
        font-weight: 400;
        position: relative;
        top: -25px;
    }

    .total-num {
        position: relative;
        width: 159px;
        height: 153px;

        img,
        .value {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
        }

        .img1 {
            width: 159px;
            height: 153px;
        }

        .img2 {
            width: 142px;
            height: 142px;
        }

        .img3 {
            width: 80px;
            height: 80px;
        }

        :deep(.ant-progress) {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(-25deg);

            .ant-progress-text {
                display: none;
            }
        }


        .value {
            display: flex;
            flex-flow: column;
            align-items: center;

            :deep(.gh-count-to) {
                font-size: 20px;
                font-family: "YouSheBiaoTiHei";
                font-weight: 400;
                color: #FFFFFF;
                margin-bottom: -8px;
            }

            &:last-child {
                font-size: 12px;
                font-weight: 400;
                color: #D0DEEE;
            }
        }
    }

    .call-list {
        .call-box {
            width: 154px;
            height: 44px;
            background: rgba(255, 255, 255, 0.06);
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0 10px;
            font-size: 14px;
            margin-top: 15px;
            margin-bottom: 15px;


            .call-left {
                display: flex;
                align-items: center;
            }

            span {
                display: inline-block;
                color: #fff;
            }

            .call-color {
                width: 8px;
                height: 8px;
                background: #FFC700;
                border-radius: 50%;
                margin-right: 5px;
            }
        }
    }

    .list {
        margin-top: 20px;

        .item {
            width: 154px;
            height: 60px;
            background: rgba(255, 255, 255, 0.06);
            margin-bottom: 12px;
            box-sizing: border-box;
            padding-left: 12px;
            display: flex;
            align-items: center;
            position: relative;

            .time {
                font-size: 14px;
                font-weight: 400;
                color: #D0DEEE;
                margin-right: 10px;
            }

            .datas {
                display: flex;
                flex-flow: column;
                margin-top: -15px;

                .value {
                    :deep(.gh-count-to) {
                        font-size: 20px;
                        font-family: "YouSheBiaoTiHei";
                        font-weight: 400;
                        color: #FFFFFF;
                    }
                }

                .rate {
                    font-size: 12px;
                    font-weight: 400;
                    line-height: 0;
                    margin-top: 0px;

                    .text {
                        color: #D0DEEE !important;
                        margin-right: 2px;
                    }
                }
            }

            &::before {
                position: absolute;
                left: 0;
                top: 0;
                width: 17px;
                height: 1px;
                background: #2970FF;
                content: '';
            }
        }
    }
}

@keyframes rotate {
    from {
        transform: translate(-50%, -50%) rotate(0);
    }

    to {
        transform: translate(-50%, -50%) rotate(360deg);
    }
}

.rotate {
    animation: rotate 15s infinite linear;
}

.reverse {
    animation-direction: reverse;
}
</style>