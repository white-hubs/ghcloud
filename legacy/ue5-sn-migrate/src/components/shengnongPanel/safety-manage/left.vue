<template>
  <div class="panel">
    <SubPanelTemplate title="安全工作情况" image="aq.png" class="gz">
      <template #extra>
        <DateInlineForm
          class="shengNongColor"
          v-model:modelValue="workOrderTime"
          @search="changeWorkOrderTime"
        >
        </DateInlineForm>
      </template>
      <div class="elevator-analysis">
        <div style="width:100%;" v-if="!(workOrderStatustic.workerData && workOrderStatustic.workerData.some((item) => item.value > 0))">
          <noData />
        </div>
        <template v-else>
          <div style="height: 200px;">
            <moer-pie
              :data="workOrderStatustic.workerData"
              ref="morepie"
              :total="workOrderStatustic.total"
              :title="workOrderStatustic.title"
              style="width: 155px"
              :center="workOrderCenter"
            ></moer-pie>
          </div>
          <snElevatorList
            @handlecurrent="handlecurrent"
            :contentList="workOrderStatustic.workerData"
          ></snElevatorList>
        </template>
      </div>
    </SubPanelTemplate>
    <SubPanelTemplate
      title="隐患统计"
      image="yh.png"
      class="visiting-data"
      style="height: 350px"
    >
      <template #extra>
        <DateInlineForm
          class="shengNongColor"
          v-model:modelValue="hiddenDangerTime"
          @search="changeReceptionHiddenDangerTime"
        >
        </DateInlineForm>
      </template>
      <hiddenDanger :hidden-data="hiddenData" @openmodal="openmodal"></hiddenDanger>
      <div class="elevator-analysis">
        <div class="chart1">
          <elevator-analysis-pie
            @clickbar="openmodal"
            style="width: 155px"
            :pieData="pieData.arr"
            :radius="'75'"
          >
            <div style="color: #fff; text-align: center; font-size: 14px">
              {{ pieData.alarmTotal }}
            </div>
            <div style="color: #fff; text-align: center; font-size: 14px">隐患总数</div>
          </elevator-analysis-pie>
        </div>
        <elevatorAnalysisList
          :contentList="pieData.arr"
          style="margin-left: 10px"
        ></elevatorAnalysisList>
      </div>
    </SubPanelTemplate>
    <SubPanelTemplate title="小散工程记录" image="gc.png" class="visiting-data">
      <template #extra>
        <DateInlineForm
          class="shengNongColor"
          v-model:modelValue="recordTime"
          @search="changeReceptionRecordTime"
        >
        </DateInlineForm>
      </template>
      <!-- <button @click='click'>qewqe</button> -->
      <div class="chart" v-if="barData.xData.length !== 0">
        <StackedBar
          class="sbar"
          @clickbar="handleCurrent"
          :sn="true"
          :xData="barData.xData"
          :yData="barData.yData"
        />
        <!-- <overviewChartBar  @clickbar="handleCurrent"  :xData="barData.xData" :yData="barData.yData"
          :x-font-size="10.5">
        </overviewChartBar> -->
      </div>
      <div class="chart" v-else>
        <noData />
      </div>
    </SubPanelTemplate>
  </div>
  <modal-table
    v-if="showModal"
    :show="showModal"
    title="工程进度跟踪"
    @close="showModal = false"
  >
    <engineering :periodtime="recordTime.dateRange" :marketId="marketId"></engineering>
  </modal-table>
  <modal-table
    v-if="showModal1"
    :show="showModal1"
    title="隐患排查"
    @close="showModal1 = false"
  >
    <modal-record
      v-if="showModal1"
      :marketid="piniaStoreMarket.currentMarket"
      :periodtime="hiddenDangerTime.dateRange"
      :type="type"
      :status="status"
    ></modal-record>
  </modal-table>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, watch } from "vue";
import snElevatorList from "@/components/businessPanel/public/sn-elevator-list.vue";
import noData from "@/components/businessPanel/public/noData.vue";
import SubPanelTemplate from "../../businessPanel/public/snPanelTemplate.vue";
import DateInlineForm from "../../businessPanel/public/dateInlineForm.vue";
import { ModelValueItf } from "../../businessPanel/public/types";
import Radar from "../../../components/businessPanel/public/charts/radar/radar.vue";
import elevatorAnalysisPie from "../../businessPanel/public/charts/pie/elevator-analysis-pie.vue";
import elevatorAnalysisList from "../../businessPanel/public/elevator-analysis-list.vue";
import overviewChartBar from "../../businessPanel/hospital/overview-chartBar.vue";
import hiddenDanger from "./components/hidden-danger.vue";
import modalTable from "@/components/modal-table/modal.vue";
import ModalRecord from "@/components/shengnongPanel/common/yhtable.vue";
import { autoPage, HData, TwoArray } from "@/utils/common";
import { getrandom, getRandomFive } from "@/utils/enumeratie";
import MoerPie from "@/components/businessPanel/public/charts/pie/morepie.vue";
import {
  safetyWork,
  safetyHiddenDanger,
  safetyProjectRecord,
} from "@/api/shennong/compre";
import engineering from "./components/engineering.vue";
import StackedBar from "@/components/businessPanel/public/charts/stacked-bar/snstacked-bar.vue";

