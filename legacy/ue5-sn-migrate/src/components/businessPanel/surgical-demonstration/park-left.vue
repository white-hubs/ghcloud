<template>
    <div class="panel">
        <SubPanelTemplate title="设备状态总览" class="supply-merchant">
            <situationAnalysis imgPath="overView5.png" :statistic="deviceSituationAnalysis"
                @click-num="handelClickDeviceNum"></situationAnalysis>
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
                    <span v-if="record.situation === 'ALARM_UN_CONFIRMED'" style="color: #f14545">告警</span>
                    <span v-else-if="record.situation === 'ALARM_PROGRESS_CONFIRMED'" style="color: #ffab10">故障</span>
                    <span v-else="record.situation === 'ALARM_CONFIRMED'" style="color: #00f27b">已处理</span>
                </template>
            </RollTable>
        </SubPanelTemplate>
        <SubPanelTemplate title="设备异常趋势">
            <template #extra>
                <DateInlineForm v-model:modelValue="workOrderTime" @search="changeHandleworkOrderTime"></DateInlineForm>
            </template>
            <div class="chart">
                <stackedLine :title="lineData.title" :yData="lineData.yData" :xData="lineData.xData"
                    :color="['#2989FF', '#FF6E23']"></stackedLine>
            </div>
        </SubPanelTemplate>
        <SubPanelTemplate title="示教设备分类">
            <div class="flex-between">
                <PlanPie :pieData="monitorSituationPieData">
                    <div class="content">
                        <div class="total-num">{{ total }}</div>
                        <div>设备总数</div>
                    </div>
                </PlanPie>
                <PieList :roundPieData="monitorSituationPieData" @handel-click-itemize="handleClickItemize"></PieList>
            </div>
        </SubPanelTemplate>
    </div>
    <modal-equipmentAll-table :show-modal="deviceAllModalShow" @close="deviceAllModalShow = false"
    :parameter="deviceAllParameter"></modal-equipmentAll-table>
    <!-- 异常设备清单弹窗 -->
    <FailedEquipmentModal title="异常设备清单" v-model="deviceModal" @close="closeModal" :footer="null" />
</template>
<script setup lang="ts">
import { onMounted, onUnmounted, reactive, ref } from "vue";
import situationAnalysis from "../overview/situation-analysis.vue";
import SubPanelTemplate from "../public/subPanelTemplate.vue";
import DateInlineForm from "../public/dateInlineForm.vue";
import stackedLine from "../public/charts/stackedLine/stackedLine.vue";
import RollTable from "../public/rollTable/index.vue";
import PlanPie from "../public/charts/pie/planePie.vue";
import PieList from "../public/pieList.vue";
import { ModelValueItf } from "../public/types";
import moment from "moment";
import FailedEquipmentModal from './components/failed-equipment-modal.vue';
import { AbnormalEquipment, getDeviceType } from '@/mock/surgical-demonstration'
import { getXaxleData } from '@/utils/common'
import modalEquipmentAllTable from "@/components/modal-table/modal-equipmentAll-table.vue";
import useCommon from "@/components/hooks/useCommon";
import { storeMenu } from "@/piniaStore/menu";
import { storeArea } from "@/piniaStore/area";

