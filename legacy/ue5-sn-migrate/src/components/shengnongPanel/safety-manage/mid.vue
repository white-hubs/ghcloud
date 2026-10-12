<template>
  <div class="panel">
    <SubPanelTemplate title="预案文件统计" image="fx.png" class="visiting-data">
      <template #extra>
        <DateInlineForm
          class="shengNongColor"
          v-model:modelValue="workOrderTime"
          @search="changeReceptionTrendsTime"
        ></DateInlineForm>
      </template>
      <div class="elevator-analysis" v-if="pieData.length > 0">
        <div class="chart">
          <elevator-analysis-pie
            style="width: 155px"
            :pieData="pieData"
            :radius="'75'"
            @clickbar="clickbar1"
          >
            <div style="color: #fff; text-align: center; font-size: 14px">
              {{ getallNumber(pieData, "value") }}
            </div>
            <div style="color: #fff; text-align: center; font-size: 14px">文件总数</div>
          </elevator-analysis-pie>
        </div>
        <elevatorAnalysisList
          :contentList="pieData"
          style="margin-left: 80px"
        ></elevatorAnalysisList>
      </div>
      <div style="width: 100%" v-else>
        <noData />
      </div>
    </SubPanelTemplate>
    <SubPanelTemplate title="安全教育统计" image="gc.png" class="visiting-data">
      <template #extra>
        <DateInlineForm
          class="shengNongColor"
          v-model:modelValue="tableTime"
          @search="changetableTime"
        ></DateInlineForm>
      </template>
      <div class="elevator-analysis" v-if="pieData1.arr.length">
        <div class="chart">
          <elevator-analysis-pie
            style="width: 155px"
            :pieData="pieData1.arr"
            :radius="'75'"
          >
            <div style="color: #fff; text-align: center; font-size: 14px">
              {{ getallNumber(pieData1.arr, "value") }}
            </div>
            <div style="color: #fff; text-align: center; font-size: 14px">任务总数</div>
          </elevator-analysis-pie>
        </div>
        <elevatorAnalysisList
          :contentList="pieData1.arr"
          style="margin-left: 80px"
        ></elevatorAnalysisList>
      </div>
      <div style="width: 100%" v-else>
        <noData />
      </div>
    </SubPanelTemplate>
  </div>
  <modal-table :show="showmodal" title="预案文件" @close="close">
    <yuan :periodtime="tableTime.dateRange.join(',')"></yuan>
  </modal-table>
</template>

<script setup lang="ts">
import { ref, reactive, toRefs, onMounted, onUnmounted, watch } from "vue";
import yuan from "./components/yuan.vue";
import elevatorAnalysisPie from "@/components/businessPanel/public/charts/pie/elevator-analysis-pie.vue";
import elevatorAnalysisList from "@/components/businessPanel/public/elevator-analysis-list.vue";
import SubPanelTemplate from "@/components/businessPanel/public/snPanelTemplate.vue";
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
import hiddenDanger from "./components/hidden-danger.vue";
import overviewChartBar from "../../businessPanel/hospital/overview-chartBar.vue";
import { ModelValueItf } from "../../businessPanel/public/types";
import modalTable from "@/components/modal-table/modal.vue";
import { getXaxleData, getCurrentAreaInfo, getallNumber } from "../../../utils/common";
import modalAlarmTable from "@/components/modal-table/modal-alart-sn-table.vue";
import {
  getGasConsumptionData,
  EnergyConsumptionTrends,
} from "../../../mock/energy-consumption";
import { getAssetsImage } from "../../../utils/getImage";
import { storeMarket } from "@/piniaStore/other";
import { getrandom, getRandomFive } from "@/utils/enumeratie";
import { safetyEducation, emergencyFile } from "@/api/shennong/compre";
import noData from "@/components/businessPanel/public/noData.vue";

const applicationCode = "SECURITY_MONITORING";
const piniaStoreMarket = storeMarket();
let random = Math.floor(Math.random() * 50) + 1;

