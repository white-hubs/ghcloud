<template>
  <div class="panel">
    <SubPanelTemplate title="风险源统计" image="zc.png">
      <!-- <template #extra>
        <DateInlineForm
          class="shengNongColor"
          v-model:modelValue="dnTime"
          @search="changednTime"
        ></DateInlineForm>
      </template> -->
      <div class="zc-flex">
        <ratioList
          :list-data="ratioListData"
          @openmodal="clickbar"
          type="card"
        ></ratioList>

        <div class="elevator-analysis" v-if="pieData.length > 0">
          <div class="chart">
            <elevator-analysis-pie
              @clickbar="clickbar"
              style="width: 145px"
              :pieData="pieData"
              :radius="'75'"
            >
              <div style="color: #fff; text-align: center; font-size: 14px">
                {{ getallNumber(pieData, "value") }}
              </div>
              <div style="color: #fff; text-align: center; font-size: 14px">风险源数</div>
            </elevator-analysis-pie>
          </div>
          <elevatorAnalysisList
            @handlecurrent="clickbar"
            :contentList="pieData"
            style="margin-left: 10px"
          ></elevatorAnalysisList>
        </div>
        <div style="width: 50%" v-else>
          <noData />
        </div>
      </div>
    </SubPanelTemplate>
    <SubPanelTemplate title="报警事件正确率" image="yh.png" class="visiting-data1">
      <template #extra>
        <DateInlineForm
          class="shengNongColor"
          v-model:modelValue="dnTime"
          @search="zqchangednTime"
        ></DateInlineForm>
      </template>
      <div class="mt30" v-if="ratioEventData1.length > 0">
        <ratioList :list-data="ratioEventData1"></ratioList>
      </div>
      <div style="width: 100%" class="nodata" v-else>
        <noData />
      </div>
    </SubPanelTemplate>

    <SubPanelTemplate title="报警事件占比" image="yh.png" class="visiting-data3">
      <!-- <button @click="click">123</button> -->
      <template #extra>
        <DateInlineForm
          class="shengNongColor"
          v-model:modelValue="zbdnTime"
          @search="zbchangednTime"
        ></DateInlineForm>
      </template>
      <div class="mt30" v-if="pieDatabj.length > 0">
        <div class="chart1">
          <elevator-analysis-pie
            style="width: 145px; height: 200px"
            :pieData="pieDatabj"
            :radius="'75'"
            @clickbar="openModalRATIO"
          >
            <div style="color: #fff; text-align: center; font-size: 14px">
              {{ getallNumber(pieDatabj, "ratio") }}
            </div>
            <div style="color: #fff; text-align: center; font-size: 14px">报警总数</div>
          </elevator-analysis-pie>
        </div>

        <elevatorSnList
          :contentList="pieDatabj"
          style="margin-left: 50px"
        ></elevatorSnList>
      </div>
      <div style="width: 100%" class="nodata" v-else>
        <noData />
      </div>
    </SubPanelTemplate>
    <SubPanelTemplate image="cl.png" title="报警处理情况" class="visiting-data4">
      <template #extra>
        <DateInlineForm
          class="shengNongColor"
          v-model:modelValue="alarmTime"
          @search="changealarmTime"
        ></DateInlineForm>
      </template>

      <StackedBar
        class="sbar"
        v-if="alarmStatisticsData.chartData.xData.length > 0"
        @clickbar="openModal"
        :sn="true"
        :xData="alarmStatisticsData.chartData.xData"
        :yData="alarmStatisticsData.chartData.yData"
      />

      <div style="width: 100%" class="nodata" v-else>
        <noData />
      </div>
    </SubPanelTemplate>
    <div class="right-botom">
      <!-- <SubPanelTemplate title="报警响应排名" image="yh.png" class="visiting-data1">
        <template #extra>
          <DateInlineForm
            class="shengNongColor"
            v-model:modelValue="hiddenTime"
            @search="changehiddenTime"
          ></DateInlineForm>
        </template>
        <RollTablesn :column="bjColumns" :data="risk" :showLength="5">
          <template #index="{ record }">
            <div
              class="sort"
              :class="[{ up_sort: record.index > 3 }, `sort${record.index}`]"
            >
              {{ record.index }}
            </div>
          </template>
        </RollTablesn>
      </SubPanelTemplate> -->
    </div>
  </div>
  <modal-alarm-table
    :show-modal="alarmModalShow"
    @close="closeModal"
    :parameter="alarmParameter"
  ></modal-alarm-table>
  <modal-table :show="showmodal" title="风险源统计" @close="close">
    <modal-record
      :periodtime="''"
      :type="dangertype"
      :marketName="piniaStoreMarket.currentMarketName"
      v-if="showmodal"
    ></modal-record>
  </modal-table>
  <modal-table :show="yhshowmodal" title="隐患记录" @close="close">
    <modal-yh :periodtime="hiddenTime.dateRange" :marketid="marketid"></modal-yh>
  </modal-table>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, watch } from "vue";
