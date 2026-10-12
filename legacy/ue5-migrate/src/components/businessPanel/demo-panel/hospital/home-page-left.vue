<template>
    <div>
        <SubPanelTemplate title="院区介绍">
            <div class="hospitalInfo">
                <img :src="getAssetsImage(introduce.imgUrl)" alt="">
                <div class="hospitalInfo-text">
                    <div class="hospitalInfo-title">{{introduce.title}}</div>
                    <div class="scroll_box">
                        <div class="scroll-text">
                            {{introduce.details}}
                        </div>
                    </div>
                </div>
            </div>
        </SubPanelTemplate>
        <SubPanelTemplate title="院区概览">
            <div class="total-num">
                <img :src="getAssetsImage('circel-halo4.png')" class="bg-img" />
                <img :src="getAssetsImage('circel-halo3.png')" class="img2 rotate reverse" />
                <img :src="getAssetsImage('overView46.png')" class="img3 rotate reverse" />
                <a-progress :stroke-color="{ '0%': '#2C8BFF', '100%': '#B2D4FF', }" :percent="30" type="circle"
                    strokeLinecap="square" trailColor="rgba(255, 255, 255, 0.1)" />
                <img :src="getAssetsImage('bubble.png')" class="img3 rotate" />
                <div class="value">
                    <img :src="getAssetsImage('overView44.png')" class="img3" />
                </div>
                <div class="list">
                    <div :class="['item' + index]" class="item" v-for="(item, index) in callStatisticsData.list">
                        <div>
                            <CountTo :startVal="0" :endVal="item.value" :duration="2000" separator="" />
                            <span style="font-size: 12px;">
                                {{ item.unit }}
                            </span>
                        </div>
                        <div style="font-size: 12px;">{{ item.name }}</div>
                    </div>

                </div>
            </div>
        </SubPanelTemplate>
        <SubPanelTemplate title="接诊情况总览" v-if="getTenant !== 48055979">
            <template #extra>
                <DateInlineForm v-model:modelValue="receiveOverviewTime" @search="changeHandleReceiveOverviewTime">
                </DateInlineForm>
            </template>
            <div class="overviewBox" v-for="item in overviewData" :key="item.name">
                <div class="overviewBox-left">
                    <div class="rotateCalss">
                        <img class="aniamtion-rotateX imgBox" width="56" height="56"
                            :src="getAssetsImage('overView20.png')" alt="">
                    </div>
                    <img width="52" height="52" :src="getAssetsImage('overView19.png')" alt="">
                    <div>{{ item.name }}</div>
                </div>
                <div class="overviewBox-right">
                    <schedule-chart :dayData="item.dayData" :totalData="item.total"></schedule-chart>
                </div>
            </div>
        </SubPanelTemplate>
        <SecurityMonitor v-else></SecurityMonitor>

        <SubPanelTemplate title="人车出入情况 ">
            <template #extra>
                <DateInlineForm v-model:modelValue="overviewTime" @search="changeHandleOverviewTime">
                </DateInlineForm>
            </template>
            <LightingRound class="LightingBox" :data="roundData"></LightingRound>
        </SubPanelTemplate>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, computed } from 'vue'
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
import scheduleChart from "./schedule-chart.vue"
import LightingRound from "@/components/businessPanel/intelligent-lighting/components/lighting-round.vue"
import CountTo from "@/components/businessPanel/public/count-to/count-to.vue";
import { getAssetsImage } from '@/utils/getImage';
import { OverviewSituation, OverviewReceptionStatus, SituationPeoplevehicles } from "@/mock/hospital"
import { ModelValueItf } from '../../public/types'
import SecurityMonitor from "@/components/businessPanel/security-monitoring-safty/cards/security-monitor.vue";


const overviewTime = ref<ModelValueItf>()
const receiveOverviewTime = ref<ModelValueItf>()
const overviewData = ref([
    {
        name: '门诊',
        dayData: 30,
        total: 540
    },
    {
        name: '急诊',
        dayData: 10,
        total: 345
    },
    {
        name: '住院',
        dayData: 40,
        total: 900
    },
])
const introduce = ref({
    title:'成都某人民医院孪生平台',
    details:'成都某人民医院孪生平台是一所集医疗、急救、保健、康复、科研、教学为一体的国家公立大型三级甲等综合医院;其前身系始建于1951年的成都工人医院,历史悠久、文化底蕴丰厚;地处成都市成华区建设南路。',
    imgUrl:'overView18.png'
})
const getTenant = computed(()=>{
    const { code } = JSON.parse(sessionStorage.getItem('GH-NowEnterprise'))
    return code
})
const changeHandleOverviewTime = () => {
    roundData.value = SituationPeoplevehicles(overviewTime.value.timeType)
};
const changeHandleReceiveOverviewTime = () => {
    overviewData.value = OverviewReceptionStatus(receiveOverviewTime.value.timeType)
};
const roundData = ref([
    {
        statistic: { icon: 'overView13.png' },
        legendList: [
            { name: '进入', color: '#2AE8BD', value: 23 },
            { name: '离开', color: '#2989FF', value: 23 }
        ]
    },
    {
        statistic: { icon: 'overView30.png' },
        legendList: [
            { name: '进入', color: '#2AE8BD', value: 23 },
            { name: '离开', color: '#2989FF', value: 23 }
        ]
    },
])
const callStatisticsData = reactive({
    totalNum: 34563,
    list: [
        { name: "占地面积", value: 42, unit: '亩' },
        { name: "楼栋", value: 3, unit: '栋' },
        { name: "建筑面积", value: 13.6, unit: '万m²' },
        { name: "床位", value: 900, unit: '张' },
    ]
})
let timer = null
let fakeIndex = 1
const fakeData = ['TODAY', 'THIS_WEEK', 'THIS_MONTH', 'THIS_YEAR']
onMounted(() => {
    if (getTenant.value === 48055979) {
        introduce.value = {
            title:'环天智慧园区数字大脑建设项目',
            details:'该项目占地约35亩，总建筑面积73853平方米，共设计三栋建筑分别为研发测试中心、运维总控中心、职工住宿楼建筑，主要功能以数字经济产业办公区、数字经济孵化办公区、数据中心、城市大脑数字产业展厅等功能为主。项目将采用满墙大屏幕结合电脑操作台的方式，形成具有视觉冲击力的矩阵化的高大展示空间，营造未来感，主要建设指挥中心、决策室、展示中心和呼叫中心等',
            imgUrl:'overView116.png'
        }
        callStatisticsData.list = [
            { name: "占地面积", value: 42, unit: '亩' },
            { name: "楼栋", value: 3, unit: '栋' },
            { name: "建筑面积", value: 36, unit: '亩' },
            { name: "计容面积", value: 18, unit: '亩' },
        ]
    }
    timer = setInterval(() => {
        receiveOverviewTime.value.timeType = fakeData[fakeIndex]
        overviewTime.value.timeType = fakeData[fakeIndex]
        overviewData.value = OverviewSituation(fakeIndex)
        changeHandleReceiveOverviewTime()
        changeHandleOverviewTime()
        fakeIndex++
        if (fakeIndex > fakeData.length - 1) {
            clearInterval(timer)
            fakeIndex = 0
        }
    }, (window as any).config.pageLoopRequestTime)
})

