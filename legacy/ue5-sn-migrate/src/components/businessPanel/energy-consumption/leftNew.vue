<template>
    <div class="panel">
        <SubPanelTemplate title="能碳概览" class="visiting-data">
            <template #extra>
                <DateInlineForm v-model:modelValue="workOrderTime" @search="changeHandleworkOrderTime"></DateInlineForm>
            </template>
            <div class="item" v-for="item in visitingData" :key="item.title">
                <a-statistic :title="item.title">
                    <template #formatter>
                        <count-to :startVal="0" :endVal="item.value" :duration="1000" separator=""></count-to>
                        <div class="ringRatio">
                            <span>环比</span>
                            <!-- uptriangle 向上三角根据Prop改变 -->
                            <div :class="['downtriangle', item.ratio > 0 && 'uptriangle']"></div>
                            <div :class="[item.ratio > 0 ? 'up' : 'down']">{{ item.ratio + "%" }}</div>
                        </div>
                    </template>
                </a-statistic>
            </div>
        </SubPanelTemplate>
        <SubPanelTemplate title="综合能耗趋势">
            <template #extra>
                <DateInlineForm :timeList="timeList" v-model:modelValue="energyConsumption"
                    @search="changeHandleEnergyConsumptionTime">
                </DateInlineForm>
            </template>
            <div class="chart">
                <LineChart :x-data="receptionTrendsChartData.xData" :series="receptionTrendsChartData.yData"
                    :showLegend="false" gridTop="4" :unit="{ x: '', y: '' }" />
            </div>
        </SubPanelTemplate>
        <SubPanelTemplate title="碳排量趋势图">
            <template #extra>
                <DateInlineForm :timeList="timeList" v-model:modelValue="carbonTime" @search="changeCarbonTime">
                </DateInlineForm>
            </template>
            <div class="chart">
                <LineChart :x-data="carbonEmissionsData.xData" :series="carbonEmissionsData.yData" :showLegend="false"
                    gridTop="4" :unit="{ x: '', y: '' }" />
            </div>
        </SubPanelTemplate>
        <SubPanelTemplate title="报警记录">
            <template #extra>
                <DateInlineForm v-model:modelValue="takeNotes" @search="changeTakeNotes"></DateInlineForm>
            </template>
            <div class="body">
                <OperateDays title="报警总数" :value="alarmCon.count" class="body-num"></OperateDays>
                <div class="pie-chart">
                    <Pie :data="alarmsNumber" :x-data="pieData" />
                    <TipsCount v-for="(item, index) in pieData" :status="String(index)" :count="item.value" />
                </div>
                <div class="footer">
                    <RollTable :column="column" :data="listData" @click-row="handelClickRow">
                        <template #alarmStatus="{ record }">
                            <span v-if="record.alarmStatus === 'ALARM_UN_CONFIRMED'" style="color: #f14545">待处理</span>
                            <span v-else-if="record.alarmStatus === 'ALARM_PROGRESS_CONFIRMED'"
                                style="color: #ffab10">处理中</span>
                            <span v-else="record.alarmStatus === 'ALARM_CONFIRMED'" style="color: #00f27b">已处理</span>
                        </template>
                    </RollTable>
                </div>
            </div>
        </SubPanelTemplate>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive,onMounted} from 'vue'
import SubPanelTemplate from "../public/subPanelTemplate.vue";
import DateInlineForm from "../public/dateInlineForm.vue";
import LineChart from "@/components/businessPanel/public/lineChart.vue";
import CountTo from "@/components/businessPanel/public/count-to/count-to.vue";
import VisitingDataPic from "@/components/businessPanel/triage-queue/components/visiting-data-pic.vue";
import OperateDays from "../public/operateDays.vue";
import { ModelValueItf } from '../public/types';
import { getAssetsImage } from '@/utils/getImage';
import { dcStatTrend, statCategoryAll, statTimeCategory } from '@/api/energy';
import useCommon from '@/components/hooks/useCommon';
import Pie from "../public/pie.vue";
import TipsCount from "../public/tipsCount.vue";
import RollTable from "../public/rollTable/index.vue";
import bus from '@/utils/bus';

const workOrderTime = ref<ModelValueItf>();
const energyConsumption = ref<ModelValueItf>({   
    timeType: 'THIS_WEEK',
    dateRange: ['']});