watch(
  () => piniaStoreMarket.currentMarket,
  (n) => {
    Object.assign(gasChartData, {
      xData: getXaxleData(workOrderTime.value.timeType),
      yData: [
        {
          data: [random, random, random, random, random, random],
          linearGradientColor: ["rgba(97, 148, 247, 0.34)", "rgba(97, 148, 247, 0.02)"],
          lineColor: "#6194F7",
        },
        {
          data: [random, random, random, random, random, random],
          linearGradientColor: ["rgba(148, 186, 249, 0.34)", "rgba(148, 186, 249, 0.02)"],
          lineColor: "rgba(149, 188, 249, 1)",
        },
      ],
    });
    changeReceptionTrendsTime();
    changetableTime();
  }
);
const showmodal = ref(false);
const close = () => {
  showmodal.value = false;
};
const clickbar1 = (data) => {

  showmodal.value = true;
};
const pieData1 = reactive({
  arr: [],
  alarmTotal: 0,
});
const hiddenData1 = ref([
  {
    label: "易燃设备总数",
    value: 103,
    color: "#fff",
    bgImg: "overView66.png",
  },
  {
    label: "电动车设备数",
    value: 98,
    color: "#6194F7",
    bgImg: "overView65.png",
  },
  {
    label: "消防设备数",
    value: 74,
    color: "#EDBA55",
    bgImg: "overView64.png",
  },
]);
const pieData = ref([
  {
    name: "电动车管理",
    value: getrandom(15),
    color: "#94BAF9",
  },
  {
    name: "消防预案制度",
    value: getrandom(70),
    color: "#6C9BE8",
  },
  {
    name: "小散工程管理制度",
    value: getrandom(70),
    color: "#3F7CDF",
  },
  {
    name: "其他",
    value: getrandom(15),
    color: "#2989FF",
  },
]);
const alarmModalShow = ref(false);
const alarmParameter = ref<Record<string, any>>({});
const workOrderTime = ref<ModelValueItf>({
  timeType: "THIS_YEAR",
  dateRange: [""],
});
const tableTime = ref<ModelValueItf>({
  timeType: "THIS_YEAR",
  dateRange: [""],
});
const gasConsumption = ref<ModelValueItf>({
  timeType: "THIS_YEAR",
  dateRange: [""],
});
const pieDataTotal = ref();
const colors = ["#94BAF9", "#6C9BE8", "#3F7CDF", "#2989FF"];
const changetableTime = async () => {
  let param = {
    period: tableTime.value.dateRange.join(","),
    type: tableTime.value.timeType,
    marketTenant: piniaStoreMarket.currentMarket,
    applicationCode: applicationCode,
  };
  let res: any = await safetyEducation(param);

  pieData1.arr = res?.map((item, index) => {
    return {
      name: item.name,
      value: item.totalNum,
      ratio: item.ratio,
      color: colors[index % colors.length],
    };
  });
  pieData1.alarmTotal = res.totalNum;
};

const closeModal = () => {
  alarmModalShow.value = false;
};
const clickrow = (record) => {
  alarmModalShow.value = true;
  alarmParameter.value = record;
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

const alarmdata = {
  TODAY: {
    xData: ["04:00", "08:00", "12:00", "16:00", "20:00", "24h"],
    yData: [
      {
        data: [5, 50, 20, 200, 150, 20],
        linearGradientColor: ["rgba(97, 148, 247, 0.34)", "rgba(97, 148, 247, 0.02)"],
        lineColor: "#6194F7",
      },
      {
        data: [2, 37, 89, 100, 35, 89],
        linearGradientColor: ["rgba(148, 186, 249, 0.34)", "rgba(148, 186, 249, 0.02)"],
        lineColor: "rgba(149, 188, 249, 1)",
      },
    ],
  },
  THIS_MONTH: {
    yData: [
      {
        data: [5, 50, 33, 79, 13, 65],
        linearGradientColor: ["rgba(97, 148, 247, 0.34)", "rgba(97, 148, 247, 0.02)"],
        lineColor: "#6194F7",
      },
      {
        data: [2, 12, 67, 100, 35, 89],
        linearGradientColor: ["rgba(148, 186, 249, 0.34)", "rgba(148, 186, 249, 0.02)"],
        lineColor: "rgba(149, 188, 249, 1)",
      },
    ],
  },
  THIS_YEAR: {
    yData: [
      {
        data: [78, 50, 23, 145, 300, 210],
        linearGradientColor: ["rgba(97, 148, 247, 0.34)", "rgba(97, 148, 247, 0.02)"],
        lineColor: "#6194F7",
      },
      {
        data: [35, 37, 89, 87, 35, 89],
        linearGradientColor: ["rgba(148, 186, 249, 0.34)", "rgba(148, 186, 249, 0.02)"],
        lineColor: "rgba(149, 188, 249, 1)",
      },
    ],
  },
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

const changeReceptionTrendsTime = async (): void => {
  let param = {
    period: workOrderTime.value.dateRange.join(","),
    type: workOrderTime.value.timeType,
    marketTenant: piniaStoreMarket.currentMarket,
  };
  let res: any = await emergencyFile(param);
  pieData.value = res.classifyStatistics.map((item, index) => {
    return {
      name: item.classifyName,
      value: item.classifyNum,
      color: colors[index % colors.length],
    };
  });
};
const changeGasConsumption = () => {
  // gasChartData.xData = getXaxleData(gasConsumption.value.timeType);
  // gasChartData.yData[0].data = getGasConsumptionData(gasConsumption.value.timeType);
};
let RegionInfo = reactive<{ build: string; floor: string }>({
  build: "",
  floor: "",
});
let timer = null;
let fakeData = ["TODAY", "THIS_YEAR", "THIS_MONTH", "THIS_YEAR"];
let fakeIndex = 1;
onMounted(() => {
  let type = ["电动车违规充电", "燃气泄露", "海鲜大楼明火", "占道经营", "明火"];

  let res = getCurrentAreaInfo();
  RegionInfo = res;

  timer = setInterval(() => {
    // workOrderTime.value.timeType = fakeData[fakeIndex];
    changeReceptionTrendsTime();
    changeGasConsumption();
    changetableTime();
    fakeIndex++;
    if (fakeIndex > fakeData.length - 1) {
      fakeIndex = 0;
      clearInterval(timer);
    }
  }, (window as any).config.pageLoopRequestTime);
});
onUnmounted(() => {
  clearInterval(timer);
});
</script>
<style scoped lang="less">
.visiting-data {
  width: 49%;
  .title {
    color: #fff;
    font-size: 12px;
  }
  :deep(.alarm-analysisBox){
    width: auto;
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
