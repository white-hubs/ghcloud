<template>
  <div class="panel">
    <SubPanelTemplate title="安全巡检统计" image="xj.png" class="visiting-data inspectCard">
      <template #extra>
        <DateInlineForm
          class="shengNongColor"
          v-model:modelValue="workOrderTime"
          @search="changeReceptionTrendsTime"
        >
        </DateInlineForm>
      </template>
      <div>
        <hiddenDanger :hidden-data="hiddenData" @openmodal="openInspect"></hiddenDanger>
        <div class="inspectTab">
          <a-tabs
            @change="getInspectList"
            style="position: absolute; right: 0"
            v-model:activeKey="activeKey"
          >
            <a-tab-pane key="" tab="任务数"></a-tab-pane>
            <a-tab-pane key="OVER" tab="处理数" force-render></a-tab-pane>
            <a-tab-pane key="EXECUTING" tab="响应数"></a-tab-pane>
            <a-tab-pane key="TEMPINSPECTION" tab="临时巡检数"></a-tab-pane>
          </a-tabs>
        </div>
        <div class="riskList" v-if="risk.length !== 0">
          <vue3-seamless-scroll
            v-if="piniaStoreMarket.currentMarketName == ''"
            :list="risk"
            :step="0.5"
            hover
            :singleHeight="40"
          >
            <EventAlarmItem
              style="cursor: pointer"
              @click="openInspect(item)"
              v-for="(item, index) in risk"
              :width="item.width"
              :sort="item.sort"
              :ratio="item.ratio"
              :count="item.count"
              :name="item.name"
            >
            </EventAlarmItem>
          </vue3-seamless-scroll>
          <div v-else>
            <EventAlarmItem
              style="cursor: pointer"
              @click="openInspect(item)"
              v-for="(item, index) in risk"
              :width="item.width"
              :sort="item.sort"
              :ratio="item.ratio"
              :count="item.count"
              :name="item.name"
            >
            </EventAlarmItem>
          </div>
        </div>
        <div style="height: 250px" v-else>
          <noData />
        </div>
      </div>
    </SubPanelTemplate>
    <SubPanelTemplate title="安全巡更统计" image="xg.png" class="visiting-data tj">
      <!-- <button @click='click'>123</button>
        <button @click='click1'>1223</button> -->
      <template #extra>
        <DateInlineForm
          class="shengNongColor"
          v-model:modelValue="secureTime"
          @search="changeReceptionSecureTime"
        >
        </DateInlineForm>
      </template>
      <StackedBar
        v-if="alarmStatisticsData.chartData.xData.length !== 0"
        @clickbar="openshowNightPatrol"
        style="margin: 0 0 20px 0"
        color="['#6AE0E4','#95BCF9','#6194F7']"
        :xData="alarmStatisticsData.chartData.xData"
        :yData="alarmStatisticsData.chartData.yData"
        :sn="true"
      />
      <noData v-else />
    </SubPanelTemplate>
    <SubPanelTemplate
      title="风险源统计"
      image="jy.png"
      class="visiting-data"
      style="margin-top: 20px"
    >
      <!-- <template #extra>
        <DateInlineForm
          class="shengNongColor"
          v-model:modelValue="educationTime"
          @search="changeReceptionEducationTime"
        >
        </DateInlineForm>
      </template> -->
      <div v-if="barData.xData.length !== 0">
        <hiddenDanger :hidden-data="hiddenData1" @openmodal="open"></hiddenDanger>
        <div class="chart">
          <StackedBare
            @clickbar="clickbar"
            :sn="true"
            :xData="barData.xData"
            :yData="barData.yData"
          />
          <!-- <overviewChartBar
            @clickbar="clickbar"
            :xData="barData.xData"
            :yData="barData.yData"
            :x-font-size="10.5"
          >
          </overviewChartBar> -->
        </div>
      </div>
      <noData v-else />
    </SubPanelTemplate>
  </div>
  <inspectModel
    :marketName="marketName"
    v-if="showInspectModel"
    :time="workOrderTime.dateRange.join(',')"
    :title="'巡检记录'"
    :state="recordstate"
    :show-modal="showInspectModel"
    @close="showInspectModel = false"
  ></inspectModel>
  <tempInspectModel
    :marketName="marketName"
    v-if="showTempInspectModel"
    :time="workOrderTime.dateRange.join(',')"
    :title="'临时巡检记录'"
    :state="recordstate"
    :show-modal="showTempInspectModel"
    @close="showTempInspectModel = false"
  ></tempInspectModel>
  <nightPatrol
    :marketName="marketName"
    :marketid="marketid"
    :status="statusName"
    v-if="showNightPatrol"
    :time="secureTime.dateRange.join(',')"
    :title="'巡更记录'"
    :show-modal="showNightPatrol"
    @close="showNightPatrol = false"
  ></nightPatrol>

  <modal-table :show="showmodal" title="风险源统计" @close="close">
    <modal-record
      v-if="showmodal"
      :marketName="wxMarket"
      :type="datatype"
      :periodtime="educationTime.dateRange.join(',')"
    ></modal-record>
  </modal-table>