const carbonTime = ref<ModelValueItf>(
    {
        timeType: 'THIS_WEEK',
        dateRange: ['']
    }
);
let alarmsNumber = ref<number>(0);
const timeList = [
    { label: "本周", value: "THIS_WEEK" },
    { label: "本月", value: "THIS_MONTH" },
    { label: "今年", value: "THIS_YEAR" }
]
const pieData = ref([]);
const listData = ref([]);
const alarmCon = ref({
  count: 0,
  ratio: 10,
});
const column = reactive([
  {
    title: "报警时间",
    dataIndex: "alarmTime",
    width: 120,
  },
  {
    title: "报警级别",
    dataIndex: "alarmLevelName",
  },
  {
    title: "报警事件",
    dataIndex: "alarmEventName",
  },
  {
    title: "状态",
    dataIndex: "alarmStatus",
    slots: {
      customRender: "alarmStatus",
    },
  },
]);
const {
  piniaStoreArea,
  piniaStoreMenu,
  takeNotes,
  getAlarmTakeNotes,
  getAlarmsNumber,
} = useCommon();
// 群控组实时数据
const visitingData = ref([
    { title: "综合能耗tce", value: 0, img: getAssetsImage('overView43.png'), ratio: 0 },
    { title: "碳排量kg CO₂e", value: 0, img: getAssetsImage('overView12.png'), ratio: 0 },
])
const carbonEmissionsData = reactive({
    xData: [],
    yData: [
        { data: [], linearGradientColor: ['rgba(120, 252, 252, 1)', 'rgba(120, 252, 252, 0.1)'], lineColor: 'rgba(120, 252, 252, 1)' },
    ]
})
const receptionTrendsChartData = reactive({
    xData: [],
    yData: [
        { data: [], linearGradientColor: ['rgba(120, 252, 252, 1)', 'rgba(120, 252, 252, 0.1)'], lineColor: 'rgba(120, 252, 252, 1)' },
    ]
})
// 综合能耗趋势
const changeHandleEnergyConsumptionTime =async () => {
    const params={
    period:energyConsumption.value.dateRange.join(","),
    type:energyConsumption.value.timeType
    }
  let res= await dcStatTrend(params)
   receptionTrendsChartData.xData = res.map(item=>item.time)
   receptionTrendsChartData.yData[0].data = res.map(item=>item.value)
};
const changeCarbonTime = async () => {
    const params={
    period:carbonTime.value.dateRange.join(","),
    type:carbonTime.value.timeType
    }
    const res = await statTimeCategory(params)
   carbonEmissionsData.xData = res.map(item=>item.time)
   carbonEmissionsData.yData[0].data = res.map(item=>item.value)
}
// 能碳概览
const changeHandleworkOrderTime = async() => {
 const params={
    period:workOrderTime.value.dateRange.join(","),
    type:workOrderTime.value.timeType
  }
  let res = await statCategoryAll(params)
  res.forEach(item=>{
    if (item.instrumentType === 'carbon') {
        visitingData.value[1].value = item.value
        visitingData.value[1].ratio = item.qoqValueRate || 0
    }else if (item.instrumentType === 'zh') {
        visitingData.value[0].value = item.value
        visitingData.value[0].ratio = item.qoqValueRate || 0
    }
  })
};

// 报警记录
async function changeTakeNotes() {
  let param = {
    sceneType: piniaStoreMenu.currentMenu,
    areaId: piniaStoreArea.currentAreaId,
    period: takeNotes.value.dateRange.join(","),
    type: takeNotes.value.timeType,
    pageSize: 50,
    pageNumber: 1,
  };
  let data = await getAlarmTakeNotes(param);
  alarmCon.value = await getAlarmsNumber(param);
  listData.value = data.listData;
  alarmsNumber.value = data.alarmsNumber;
  pieData.value = data.pieData;
  
}
const handelClickRow = (record) => {
  if (record.alarmTargetCode) {
    bus.emit("equipmentPosition", record);
  }
};
</script>
<style lang="less" scoped>
.visiting-data {
    :deep(.sub-panel-content) {
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;

        .item {
            width: 50%;
            height: 60px;
            margin-top: 10px;
            display: inline-flex;
            align-items: center;
            box-sizing: border-box;
            padding-left: 20px;

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
        }
    }
}

.pie-chart {
    display: flex;
    height: 100px;
    justify-content: center;

    >div {
        width: 100px;
        align-items: center;
        margin-left: 10px;
    }
}
</style>