import elevatorAnalysisPie from "../businessPanel/public/charts/pie/elevator-analysis-pie.vue";
import elevatorAnalysisList from "../businessPanel/public/elevator-analysis-list.vue";
import elevatorSnList from "../businessPanel/public/elevator-sn-list.vue";
import SubPanelTemplate from "../businessPanel/public/snPanelTemplate.vue";
import DateInlineForm from "../businessPanel/public/dateInlineForm.vue";
import StackedBar from "../businessPanel/public/charts/stacked-bar/stacked-bar.vue";
import { ModelValueItf } from "../businessPanel/public/types";
import { getallNumber, autoPage, HData, TwoArray } from "../../utils/common";
import modalAlarmTable from "@/components/modal-table/modal-alart-sn-table.vue";
import modalTable from "@/components/modal-table/modal.vue";
import ModalYh from "@/components/shengnongPanel/common/yhtable.vue";
import ModalRecord from "./gasPanel/gastable.vue";
import ratioList from "@/components/shengnongPanel/common/ratiolist.vue";
import { storeMarket } from "@/piniaStore/other";
import {
  alarmStatistics,
  alarmHandlerAnalysis,
  alarmConfirmSituation,
  alarmActualRatio,
  alarmEventRatio,
  alarmmEventRatio,
  alarmModelratio,
} from "@/api/shennong/alarm";

import { assetfilingAnalyse, propertyFilingStatistics } from "@/api/shennong/compre";
import RollTablesn from "@/components/businessPanel/public/rollTable/snindex.vue";
import noData from "@/components/businessPanel/public/noData.vue";
import dayjs from "dayjs";

const piniaStoreMarket = storeMarket();

const bjColumns = [
  {
    title: "排名",
    dataIndex: "index",
    slots: {
      customRender: "index",
    },
  },
  {
    title: "市场名称",
    dataIndex: "name",
  },
  {
    title: "未确认报警数",
    dataIndex: "alarm",
  },
];
const alarmTime = ref<ModelValueItf>({
  timeType: "THIS_YEAR",
  dateRange: [""],
});
const hiddenTime = ref<ModelValueItf>({
  timeType: "THIS_YEAR",
  dateRange: [""],
});
const dnTime = ref<ModelValueItf>({
  timeType: "THIS_YEAR",
  dateRange: [],
});
const zqTime = ref<ModelValueItf>({
  timeType: "THIS_YEAR",
  dateRange: [],
});
const zbdnTime = ref<ModelValueItf>({
  timeType: "THIS_YEAR",
  dateRange: [
    dayjs(new Date()).format("YYYY-MM-DD 00:00:00"),

    dayjs(new Date()).format("YYYY-MM-DD 23:59:59"),
  ],
});