</template>

<script setup lang="ts">
import { Vue3SeamlessScroll } from "vue3-seamless-scroll";
import { ModelValueItf } from "@/components/businessPanel/public/types";
import noData from "@/components/businessPanel/public/noData.vue";
import { ref, reactive, onMounted, onUnmounted, watch } from "vue";
import SubPanelTemplate from "../../businessPanel/public/snPanelTemplate.vue";
import DateInlineForm from "../../businessPanel/public/dateInlineForm.vue";
import hiddenDanger from "./components/hidden-danger.vue";
import EventAlarmItem from "../../businessPanel/public/snEventItem.vue";
import StackedBar from "../../businessPanel/public/charts/stacked-bar/stacked-bar.vue";
import inspectModel from "./components/inspect-model.vue";
import tempInspectModel from "./components/temp-inspect-model.vue";
import nightPatrol from "./components/night-patrol.vue";
import modalTable from "@/components/modal-table/modal.vue";
import ModalRecord from "../gasPanel/gastable.vue";
import { storeMarket } from "@/piniaStore/other";
import StackedBare from "@/components/businessPanel/public/charts/stacked-bar/snstacked-bar.vue";

const piniaStoreMarket = storeMarket();
import overviewChartBar from "../../businessPanel/hospital/overview-chartBar.vue";
import { getrandom, getRandomFive } from "@/utils/enumeratie";
import { autoPage, getallNumber, HData, getcurrentData, TwoArray } from "@/utils/common";
import {
  safetyInspection,
  safetyMarketInspection,
  safetyPatrol,
  propertyFilingStatistics,
  propertyFilingList,
  safetyMarketInspectionTemp,
} from "@/api/shennong/compre";
const workOrderTime = ref<ModelValueItf>({
  timeType: "THIS_YEAR",
  dateRange: [""],
});
const secureTime = ref<ModelValueItf>({
  timeType: "THIS_YEAR",
  dateRange: [""],
});
const educationTime = ref<ModelValueItf>({
  timeType: "THIS_YEAR",
  dateRange: [""],
});
const showmodal = ref(false);
const close = () => {
  showmodal.value = false;
};
const hiddenData = ref([
  {
    label: "巡检任务总数",
    value: 0,
    color: "#fff",
    bgImg: "overView66.png",
  },
  {
    label: "待接受任务数",
    value: 0,
    color: "#6194F7",
    bgImg: "overView65.png",
  },
  {
    label: "进行中任务数",
    value: 0,
    color: "#EDBA55",
    bgImg: "overView66.png",
  },
  {
    label: "临时巡检数",
    value: 0,
    color: "#6194F7",
    bgImg: "overView66.png",
  },
]);
const marketName = ref("");
const activeKey = ref("");
const risk = ref([]);
const barData = reactive({
  xData: [],
  yData: [
    {
      data: [],
      name: "",
      color: ["rgba(97, 148, 247, 1)", "rgba(97, 148, 247, 0)"],
    },
  ],
});
const alarmStatisticsData = reactive({
  chartData: {
    xData: [],
    yData: [
      // { name: "待确认", value: [], color: "#95BCF9" },
      // { name: "处理中", value: [], color: "#6194F7" },
      // { name: "已处理", value: [], color: "#6AE0E4" },
    ],
  },
});
const hiddenData1 = ref([
  {
    label: "氧气瓶总数",
    value: 0,
    color: "#fff",
    bgImg: "overView66.png",
    data: "OXYGEN_CYLINDER",
  },
  {
    label: "电动车总数",
    value: 0,
    color: "#6194F7",
    bgImg: "overView65.png",
    data: "ELECTRO_MOBILE",
  },
  {
    label: "消防设备数",
    value: 0,
    color: "#EDBA55",
    bgImg: "overView64.png",
    data: "FIRE_FIGHTING_EQUIPMENT",
  },
]);
const showInspectModel = ref(false);
const showTempInspectModel = ref(false);
const showNightPatrol = ref(false);
const market = reactive({
  total: 0,
  pageSize: 50,
  pageNumber: 1,
  pages: 0,
});
const secureList = reactive({
  total: 0,
  pageSize: 5,
  pageNumber: 1,
  pages: 0,
});
const propertyList = reactive({
  total: 0,
  pageSize: 50,
  pageNumber: 1,
  pages: 0,
});
const changeReceptionTrendsTime = async () => {
  hiddenData.value[1].value = 0;
  hiddenData.value[2].value = 0;
  hiddenData.value[0].value = 0;
  hiddenData.value[3].value = 0;
  let res = await safetyInspection({
    period: workOrderTime.value.dateRange.join(","),
    marketTenant: piniaStoreMarket.currentMarket,
  });
  hiddenData.value[1].value = res.waitAcceptNum;
  hiddenData.value[2].value = res.underwayTaskNum;
  hiddenData.value[0].value = res.inspectionTaskNum;
  hiddenData.value[3].value = res.tempInspectionNum;
  getInspectList();
};
const getInspectList = async () => {
  let result = { total: 0, records: [], pages: 0 }
  if (activeKey.value === 'TEMPINSPECTION') {
    let params = {
      period: workOrderTime.value.dateRange.join(","),
      type: workOrderTime.value.timeType,
      pageSize: market.pageSize,
      pageNumber: market.pageNumber,
    };
    result = await safetyMarketInspectionTemp(params);
  } else {
    let params = {
      taskStatus: activeKey.value,
      period: workOrderTime.value.dateRange.join(","),
      type: workOrderTime.value.timeType,
      pageSize: market.pageSize,
      pageNumber: market.pageNumber,
    };
    result = await safetyMarketInspection(params);
  }
  let { records, total, pages } = result
  autoPage(market, total, pages);
  // HData()
  risk.value = records.map((item, index) => {
    return {
      name: item.marketName,
      marketName: item.marketName,
      count: item.taskNum,
      ratio: item.ratio,
      sort: index + 1,
      marketTenant: item.marketTenant,
      width: item.taskNum / getallNumber(records, "taskNum"),
    };
  });
  //   let page=records.length/market.pageSize
  //  const {start,end}= HData(market,records.length,Math.round(page))
  //   risk.value=risk.value.slice(start,end)
};
const handleColors = ["#6AE0E4", "#95BCF9", "#6194F7", "#2F78F1"];
const Xdata = ref([]);
const currentindex = ref(0);
const changeReceptionSecureTime = async () => {
  currentindex.value += 1;
  let params = {
    period: secureTime.value.dateRange.join(","),
    pageSize: secureList.pageSize,
    pageNumber: secureList.pageNumber,
  };
  let { records, total, pages } = await safetyPatrol(params);
  // autoPage(secureList, total, pages)
  let { xdata, ydata } = records[0];
  const xlist = TwoArray(xdata, secureList.pageSize);

  let page = xdata.length / secureList.pageSize;
  if (currentindex.value >= Math.ceil(page)) {
    currentindex.value = 0;
  }
  alarmStatisticsData.chartData.xData =
    xlist.length > 0 ? xlist[currentindex.value].map((item) => item.marketName) : [];

  alarmStatisticsData.chartData.yData = ydata.map((item, index) => {
    return {
      name: item.name,
      value: TwoArray(item.value, secureList.pageSize)[currentindex.value],
      datavalue: item.value,
      color: handleColors[index % handleColors.length],
      marketlist: {
        xdata: xlist,
        ydata: TwoArray(item.value, secureList.pageSize),
      },
    };
  });
  Xdata.value = records[0].xdata;
};
const page = reactive({
  total: 0,
  pageSize: 5,
  pageNumber: 1,
  pages: 0,
});
const currentindexa = ref(0);
const changeReceptionEducationTime = async () => {
 let res = await propertyFilingStatistics({
    // period: educationTime.value.dateRange.join(","),
    marketTenant: piniaStoreMarket.currentMarket,
  });
  hiddenData1.value[0].value = res.flammableEquipmentNum;
  hiddenData1.value[1].value = res.electricVehicleNum;
  hiddenData1.value[2].value = res.fireFightingEquipmentNum;
  getPropertyList();
};
const getPropertyList = async () => {
  currentindexa.value += 1;
  let params = {
    period: educationTime.value.dateRange.join(","),
    pageSize: page.pageSize,
    pageNumber: page.pageNumber,
    marketTenant: piniaStoreMarket.currentMarket,
  };
  let { records, total, pages } = await propertyFilingList(params);
  // autoPage(secureList, total, pages);
  let newdata = JSON.parse(JSON.stringify(records));
  let page1 = records.length / page.pageSize;
  if (currentindexa.value >= Math.ceil(page1)) {
    currentindexa.value = 0;
  }
  let xdata = records.map((item) => item.marketName);
  let ydata = records.map((item) => item.num);
  barData.xData = TwoArray(records, page.pageSize)[currentindexa.value].map(
    (item) => item.marketName
  );
  barData.yData = [
    {
      value: TwoArray(records, page.pageSize)[currentindexa.value].map(
        (item) => item.num
      ),
      marketlist: {
        xdata: TwoArray(xdata, page.pageSize),
        ydata: TwoArray(ydata, page.pageSize),
      },
    },
  ];
};