const piniaStoreMenu = storeMenu();
const piniaStoreArea = storeArea();
const deviceModal = ref<boolean>(false);
const { getEquipmentNumber } = useCommon();
const deviceAllModalShow = ref<boolean>(false);
const deviceAllParameter = reactive({
  areaId:piniaStoreArea.currentAreaId,
  tagCodes:[`custom.app::visual.${piniaStoreMenu.currentMenu}`],
  filterAreaIds:[],
  deviceState:undefined,
  dateRange:[],
})
const handleAll = () => {
    deviceModal.value = true
}
const closeModal = () => {
    deviceModal.value = false;
};
// 设备实时数据
const deviceDataInfo = async () => {
  let res: any = await getEquipmentNumber();
  if (!res.deviceNum) {
    return;
  }
  deviceSituationAnalysis.total = res.deviceNum;
  deviceSituationAnalysis.itemize[0].value = res.deviceStatusNums[0].num
  deviceSituationAnalysis.itemize[1].value = res.deviceStatusNums[1].num
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
        }
        // {
        //     label: "故障",
        //     value: 7,
        //     color: "#FFC700",
        //     key: "TROUBLE",
        // },
        // {
        //     label: "报警",
        //     value: 11,
        //     color: "#F14545",
        //     key: "ALARM",
        // },
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
            time: moment().format("MM-DD HH:mm"),
            name: "全景摄像机",
            situation: "ALARM_PROGRESS_CONFIRMED",
        },
        {
            time: moment().format("MM-DD HH:mm"),
            name: "医疗示教主机",
            situation: "ALARM_PROGRESS_CONFIRMED",
        },
        {
            time: moment().format("MM-DD HH:mm"),
            name: "术野摄像机",
            situation: "ALARM_UN_CONFIRMED",
        },
        {
            time: moment().format("MM-DD HH:mm"),
            name: "示教移动推车",
            situation: "ALARM_UN_CONFIRMED",
        },
        {
            time: moment().format("MM-DD HH:mm"),
            name: "医疗示教主机",
            situation: "ALARM_UN_CONFIRMED",
        },
        {
            time: moment().format("MM-DD HH:mm"),
            name: "全景摄像机",
            situation: "ALARM_PROGRESS_CONFIRMED",
        },
        {
            time: moment().format("MM-DD HH:mm"),
            name: "示教移动推车",
            situation: "ALARM_UN_CONFIRMED",
        },
    ],
});
const lineData = reactive({
    title: "次",
    xData: ['4', '8', '12', '16', '20', '24'],
    yData: [
        {
            data: [1, 2, 4, 5, 6, 8, 7],
            name: "故障次数",
            colors: [
                {
                    offset: 0,
                    color: "rgba(41, 137, 255, 1)",
                },
                {
                    offset: 1,
                    color: "rgba(41, 137, 255, 0.20)",
                },
            ],
        },
        {
            data: [10, 12, 14, 5, 86, 8, 7],
            name: "告警次数",
            colors: [
                {
                    offset: 0,
                    color: "rgba(255, 110, 35, 1)",
                },
                {
                    offset: 1,
                    color: "rgba(255, 110, 35, 0.02)",
                },
            ],
        },
    ],
});
const total = ref(133)
const monitorSituationColors = ref<string[]>([
    "#FFAB10",
    "#2F8DFF",
    "#F14545",
    "#19F8F7",
]);
const monitorSituationPieData = ref<{ label: string; value: number; color: string }[]>(
    [
        { label: "医疗示教主机", value: 18, color: "#FFAB10" },
        { label: "示教移动推车", value: 25, color: "#2F8DFF" },
        { label: "术野摄像机", value: 34, color: "#F14545" },
        { label: "全景摄像机", value: 56, color: "#19F8F7" },
    ]
);
const handelClickDeviceNum = (item?: any) => {
    deviceAllModalShow.value = true;
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
    lineData.yData[0].data = AbnormalEquipment(workOrderTime.value.timeType)[0]
    lineData.yData[1].data = AbnormalEquipment(workOrderTime.value.timeType)[1]
    lineData.xData = getXaxleData(workOrderTime.value.timeType)
};
const appointmentTime = ref({
    timeType: null
});
const changeAppointmentTime = (): void => {
    let res = getDeviceType(appointmentTime.value.timeType)
    res.forEach((item, index) => {
        monitorSituationPieData.value[index].value = item
    })
    const appointmentTotalNum = monitorSituationPieData.value.reduce(function (total, value) {
        return total + value.value;
    }, 0);
    total.value = 0
    monitorSituationPieData.value = monitorSituationPieData.value.map(e => {
        total.value += e.value
        return {
            ...e,
            label: e.label + `（${(e.value / appointmentTotalNum * 100).toFixed(2)}%）`
        }
    })
}
onMounted(() => {
   deviceDataInfo()
   changeHandleworkOrderTime()
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
            color: #fff;
            font-size: 14px;
            span {
                color: #FFC700;
            }
        }

        .dataTitle-right {
            cursor: pointer;
            color: #60A7FF;
        }
    }

    .product-table {
        height: 280px;
    }

    .chart {
        height: 240px;
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
  