const ratioListData = ref([
  {
    iconImg: "a1.png",
    label: "氧气瓶",
    value: 0,
    color: "#FFC7C6",
    unit: "个",
  },

  {
    iconImg: "a3.png",
    label: "电动车",
    value: 0,
    color: "#B6CAF3",
    unit: "个",
  },
  {
    iconImg: "a4.png",
    label: "消防设备",
    value: 0,
    color: "#FFEBC6",
    unit: "个",
  },
]);
const ratioEventData = ref([]);
const ratioEventData1 = ref([]);
const risk = ref([]);
const alarmStatisticsData = reactive({
  chartData: {
    xData: [],
    yData: [],
  },
  page: {
    total: 0,
    pages: 0,
    pageSize: 5,
    pageNumber: 1,
  },
  marketData: [],
});
const hiddenStatisticsData = reactive({
  chartData: {
    xData: [],
    yData: [],
  },
  page: {
    total: 0,
    pages: 0,
    pageSize: 4,
    pageNumber: 1,
  },
});
const handleColors = ["#6AE0E4", "#95BCF9", "#6194F7", "#2F78F1"];
const currentindex = ref(0);
const changealarmTime = async () => {
  currentindex.value += 1;
  alarmParameter.value.dateRange = alarmTime.value.dateRange;
  let param = {
    period: alarmTime.value.dateRange.join(","),
    type: alarmTime.value.timeType,
    pageSize: alarmStatisticsData.page.pageSize,
    pageNumber: alarmStatisticsData.page.pageNumber,
    // marketTenant: piniaStoreMarket.currentMarket,
  };

  let { records, total, pages } = await alarmHandlerAnalysis(param);
  let { xdata, ydata } = records[0];

  const xlist = TwoArray(xdata, alarmStatisticsData.page.pageSize);

  let page = xdata.length / alarmStatisticsData.page.pageSize;
  if (currentindex.value >= Math.ceil(page)) {
    currentindex.value = 0;
  }
  alarmStatisticsData.marketData = xdata;

  alarmStatisticsData.chartData.xData =
    xlist.length > 0 ? xlist[currentindex.value].map((item) => item.marketName) : [];
    alarmStatisticsData.chartData.yData = ydata.map((item, index) => {
      return {
        name: item.name,
        value: TwoArray(item.value, alarmStatisticsData.page.pageSize)[currentindex.value],
        datavalue: item.value,
        color: handleColors[index % handleColors.length],
        marketlist: {
          xdata: xlist,
          ydata: TwoArray(item.value, alarmStatisticsData.page.pageSize),
        },
      };
    });
};
const Xdata = ref([]);

const changehiddenTime = async () => {
  let param = {
    period: hiddenTime.value.dateRange.join(","),
    type: hiddenTime.value.timeType,
    pageSize: hiddenStatisticsData.page.pageSize,
    pageNumber: hiddenStatisticsData.page.pageNumber,
    marketTenant: piniaStoreMarket.currentMarket,
  };
  let { records, total, pages } = await alarmConfirmSituation(param);
  autoPage(hiddenStatisticsData, total, pages);
  if (Array.isArray(records) && records.length > 0) {
    risk.value = records
      .sort((a, b) => b.totalNum - a.totalNum)
      .map((item, index) => {
        return {
          ...item,
          index: index + 1,
          name: item.marketName,
          alarm: item.totalNum,
        };
      });
  }
};
const pieData = ref([]);
const pieDatabj = ref([]);
const danger = ref([]);
const colors = ["#94BAF9", "#67B9C1", "#3F7CDF", "#D1AE8A", "#EDBA55"];
const topColors = ["#94BAF9", "#6194F7", "#EDBA55"];
const zbchangednTime = async () => {
  let param = {
    period: zbdnTime.value.dateRange.join(","),
    type: zbdnTime.value.timeType,
    marketTenant: piniaStoreMarket.currentMarket,
  };
  let resdata: any = await alarmmEventRatio({
    ...param,
  });
  pieDatabj.value = resdata.map((item, index) => {
    return {
      ...item,
      name: item.name,
      value: item.ratio,
      ratio: item.totalNum,
      color: colors[index % colors.length],
    };
  }).filter(item => !item.name.includes('动环') && item.id !== 'ROTATINGMANAGE');
};

