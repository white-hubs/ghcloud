<template>
  <div class="panel">
    <SubPanelTemplate title="报警情况统计" image="zh.png">
      <template #extra>
        <DateInlineForm
          class="shengNongColor"
          v-model:modelValue="workOrderTime"
          @search="changeReceptionTrendsTime"
        >
        </DateInlineForm>
      </template>
      <div class="elevator-analysis">
        <div style="width:100%;" v-if="!(morepieData && morepieData.some((item) => item.value > 0))">
          <noData />
        </div>
        <template v-else>
          <div class="chart">
            <moer-pie
              :data="morepieData"
              ref="morepie"
              :total="alarmtotal.total"
              :title="alarmtotal.title"
              style="width: 165px"
            ></moer-pie>
          </div>
          <snElevatorList
            @handlecurrent="handlecurrent"
            :contentList="morepieData"
            style="margin-left: 10px"
          >
          </snElevatorList>
          </template>
      </div>
    </SubPanelTemplate>

    <SubPanelTemplate title="报警分析" image="fx.png" class="fx">
      <template #extra>
        <DateInlineForm
          class="shengNongColor"
          v-model:modelValue="analysisTime"
          @search="changeReceptionAnalysisTime"
        >
        </DateInlineForm>
      </template>
      <div class="chart" v-if="gasChartData.xData.length > 0">
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
      </div>
      <div class="nodata" v-else>
        <noData />
      </div>
    </SubPanelTemplate>
    <SubPanelTemplate
      title="报警排名"
      image="tj.png"
      style="margin-top: 30px; min-height: 380px"
    >
      <template #extra>
        <DateInlineForm
          class="shengNongColor"
          v-model:modelValue="rankingTime"
          @search="changeReceptionRankingTime"
        >
        </DateInlineForm>
      </template>
      <div class="inspectTab">
        <a-tabs
          style="position: absolute; right: 0"
          v-model:activeKey="activeKey"
          @change="changeReceptionRankingTime"
        >
          <a-tab-pane key="ALARM_ALL" tab="报警数"></a-tab-pane>
          <a-tab-pane key="ALARM_HANDLER" tab="处理数" force-render></a-tab-pane>
        </a-tabs>
      </div>
      <div>
        <!-- <button @click="click">123</button> -->
        <!-- {{piniaStoreMarket.currentMarketName}} -->
        <div v-if="risk.length > 0" style="height: 370px; overflow: hidden">
          <vue3-seamless-scroll
            :list="risk"
            :step="0.5"
            hover
            :singleHeight="40"
            v-if="piniaStoreMarket.currentMarketName == ''"
          >
            <EventAlarmItem
              v-for="(item, index) in risk"
              :sort="item.rank"
              :ratio="item.ratio"
              :linkRatio="item.ratio"
              :count="item.count"
              :name="item.name"
              :sn="true"
              :width="item.width"
              @click="
                () => {
                  openModel(item);
                }
              "
            >
            </EventAlarmItem>
          </vue3-seamless-scroll>
          <div v-else>
            <EventAlarmItem
              v-for="(item, index) in risk"
              :sort="item.rank"
              :ratio="item.ratio"
              :linkRatio="item.ratio"
              :count="item.count"
              :name="item.name"
              :sn="true"
              :width="item.width"
              @click="
                () => {
                  openModel(item);
                }
              "
            >
            </EventAlarmItem>
          </div>
        </div>
        <div class="nodata" v-else>
          <noData />
        </div>
      </div>
    </SubPanelTemplate>
  </div>
  <modal-alarm-table
    :show-modal="alarmModalShow"
    @close="alarmModalShow = false"
    :parameter="alarmParameter"
  ></modal-alarm-table>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, watch } from "vue";
import { Vue3SeamlessScroll } from "vue3-seamless-scroll";
import LineChart from "@/components/businessPanel/public/lineChart.vue";
import SubPanelTemplate from "../../businessPanel/public/snPanelTemplate.vue";
import DateInlineForm from "../../businessPanel/public/dateInlineForm.vue";
import EventAlarmItem from "@/components/businessPanel/public/snEventItem.vue";
import snElevatorList from "@/components/businessPanel/public/sn-elevator-list.vue";
import MoerPie from "@/components/businessPanel/public/charts/pie/morepie.vue";
import { ModelValueItf } from "@/components/businessPanel/public/types";
import { autoPage, getXDataByType, getcurrentData, getallNumber } from "@/utils/common";
import { storeMarket } from "@/piniaStore/other";
import noData from "@/components/businessPanel/public/noData.vue";
import {
  alarmStatistics,
  alarmStatisticsRank,
  alarmTrendAnalysis,
} from "@/api/shennong/alarm";
import modalAlarmTable from "@/components/modal-table/modal-alart-sn-table.vue";
const applicationCode = "ELECTRICMANAGE";

const piniaStoreMarket = storeMarket();
const workOrderTime = ref<ModelValueItf>({
  timeType: "THIS_YEAR",
  dateRange: [""],
});
const rankingTime = ref<ModelValueItf>({
  timeType: "THIS_YEAR",
  dateRange: [""],
});
const analysisTime = ref<ModelValueItf>({
  timeType: "THIS_YEAR",
  dateRange: [""],
});

