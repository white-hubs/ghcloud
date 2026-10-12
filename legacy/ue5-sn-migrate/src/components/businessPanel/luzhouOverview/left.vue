<template>
    <div class="panel">
        <SubPanelTemplate title="院区介绍">
            <div class="hospitalInfo">
                <img v-if="tenantData.logo" :src="tenantData.logo.path" alt="">
                <div class="hospitalInfo-text">
                    <div class="hospitalInfo-title">{{ tenantData.name }}</div>
                    <div class="scroll_box">
                        <div class="scroll-text">
                            {{ tenantData.remark }}
                        </div>
                    </div>
                </div>
            </div>
        </SubPanelTemplate>
        <SubPanelTemplate title="设备总览">
            <div class="chart">
                <elevator-analysis-pie :pieData="pieData" :radius="'85'">
                    <div style="color: #fff;text-align: center;font-size: 16px;">{{ alarmTotal }}</div>
                    <div style="color: #fff;text-align: center;font-size: 14px;">总量</div>
                </elevator-analysis-pie>
            </div>
            <div class="deviceList">
                <div class="deviceBox" v-for="item in pieData" :key="item.color">
                    <div class="deviceBox_left">
                        <span class="deviceBox_color" :style="{ backgroundColor: item.color }"></span>
                        <span class="deviceBox_name">{{ item.name }}</span>
                    </div>
                    <div class="deviceBox_right">{{ item.value }}</div>
                </div>
            </div>
        </SubPanelTemplate>
        <SubPanelTemplate title="设备类型">
            <div class="deviceTypeList">
                <div class="deviceTypeBox" v-for="item in deviceGenreNums" :key="item.genre">
                    <div class="deviceTypeBox_left">
                        <!-- <img width="20" height="20" :src="getAssetsImage('overView12.png')" alt=""> -->
                        <i :class="['iconfont', item.icon, 'iconStyle']" v-if="item.icon"></i>
                        <i :class="['iconfont','icon-bianyaqi1', 'iconStyle']" v-else></i>
                        <span>{{ item.genreName }} </span>
                    </div>
                    <div class="deviceTypeBox_right">
                        <count-to style="font-size: 16px;" :startVal="0" :endVal="item.num" separator="" :duration="4000" class="scroll-number" />
                        <span>
                            台
                        </span>
                    </div>
                </div>
            </div>
        </SubPanelTemplate>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, toRefs, onMounted, onBeforeUnmount } from 'vue'
import SubPanelTemplate from "../public/subPanelTemplate.vue";
import useCommon from "../../hooks/useCommon";
import CountTo from "../public/count-to/count-to.vue";
import elevatorAnalysisPie from "../public/charts/pie/elevator-analysis-pie.vue"
import { getTenantDetails } from "@/api/ouaa";
import { getNowEnterprise } from "@/utils/auth";
import { TenantType } from '@/api/models/ouaa';
import { equipmentTotal } from '@/api/equipment'
const timer: any = ref(null);
const pieData = ref([
    {
        name: '正常',
        value: 0,
        color: '#2AE8BD',
    },
    {
        name: '离线',
        value: 0,
        color: '#2989FF',
    },
    {
        name: '故障',
        value: 0,
        color: '#FFC700',
    },
    {
        name: '告警',
        value: 0,
        color: '#F14545',
    },
])
const tenantData = reactive<TenantType>({
    address: '',
    areaCovered: 0,
    building: 0,
    code: '',
    files: [],
    id: '',
    location: '',
    logo: {
        id: '',
        name: '',
        path: '',
        size: '',
        suffix: ''
    },
    name: '',
    remark: ''
})
const deviceGenreNums = ref([])
let deviceStatusType = {
    ALARM: "报警",
    TROUBLE: "故障",
    OFFLINE: "离线",
    NORMAL: "正常",
}
let colorList = ["#2AE8BD", "#99C7FF", "#FFC700", "#F14545"];
const { getEquipmentNumber } = useCommon();
let alarmTotal = ref<number>(0)
// 设备实时数据
const deviceDataInfo = async () => {
    let res: any = await equipmentTotal({});
    if (!res.deviceNum) {
        return;
    }
    deviceGenreNums.value = res.deviceGenreNums
    pieData.value.length = 0;
    alarmTotal.value = 0;
    res.deviceStatusNums.forEach((item, index) => {
        alarmTotal.value += item.num;
        let obj = {
            name: deviceStatusType[item.name],
            color: colorList[index],
            value: item.num,
        };
        pieData.value.push(obj);
    });
};
// 获取企业介绍
const getTenantInfo = async () => {
    let res = await getTenantDetails(getNowEnterprise().code)
    Object.assign(tenantData, res)
}

const init = () => {
    deviceDataInfo();
};
onMounted(() => {
    deviceDataInfo();
    getTenantInfo()
    // timer.value = setInterval(() => {
    //     init();
    // }, (window as any).config.pageLoopRequestTime);
});
onBeforeUnmount(() => {
    clearInterval(timer.value);
});
</script>
<style scoped lang="less">
.hospitalInfo {
    padding: 10px;

    img {
        width: 336px;
        height: 128px;
    }

    .hospitalInfo-text {
        color: #fff;
        text-align: center;

        .hospitalInfo-title {
            margin: 5px 0;
            font-size: 14px;
        }

        .scroll_box {
            text-align: left;
            overflow: hidden;
            height: 100px;

            .scroll-text {
                animation: scroll 10s linear infinite;
                color: #D9E7FF;
                font-size: 12px;
            }
        }
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

.chart {
    width: 160px;
    height: 160px;
    margin: auto;
}

.deviceList {
    margin-top: 10px;
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
    align-items: center;
    padding: 0 10px;

    .deviceBox {
        display: flex;
        align-items: center;
        justify-content: space-between;
        width: 150px;
        height: 24px;
        background: rgba(142, 172, 206, 0.1);
        margin-bottom: 8px;
        padding: 0 10px;

        .deviceBox_left {
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .deviceBox_color {
            display: inline-block;
            width: 10px;
            height: 10px;
        }

        .deviceBox_name {
            color: #D0DEEE;
            font-size: 12px;
            margin-left: 5px;
        }

        .deviceBox_right {
            color: #FFFFFF;
            font-size: 16px;
        }
    }
}

.deviceTypeList {
    height: 250px;
    overflow-y: auto;


    .deviceTypeBox {
        width: 336px;
        height: 40px;
        background-image: url("/resource/v1/ue5-sn-migrate/assets/images/overView48.png");
        background-repeat: no-repeat;
        background-size: 100% 100%;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 8px;
        margin-bottom: 10px;

        .deviceTypeBox_left {
            display: flex;
            align-items: center;

            .iconStyle {
                font-size: 26px;
                color: #A6CFFF;
            }

            span {
                font-size: 14px;
                color: #D0DEEE;
                text-align: center;
                padding-left: 10px;
                display: inline-block;
                border-left: 1px dashed rgba(255, 255, 255, 0.3);
            }
        }

        .deviceTypeBox_right {
            color: #fff;
            font-size: 18px;

            span {
                font-size: 12px;
            }
        }
    }
}

::-webkit-scrollbar {
    width: 5px;
    height: 5px;
    /* 设置滚动条的宽度 */
}
</style>