const changednTime = async () => {
  let param = {
    marketTenant: piniaStoreMarket.currentMarket,
  };
    propertyFilingStatistics(param).then(data => {
      ratioListData.value[0].value = data.flammableEquipmentNum;
      ratioListData.value[1].value = data.electricVehicleNum;
      ratioListData.value[2].value = data.fireFightingEquipmentNum;
    }),
    assetfilingAnalyse(param).then(res => {
      pieData.value = res.map((item, index) => {
        return {
          name: item.name,
          value: item.num,
          color: colors[index % colors.length],
        };
      });
      danger.value = res.slice(0, 3).map((item, index) => {
        return {
          label: item.name,
          value: item.num,
          color: topColors[index % topColors.length],
          bgImg: `overView${66 - index}.png`,
        };
      });
    })
};
const zqchangednTime = async () => {
  try {
    if(!dnTime.value.dateRange) return
    let param = {
      period: dnTime.value.dateRange.join(","),
      type: dnTime.value.timeType,
      marketTenant: piniaStoreMarket.currentMarket,
    };
    let alarmres: any = await alarmModelratio({
      ...param,
    });
    ratioEventData1.value = [];
    ratioEventData1.value = [
      {
        label: "安防监控报警",
        value: alarmres.filter((a) => a.id === "SECURITY_MONITORING")[0].actualRatio,
        color: "#B6CAF3",
        iconImg: "af-b.png",
        unit: "%",
      },
      {
        label: "电气管理",
        value: alarmres.filter((a) => a.id === "ELECTRICMANAGE")[0].actualRatio,
        color: "#FFC7C6",
        iconImg: "a1-b.png",
        unit: "%",
      },
      {
        label: "消防管理",
        value: alarmres.filter((a) => a.id === "FIRECONTROL")[0].actualRatio,
        color: "#AFE3E8",
        iconImg: "xf-b.png",
        unit: "%",
      },
      {
        label: "用气管理",
        value: alarmres.filter((a) => a.id === "GAS_MANAGEMENT")[0].actualRatio,
        color: "#FFEBC6",
        iconImg: "a4-b.png",
        unit: "%",
      },
    ];
  } catch (error) {
    
  }
};

const showmodal = ref(false);
const yhshowmodal = ref(false);
const close = () => {
  showmodal.value = false;
  yhshowmodal.value = false;
};

const alarmModalShow = ref<boolean>(false);
const alarmParameter = ref<Record<string, any>>({});
const closeModal = (record) => {
  alarmModalShow.value = false;
};
const openModal = (record) => {
  alarmParameter.value.alarmTypeCode = '';
  alarmParameter.value.name = record.name;
  alarmModalShow.value = true;
};
const alarmTypeCode = {
  电气管理: "ELECTRICMANAGE",
  消防管理: "FIRECONTROL",
  动环报警: "ROTATINGMANAGE",
  安防监控报警: "SECURITY_MONITORING",
  用气管理: "GAS_MANAGEMENT",
  安防监控: "SECURITY_MONITORING",
};
const openModalRATIO = (data) => {
  alarmParameter.value.dateRange = zbdnTime.value.dateRange;

  alarmParameter.value.alarmTypeCode = alarmTypeCode[data.name];
  alarmParameter.value.name = piniaStoreMarket.currentMarketName;
  alarmModalShow.value = true;
};
const statelist = {
  易燃设备建档数: "FLAMMABLE_EQUIPMENT",
  消防设备数: "FIRE_FIGHTING_EQUIPMENT",
  现场运输设备数: "TRANSPORT_DEVICES",
  消防设备: "FIRE_FIGHTING_EQUIPMENT",
  现场运输设备: "TRANSPORT_DEVICES",
  易燃设备: "FLAMMABLE_EQUIPMENT",
  氧气瓶: "OXYGEN_CYLINDER",
  电动车: "ELECTRO_MOBILE",
};