const alarmParameter = ref<Record<string, any>>({
  applicationCode: applicationCode,
  alarmTypeCode: applicationCode,
});
const alarmModalShow = ref<boolean>(false);
const openModel = (record) => {

  alarmModalShow.value = true;
  alarmParameter.value = Object.assign(alarmParameter.value, record);
  alarmParameter.value.alarmStatus =
    activeKey.value == "ALARM_ALL" ? "" : "ALARM_HANDLER";
};
const gasChartData = reactive({
  xData: [],
  yData: [
    {
      name: "报警总数",
      data: [],
      linearGradientColor: ["#6194F7", "#6194F7"],
      lineColor: "#6194F7",
    },
    {
      name: "已处理报警数",
      data: [],
      linearGradientColor: ["#67B9C1", "#67B9C1"],
      lineColor: "rgba(149, 188, 249, 1)",
    },
  ],
});
const activeKey = ref("ALARM_ALL");
const risk = ref([]);
const morepieData = ref();
const alarmtotal = ref({
  total: "",
  title: "",
});
const changeReceptionTrendsTime = async () => {
  let param = {
    period: workOrderTime.value.dateRange.join(","),
    type: workOrderTime.value.timeType,
    marketTenant: piniaStoreMarket.currentMarket,
    applicationCode: applicationCode,
  };
  let res: any = await alarmStatistics(param);

  let {
    ratio,
    confirmedRatio,
    actualRatio,
    handlerRatio,
    timeoutRatio,
    totalNum,
    confirmedNum,
    actualNum,
    handlerNum,
    timeoutNum,
  } = res;
  let total = totalNum + confirmedNum + actualNum + handlerNum + timeoutNum;

  morepieData.value = [
    {
      name: "电气报警占比",
      value: Number(ratio).toFixed(0),
      color: "#326bd3",
    },
    {
      name: "报警响应率",
      value: parseInt(confirmedRatio),
      color: "#3C85FC",
    },
    {
      name: "报警正确率",
      value: parseInt(actualRatio),
      color: "#7297D4",
    },
    {
      name: "报警处理率",
      value: parseInt(handlerRatio),
      color: "#7094d5",
    },
    {
      name: "报警超时率",
      value: parseInt(timeoutRatio),
      color: "#94BAF9",
    },
  ];
};
const page = reactive({
  total: 0,
  pageSize: 50,
  pageNumber: 1,
  pages: 0,
});
const changeReceptionRankingTime = async () => {
  alarmParameter.value.dateRange = rankingTime.value.dateRange;

  let param = {
    period: rankingTime.value.dateRange.join(","),
    type: rankingTime.value.timeType,
    stateRange: activeKey.value,
    pageSize: page.pageSize,
    pageNumber: page.pageNumber,
    // marketTenant: piniaStoreMarket.currentMarket,
    applicationCode: applicationCode,
  };
  let { records, total, pages } = await alarmStatisticsRank(param);
  // autoPage(page, total, pages)
  risk.value = [];
  if (Array.isArray(records) && records.length > 0) {
    risk.value = records
      .sort((a, b) => b.totalNum - a.totalNum)
      .map((item, index) => {
        return {
          ...item,
          rank: index + 1,
          name: item.marketName,
          count: item.totalNum,
          ratio: item.chainRatio,
          width: item.totalNum / getallNumber(records, "totalNum"),
        };
      });
  }
};
const changeReceptionAnalysisTime = async () => {
  let param = {
    period: analysisTime.value.dateRange.join(","),
    type: analysisTime.value.timeType,
    marketTenant: piniaStoreMarket.currentMarket,
    applicationCode: applicationCode,
  };
  let { alarmHandlerTrends, alarmTrends } = await alarmTrendAnalysis(param);
  let xData = alarmTrends.map((item) => {
    return item.period;
  });

  gasChartData.xData = getXDataByType(analysisTime.value.timeType, xData);
  gasChartData.yData[0].data = alarmTrends.map((item) => {
    return item.totalNum;
  });
  gasChartData.yData[1].data = alarmHandlerTrends.map((item) => {
    return item.totalNum;
  });
};
const handlecurrent = (item) => {
  alarmtotal.value.total = item.value;
  alarmtotal.value.title = item.name;
};
let timer = null;
// 报警排名 每15秒轮播
onMounted(() => {
  timer = setInterval(() => {
    changeReceptionTrendsTime();
    changeReceptionAnalysisTime();
  }, (window as any).config.pageLoopRequestTime);
});

watch(
  () => piniaStoreMarket.currentMarket,
  (n) => {
    changeReceptionTrendsTime();
    changeReceptionAnalysisTime();
  }
);
const currentMarketName = ref(true);
watch(
  () => piniaStoreMarket.currentMarketName,
  (n) => {
    currentMarketName.value = n == "" ? true : false;


    getcurrentData(risk.value, n, false);
  }
);
const click = () => {
  piniaStoreMarket.currentMarketName = "九江农批";
};
onUnmounted(() => {
  clearInterval(timer);
});
</script>
<style lang="less" scoped>
.visiting-data {
  height: 350px;
}
.elevator-analysis {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chart {
  flex: 1;
  height: 260px;
}

.inspectTab {
  height: 40px;
  text-align: right;
  margin-top: 10px;
  position: relative;

  :deep(.ant-tabs-tab-btn) {
    color: #93aadb;
  }

  :deep(.ant-tabs-nav::after) {
    content: none;
  }

  :deep(.ant-tabs-nav::before) {
    content: none;
  }

  :deep(.ant-tabs-tab-active) {
    background: linear-gradient(
      180deg,
      rgba(97, 148, 247, 0.0196) 0%,
      rgba(97, 148, 247, 0.5) 96%
    );
    color: #6194f7;
  }

  :deep(.ant-tabs-tab) {
    height: 22px;
  }
}
.nodata {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
}
.fx {
  height: 320px;
}
</style>