onUnmounted(() => {
    clearInterval(timer)
})
</script>
<style scoped lang="less">
.hospitalInfo {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 5px;

    img {
        width: 152px;
        height: 128px;
    }

    .hospitalInfo-text {
        width: 169px;
        color: #fff;
        font-size: 12px;

        .hospitalInfo-title {
            font-size: 14px;
            margin-bottom: 5px;
        }
    }
}

.overviewBox {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px;

    .overviewBox-left {
        width: 56px;
        height: 56px;
        position: relative;

        .rotateCalss {
            position: absolute;
            margin-top: -12px;
            margin-left: -14px;
            transform: rotateY(180deg);
        }

        img,
        div {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
        }

        .imgBox {
            top: 50%;
            left: 50%;
            margin-left: -28px;
            margin-top: -28px;
        }

        div {
            position: absolute;
            width: 26px;
            height: 20px;
            font-size: 14px;
            font-family: YouSheBiaoTiHei-Bold, YouSheBiaoTiHei;
            color: #FFFFFF;
        }
    }

    .overviewBox-right {
        width: 250px;
        height: 52px;
    }
}

.total-num {
    margin: auto;
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
        width: 125px;
        height: 125px;
        transform: translate(-50%, -50%) rotate(-25deg);

        .ant-progress-text {
            display: none;
        }

        .ant-progress-inner {
            display: contents;
        }
    }


    .value {
        display: flex;
        flex-flow: column;
        align-items: center;

        :deep(.gh-count-to) {
            font-size: 22px;
            font-family: "YouSheBiaoTiHei";
            font-weight: bold;
            color: #FFFFFF;
            margin-bottom: -4px;

        }

        &:last-child {
            font-size: 12px;
            font-weight: 400;
            color: #D0DEEE;
        }
    }
}

.bg-img {
    position: absolute;
    height: 100%;
}

:deep(.gh-count-to) {
    font-size: 22px;
    font-weight: bold;
    color: #FFFFFF;
    margin-bottom: -4px;

}

.list {
    width: 100%;
    display: flex;
    position: relative;
    left: 0;
    width: 100%;
    height: 100%;
    color: #D9E7FF;

    .item {
        position: absolute;
        width: 150px;
        font-size: 14px;
        font-family: Source Han Sans CN-Regular, Source Han Sans CN;
        font-weight: 400;
        text-align: center;
    }

    .item0 {
        left: -100px;
        top: 15px;
    }

    .item1 {
        left: 100px;
        top: 15px;
    }

    .item2 {
        left: -100px;
        top: 82px;
    }

    .item3 {
        left: 105px;
        top: 82px;
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

:deep(.round-wrap) {
    flex-direction: column;
}

:deep(.round-wrap .info) {
    flex-direction: row;
    justify-content: space-around;
}

:deep(.LightingBox) {
    .info {
        position: relative;

        &::after {
            content: '';
            display: inline-block;
            height: 1px;
            border-top: 1px solid rgba(255, 255, 255, 0.3);
            position: absolute;
            width: 200px;
            top: 72px;
            left: 116px;
        }

        &::before {
            content: '';
            display: inline-block;
            height: 1px;
            border-top: 1px solid rgba(255, 255, 255, 0.3);
            position: absolute;
            top: 60px;
            left: 85px;
            width: 35px;
            transform: rotateZ(40deg);
        }
    }

    .roate {
        width: 57px !important;
        height: 57px !important;
    }

    .r1 {
        width: 80px !important;
        height: 80px !important;
    }

    .r2 {
        width: 70px !important;
        height: 70px !important;
    }

    .r3 {
        width: 70px !important;
        height: 70px !important;
        border-radius: 100%;
    }

    .item {
        height: 110px !important;
    }

    .icon {
        width: 30px !important;
        height: 30px !important;
    }

    .monitor {
        width: 180px !important;
        justify-content: space-between;
        margin-bottom: 10px;
    }
}


.scroll_box {
    height: 100px;
    overflow: hidden;

    .scroll-text {
        animation: scroll 10s linear infinite;
        color: #D9E7FF;
    }
}

@keyframes scroll {
    0% {
        transform: translateY(0);
    }

    100% {
        transform: translateY(-100%);
    }
}
</style>
