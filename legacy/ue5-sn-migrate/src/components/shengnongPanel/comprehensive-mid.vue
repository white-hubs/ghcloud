<template>
  <div class="panel">
    <SubPanelTemplate title="报警趋势分析" image="fx.png" class="visiting-data">
      <template #extra>
        <DateInlineForm
          class="shengNongColor"
          v-model:modelValue="workOrderTime"
          @search="changeReceptionTrendsTime"
        ></DateInlineForm>
      </template>
      <LineChart
        :x-data="gasChartData.xData"
        :series="gasChartData.yData"
        :showLegend="true"
        gridTop="15"
        :showBackground="true"
        :axisPointer="true"
        :titles="['报警总数', '已处理报警数']"
        :unit="{ x: '', y: '' }"
      />
    </SubPanelTemplate>
    <SubPanelTemplate title="报警记录" image="gc.png">
      <template #extra>
        <DateInlineForm
          class="shengNongColor"
          v-model:modelValue="tableTime"
          @search="changetableTime"
        ></DateInlineForm>
      </template>
      <RollTable :column="column" :data="tableData" @click-row="clickrow">
        <template #level="{ record }">
          <span :style="`color:${color[record.level - 1]}`">{{ record.level }}</span>
        </template>
      </RollTable>
    </SubPanelTemplate>
  </div>
  <Alarm
    v-if="alarmModalShow"
    @close="() => {
      closeModal()
      removeMarketToken()
    }"
    :isalarm="true"
    :alarmDetailData="alarmParameter"
  ></Alarm>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, watch } from "vue";
import RollTable from "../businessPanel/public/rollTable/index.vue";
import SubPanelTemplate from "../businessPanel/public/snPanelTemplate.vue";
import DateInlineForm from "../businessPanel/public/dateInlineForm.vue";
import LineChart from "../businessPanel/public/lineChart.vue";
import { ModelValueItf } from "../businessPanel/public/types";
import { getXDataByType, autoPage } from "../../utils/common";
import modalAlarmTable from "@/components/modal-table/modal-alart-sn-table.vue";
import { storeMarket } from "@/piniaStore/other";
import { alarmRecordPage, alarmTrendAnalysis } from "@/api/shennong/alarm";
import moment from "moment";
import { openAlarmDetail, removeMarketToken } from '@/components/hooks/useAlarm'
import Alarm from "@/components/alarmdetails/equipmentModesn.vue";


const piniaStoreMarket = storeMarket();
const workOrderTime = ref<ModelValueItf>({
  timeType: "THIS_YEAR",
  dateRange: [""],
});
const tableTime = ref<ModelValueItf>({
  timeType: "THIS_YEAR",
  dateRange: [""],
});
const alarmModalShow = ref(false);
const alarmParameter = ref<Record<string, any>>({
  dateRange: [],
});
const closeModal = () => {
  alarmModalShow.value = false;
};
const clickrow = async (record) => {
  await openAlarmDetail(record, (res)=>{
    alarmModalShow.value = true;
    alarmParameter.value = Object.assign(alarmParameter.value, record);
  })
};
let color = ["#E52121", "#F37712"];
const column = ref([
  {
    title: "报警事件",
    dataIndex: "event",
  },
  {
    title: "报警时间",
    dataIndex: "time",
  },

  {
    title: "报警市场",
    dataIndex: "name",
  },
  {
    title: "报警级别",
    dataIndex: "level",
    slots: {
      customRender: "level",
    },
  },
  {
    title: "报警类型",
    dataIndex: "type",
  },
  {
    title: "报警状态",
    dataIndex: "status",
  },
]);
const tableData = ref();
const page = reactive({
  total: 0,
  pageSize: 50,
  pageNumber: 1,
  pages: 0,
});
const changetableTime = async () => {
  alarmParameter.value.dateRange = tableTime.value.dateRange;
  let param = {
    period: tableTime.value.dateRange.join(","),
    type: tableTime.value.timeType,
    pageSize: page.pageSize,
    pageNumber: page.pageNumber,
    marketTenant: piniaStoreMarket.currentMarket,
  };
  let { records, total, pages } = await alarmRecordPage(param);
  autoPage(page, total, pages);
  tableData.value = records.map((item, index) => {
    return {
      ...item,
      event: item.alarmEventName || item.alarmTargetName,
      time: moment(item.alarmTime).format("YYYY-MM-DD HH:mm:ss"),
      name: item.marketName,
      level: item.alarmLevelName,
      type: item.alarmTypeName,
      status: item.alarmStatusName,
    };
  });
};

const gasChartData = reactive({
  xData: [],
  yData: [
    {
      name: "报警总数",
      data: [],
      linearGradientColor: ["rgba(97, 148, 247, 0.34)", "rgba(97, 148, 247, 0.02)"],
      lineColor: "#6194F7",
    },
    {
      name: "已处理报警数",
      data: [],
      linearGradientColor: ["rgba(148, 186, 249, 0.34)", "rgba(148, 186, 249, 0.02)"],
      lineColor: "rgba(149, 188, 249, 1)",
    },
  ],
});

const changeReceptionTrendsTime = async () => {
  let param = {
    period: workOrderTime.value.dateRange.join(","),
    type: workOrderTime.value.timeType,
    marketTenant: piniaStoreMarket.currentMarket,
  };
  let { alarmHandlerTrends, alarmTrends } = await alarmTrendAnalysis(param);
  let xData = alarmTrends.map((item) => {
    return item.period;
  });
  gasChartData.xData = getXDataByType(workOrderTime.value.timeType, xData);
  gasChartData.yData[0].data = alarmTrends.map((item) => {
    return item.totalNum;
  });
  gasChartData.yData[1].data = alarmHandlerTrends.map((item) => {
    return item.totalNum;
  });
};
let timer = null;
// 报警记录 每15秒轮播
onMounted(() => {
  timer = setInterval(() => {
    changetableTime();
  }, (window as any).config.pageLoopRequestTime);
});
onUnmounted(() => {
  clearInterval(timer);
});

watch(
  () => piniaStoreMarket.currentMarket,
  (n) => {
    changetableTime();
    changeReceptionTrendsTime();
  }
);
</script>
<style scoped lang="less">
.visiting-data {
  width: 49%;
  .title {
    color: #fff;
    font-size: 12px;
  }

  :deep(.sub-panel-content) {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;

    .item {
      width: 50%;
      height: 60px;
      margin-top: 30px;
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
          color: #d0deee;
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

.elevator-analysis {
  display: flex;
  justify-content: space-between;
  padding: 0 10px;
  align-items: center;
}
.more {
  width: 100%;
  cursor: pointer;
  margin-top: -5px;
  font-size: 14px;
  font-family: Source Han Sans CN-Regular, Source Han Sans CN;
  font-weight: 400;
  color: #6194f7;
  text-align: right;
}
.chart {
  flex: 1;
  height: 220px;
}
.panel {
  display: flex;
  justify-content: space-between;
}
</style>