const marketid = ref("");
const dangertype = ref("");
const clickbar = (data) => {
  if (piniaStoreMarket.currentMarket) {
    marketid.value = piniaStoreMarket.currentMarket;
  } else {
    marketid.value = Xdata.value.find((res) => res.marketName == data.name)?.marketTenant;
  }
  dangertype.value = statelist[data.label];

  if (!data.label) {
    dangertype.value =
      data.name == "易燃设备"
        ? "FLAMMABLE_EQUIPMENT"
        : data.name == "电动车"
        ? "ELECTRO_MOBILE"
        : data.name == "氧气瓶"
        ? "OXYGEN_CYLINDER"
        : data.name == "消防设备"
        ? "FIRE_FIGHTING_EQUIPMENT"
        : "";
  }
  showmodal.value = true;
};

let timer = null;
// 报警处理情况分析, 隐患处理概览 每5秒轮播
onMounted(() => {
  changednTime();
  timer = setInterval(() => {
    changealarmTime();
    changehiddenTime();
    zbchangednTime();
    changednTime();
    zqchangednTime()
  }, (window as any).config.pageLoopRequestTime);
});

watch(
  () => piniaStoreMarket.currentMarketName,
  (n) => {
    if(n){
      clearInterval(timer);
      changealarmTime();
      changehiddenTime();
      zbchangednTime();
      changednTime();
      zqchangednTime()
    }else{
      changealarmTime();
      changehiddenTime();
      zbchangednTime();
      changednTime();
      zqchangednTime()
      timer = setInterval(() => {
        changednTime();
        zqchangednTime()
      }, (window as any).config.pageLoopRequestTime);
    }
  },
  { deep: true }
);

onUnmounted(() => {
  clearInterval(timer);
});
</script>
<style scoped lang="less">
.panel {
  margin-top: 10px;
}
.visiting-data1 {
  height: 200px;
  // width:630px;
}
.visiting-data3 {
  height: 270px;
  width: 100%;
  // width:630px;
}
.visiting-data4 {
  height: 300px;
  // width:100%;
  width: 630px;
  // padding-top:20px
  .sbar {
    // margin-top:20px;
  }
}
.visiting-data {
  height: 370px;
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
  height: 160px;
}
.chart1 {
  margin-left: 0px;
  // flex: 1;
  // height: 200px;
}
.dnumber {
  width: 100%;
  display: flex;
  justify-content: space-between;
  .dcontent {
    padding: 5px;
    text-align: center;
    box-sizing: border-box;
    width: 33%;
    height: 56px;
    background: rgba(97, 148, 247, 0.2);
    border-radius: 0px 0px 0px 0px;
    .title {
      font-size: 12px;
      font-family: Source Han Sans CN-Regular, Source Han Sans CN;
      font-weight: 400;
      color: #93aadb;
    }
    .name {
      font-size: 20px;
      font-family: PangMenZhengDao-Regular, PangMenZhengDao;
      font-weight: 400;
      color: #94baf9;
    }
  }
}
.zc-flex {
  display: flex;
  align-items: flex-start;
  .content .box .value,:deep(.content .box .value){
    text-wrap: nowrap;
  }
}
.right-botom {
  display: flex;
  .sub-panel {
    width: 50% !important;
  }
}
.mt30 {
  height: 100%;
  display: flex;
  align-items: center;
  width: 100%;
  justify-content: center;

  // margin-top: 45px;
  // margin-bottom: 30px;
}
.nodata {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
}
:deep(.alarm-analysis .alarm-analysisBox){
    width: auto;
  }

</style>