import dayjs from "dayjs";
import { storeMarket } from "@/piniaStore/other";
const piniaStoreMarket = storeMarket();
const showModal = ref(false);
const showModal1 = ref(false);
const workOrderTime = ref<ModelValueItf>({
  timeType: "THIS_YEAR",
  dateRange: [""],
});
const hiddenDangerTime = ref<ModelValueItf>({
  timeType: "THIS_YEAR",
  dateRange: [
    dayjs(new Date()).format("YYYY-MM-DD 00:00:00"),

    dayjs(new Date()).format("YYYY-MM-DD 23:59:59"),
  ],
});
const recordTime = ref<ModelValueItf>({
  timeType: "THIS_YEAR",
  dateRange: [""],
});
const workOrderCenter = ref(['45%', '40%'])
const workOrderStatustic = reactive({
  total: 0,
  title: "",
  workerData: [
    {
      name: "报警处理率",
      value: 0,
      color: "#326bd3",
    },
    {
      name: "隐患处理率",
      value: 0,
      color: "#3C85FC",
    },
    {
      name: "巡检任务完成率",
      value: 0,
      color: "#7297D4",
    },
    {
      name: "巡更任务完成率",
      value: 0,
      color: "#7094d5",
    },
    {
      name: "小散工程异常率",
      value: 0,
      color: "#94BAF9",
    },
    {
      name: "教育任务占比情况",
      value: 0,
      color: "#94BAF9",
    },
  ],
});
const hiddenData = ref([
  {
    label: "隐患总数",
    value: 102,
    color: "#fff",
    bgImg: "overView66.png",
  },
  {
    label: "待确认隐患数",
    value: 73,
    color: "#6194F7",
    bgImg: "overView65.png",
  },
  {
    label: "处理中隐患数",
    value: 98,
    color: "#EDBA55",
    bgImg: "overView64.png",
  },
]);
const riskPage = reactive({
  total: 0,
  pageSize: 5,
  pageNumber: 1,
  pages: 0,
});
const colors = ["#94BAF9", "#6C9BE8", "#3F7CDF", "#2989FF"];
const pieData = reactive({
  arr: [],
  alarmTotal: 0,
});
const barData = reactive({
  xData: [],
  yData: [
    {
      data: [10, 20, 30, 40, 34],
      name: "",
      color: ["rgba(97, 148, 247, 1)", "rgba(97, 148, 247, 0)"],
    },
  ],
});
const handlecurrent = (item) => {
  workOrderStatustic.title = item.name;
  workOrderStatustic.total = item.value;
};
const yhtype = {
  隐患总数: "",
  待确认隐患数: "WAITING_CONFIRM",
  处理中隐患数: "CONFIRMED",
};
const type = ref("");
const status = ref("");
const openmodal = (data) => {
  status.value = yhtype[data.label];
  type.value = data.name;
  showModal1.value = true;
};
const changeReceptionHiddenDangerTime = async () => {
  hiddenData.value[0].value = 0;
  hiddenData.value[1].value = 0;
  hiddenData.value[2].value = 0;
  let res = await safetyHiddenDanger({
    marketTenant: piniaStoreMarket.currentMarket,
    period:
      hiddenDangerTime.value.dateRange[0] + "," + hiddenDangerTime.value.dateRange[1],
  });
  hiddenData.value[0].value = res.totalNum;
  hiddenData.value[1].value = res.toBeConfirmedNum;
  hiddenData.value[2].value = res.inHandNum;
  pieData.alarmTotal = 0;
  pieData.arr = res.classifyNums.map((item, index) => {
    pieData.alarmTotal += item.num;
    return {
      name: item.classify,
      value: item.num,
      color: colors[index],
    };
  });
};
// const click=()=>{
//   piniaStoreMarket.currentMarketName='宁夏海吉星'