const wxMarket = ref("");
const clickbar = (data) => {
  showmodal.value = true;
  datatype.value = "";

  wxMarket.value = data.name;
  if (piniaStoreMarket.currentMarketName !== "") {
    wxMarket.value = piniaStoreMarket.currentMarketName;
  }
};
const datatype = ref("");
const open = (item) => {
  datatype.value = item.data;
  if (piniaStoreMarket.currentMarketName !== "") {
    wxMarket.value = piniaStoreMarket.currentMarketName;
  } else {
    wxMarket.value = "";
  }
  showmodal.value = true;
};
const recordstate = ref("");
const statetype = {
  巡检任务总数: "",
  待接受任务数: "ACCEPT",
  进行中任务数: "EXECUTING",
  临时巡检数: "TEMPINSPECTION",
};
const openInspect = (item) => {
  recordstate.value = statetype[item.label];
  if (!item.label) {
    recordstate.value = activeKey.value;
  }

  if (item) {
    marketName.value = item.marketTenant;
  } else {
    marketName.value = "";
  }
  if (recordstate.value === 'TEMPINSPECTION') {
    showTempInspectModel.value = true;
    showInspectModel.value = false;
  } else {
    showInspectModel.value = true;
    showTempInspectModel.value = false;
  }
};
const marketid = ref("");
const statusName = ref("");
const openshowNightPatrol = (item) => {
  // marketName.value= alarmStatisticsData.chartData.xData.find(res=>res.marketName==item.name)?.marketTenant
  marketid.value = Xdata.value.find((res) => res.marketName == item.name)?.marketTenant;
  showNightPatrol.value = true;
  statusName.value = item.name;
};
let timer = null;
onMounted(() => {
  changeReceptionEducationTime();
  timer = setInterval(() => {
    // getInspectList();
    getPropertyList();
    changeReceptionSecureTime();
    changeReceptionEducationTime();
  }, (window as any).config.pageLoopRequestTime);
});