// }
const projectRecordList = ref([])
const currentindex = ref(0);
const changeReceptionRecordTime = async () => {
  currentindex.value += 1;
  let params = {
    period: recordTime.value.dateRange[0] + "," + recordTime.value.dateRange[1],
    pageSize: riskPage.pageSize,
    pageNumber: riskPage.pageNumber,
  };
  let { records, total, pages } = await safetyProjectRecord(params);
  // autoPage(riskPage, total, pages)
  projectRecordList.value = records;
  let page1 = records.length / riskPage.pageSize;
  if (currentindex.value >= Math.ceil(page1)) {
    currentindex.value = 0;
  }
  let xdata = records.map((item) => item.marketName);
  let ydata = records.map((item) => item.num);
  if (xdata.length > 0) {
    barData.xData = TwoArray(records, riskPage.pageSize)[currentindex.value].map(
      (item) => item.marketName
    );
  } else {
    barData.xData = [];
  }
  if (xdata.length > 0) {
    barData.yData = [
      {
        value: TwoArray(records, riskPage.pageSize)[currentindex.value].map(
          (item) => item.num
        ),
        marketlist: {
          xdata: TwoArray(xdata, riskPage.pageSize),
          ydata: TwoArray(ydata, riskPage.pageSize),
        },
      },
    ];
  } else {
    barData.yData = [
      {
        value: [],
        marketlist: {
          xdata: TwoArray(xdata, riskPage.pageSize),
          ydata: TwoArray(ydata, riskPage.pageSize),
        },
      },
    ];
  }
};
const marketId = ref()
const handleCurrent = (record) => {
  marketId.value = projectRecordList.value.find(e => e.marketName === record.name).marketTenant
  showModal.value = true;
};
const changeWorkOrderTime = async () => {
  let res = await safetyWork({
    marketTenant: piniaStoreMarket.currentMarket,
    period: workOrderTime.value.dateRange[0] + "," + workOrderTime.value.dateRange[1],
  });
  workOrderStatustic.total = 0;
  let total = 0;
  for (const key in res) {
    total += res[key];
  }
  total = Number(total.toFixed(0));

  workOrderStatustic.workerData[0].value = Number(res.alarmDispose) || 0;
  workOrderStatustic.workerData[1].value = Number(res.hiddenDangerDispose) || 0;
  workOrderStatustic.workerData[2].value = Number(res.inspectComplete) || 0;
  workOrderStatustic.workerData[3].value = Number(res.patrolComplete) || 0;
  workOrderStatustic.workerData[4].value = Number(res.projectError) || 0;
  workOrderStatustic.workerData[5].value = Number(res.educationProportion) || 0;

  // workOrderStatustic.title = workOrderStatustic.workerData[0].name;
  // workOrderStatustic.total = workOrderStatustic.workerData[0].value;
};
// 报警事件排名 报警记录 每15秒轮播
let timer = null;
onMounted(() => {
  timer = setInterval(() => {
    changeReceptionRecordTime();
  }, (window as any).config.pageLoopRequestTime);
});

onUnmounted(() => {
  clearInterval(timer);
});

watch(
  () => piniaStoreMarket.currentMarket,
  (n) => {
    changeWorkOrderTime();
    changeReceptionHiddenDangerTime();
    hiddenDangerTime();
  },
  { deep: true }
);
watch(
  () => piniaStoreMarket.currentMarketName,
  (n) => {
    if (n == "") {
      changeReceptionRecordTime();
      timer = setInterval(() => {
        changeReceptionRecordTime();
      }, (window as any).config.pageLoopRequestTime);
    } else {
      clearInterval(timer);
    }
  },
  { deep: true }
);
</script>
<style lang="less" scoped>
:deep(.sub-panel-header) {
  border-right: none;
}

.secure {
  :deep(.chart) {
    height: 100% !important;
  }

  .secure-list {
    // margin: 0 0 0 50px;
    // width: 116px;

    .secure-box {
      margin-bottom: 9px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);

      .secure-title {
        color: #a5b6da;
        font-size: 12px;
      }

      .secure-value {
        font-size: 12px;
        color: #baccde;
      }
    }
  }
}

.hidden-danger {
  .hidden-danger-box {
    width: 112px;
    height: 56px;
    padding: 8px 12px;

    .hidden-danger-name {
      font-size: 12px;
      color: #93aadb;
    }

    .hidden-danger-value {
      font-family: "PangMenZhengDao";
      font-size: 20px;
      color: #ffffff;
    }
  }
}

.elevator-analysis {
  margin-top: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.chart1 {
  flex: 1;
  height: 240px;
}
.chart {
  flex: 1;
  height: 260px;
}
.gz {
  height: 320px;
}
.gz {
  height: 320px;
}
</style>