const currentMarketName = ref(true);

watch(
  () => piniaStoreMarket.currentMarketName,
  async (n) => {
    if (n == "") {
      currentMarketName.value = true;
      changeReceptionSecureTime();
      changeReceptionEducationTime();
      timer = setInterval(() => {
        // getInspectList();
        getPropertyList();
        changeReceptionSecureTime();
      }, (window as any).config.pageLoopRequestTime);
    } else {
      clearInterval(timer);
      changeReceptionSecureTime();
      changeReceptionEducationTime();
      getPropertyList();
      currentMarketName.value = getcurrentData(risk.value, n);
      hiddenData.value[1].value = 0;
  hiddenData.value[2].value = 0;
  hiddenData.value[0].value = 0;
  hiddenData.value[3].value = 0;
  let res = await safetyInspection({
    period: workOrderTime.value.dateRange.join(","),
    marketTenant: piniaStoreMarket.currentMarket,
  });
  hiddenData.value[1].value = res.waitAcceptNum;
  hiddenData.value[2].value = res.underwayTaskNum;
  hiddenData.value[0].value = res.inspectionTaskNum;
  hiddenData.value[3].value = res.tempInspectionNum;
      // changeReceptionEducationTime();
      // changeReceptionTrendsTime();
    }
  }
);
onUnmounted(() => {
  clearInterval(timer);
});
</script>
<style lang="less" scoped>
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
:deep(.inspectCard .hidden-danger .hidden-danger-box .hidden-danger-name){
  white-space: nowrap;
}
:deep(.inspectCard .hidden-danger .hidden-danger-box){
  width: 30%;
  overflow: hidden;
  background-size: cover;
}
:deep(.inspectCard .ant-tabs > .ant-tabs-nav){
  display: inline-block;
}

.elevator-analysis {
  display: flex;
  justify-content: space-between;
  padding: 0 10px;
  align-items: center;
}

.chart {
  flex: 1;
  height: 180px;
}

.riskList {
  overflow: hidden;
  height: 250px;
}
.tj {
  height: 265px;
}
</style>
