<template>
  <div class="panel">
    <!-- <button @click='click'>123</button>
        <button @click='click1'>1223</button> -->
    <SubPanelTemplate title="消防设备统计" image="xf.png" class="xf1">
      <template #extra>
        <DateInlineForm
          class="shengNongColor"
          v-model:modelValue="pieTime"
          @search="changepieTime"
        ></DateInlineForm>
      </template>
      <div class="elevator-analysis" v-if="pieData.length > 0">
        <div class="chart">
          <elevator-analysis-pie
            style="width: 155px"
            :pieData="pieData"
            :radius="'75'"
            @clickbar="handlecurrent1"
          >
            <div style="color: #fff; text-align: center; font-size: 14px">
              {{ pieDataTotal }}
            </div>
            <div style="color: #fff; text-align: center; font-size: 14px">设备总数</div>
          </elevator-analysis-pie>
        </div>
        <elevatorAnalysisList
          @handlecurrent="handlecurrent1"
          :contentList="pieData"
          style="margin-left: 10px"
        ></elevatorAnalysisList>
      </div>
      <div class="nodata" v-else>
        <noData />
      </div>
    </SubPanelTemplate>
    <SubPanelTemplate title="消防到期设备统计" image="xf.png" class="xf">
      <template #extra>
        <DateInlineForm
          class="shengNongColor"
          v-model:modelValue="workOrderTime"
          @search="changeReceptionTrendsTime"
        ></DateInlineForm>
      </template>
      <div class="chart" v-if="barData.xData.length > 0">
        <StackedBar
          class="sbar"
          @clickbar="handlecurrent"
          :sn="true"
          :xData="barData.xData"
          :yData="barData.yData"
        />
        <!-- <overviewChartBar
          :xData="barData.xData"
          :yData="barData.yData"
          @clickbar="handlecurrent"
        ></overviewChartBar> -->
      </div>
      <div class="nodata" v-else>
        <noData />
      </div>
    </SubPanelTemplate>
    <SubPanelTemplate title="报警事件排名" image="tj.png" style="height: 420px">
      <template #extra>
        <DateInlineForm
          class="shengNongColor"
          v-model:modelValue="riskTime"
          @search="changeTimeRisk"
        ></DateInlineForm>
      </template>
      <div class="visiting-data">
        <div class="more">
          <div class="inspectTab">
            <a-tabs
              style="position: absolute; right: 0"
              v-model:activeKey="currenrnumber"
              @change="changeTimeRisk"
            >
              <a-tab-pane key="ALARM_ALL" tab="报警数"></a-tab-pane>
              <a-tab-pane key="ALARM_HANDLER" tab="处理数" force-render></a-tab-pane>
              <!-- <a-tab-pane key="ALARM_PROGRESS" tab="响应数"></a-tab-pane> -->
            </a-tabs>
          </div>
        </div>
        <div style="width: 100%; overflow: hidden; height: 400px" v-if="risk.length > 0">
          <vue3-seamless-scroll
            v-if="piniaStoreMarket.currentMarketName == ''"
            :list="risk"
            :step="0.5"
            hover
            :singleHeight="40"
          >
            <EventAlarmItem
              v-for="(item, index) in risk"
              :sort="item.rank"
              :ratio="item.ratio"
              :count="item.count"
              :name="item.name"
              @click="openalarm(item)"
              :width="item.width"
            ></EventAlarmItem>
          </vue3-seamless-scroll>
          <div v-else>
            <EventAlarmItem
              v-for="(item, index) in risk"
              :sort="item.rank"
              :ratio="item.ratio"
              :count="item.count"
              :name="item.name"
              @click="openalarm(item)"
              :width="item.width"
            ></EventAlarmItem>
          </div>
        </div>
        <div class="nodata" v-else>
          <noData />
        </div>
      </div>
    </SubPanelTemplate>
    <modal-alarm-table
      :show-modal="alarmModalShow"
      @close="closeModal"
      :parameter="alarmParameter"
    ></modal-alarm-table>
    <!-- showmodal -->
    <modal-table :show="showmodal" title="维保到期设备" @close="closemod">
      <modal-record
        v-if="showmodal"
        type="FIRE_FIGHTING_EQUIPMENT"
        :periodtime="workOrderTime.dateRange.join(',')"
        :marketid="marketid"
        status="已过期"
      ></modal-record>
    </modal-table>
    <modal-table :show="showmodalfire" title="消防设备" @close="closemod">
      <modal-fire
        v-if="showmodalfire"
        type="FIRE_FIGHTING_EQUIPMENT"
        :periodtime="pieTime.dateRange.join(',')"
        :status="statusName"
        :marketid="piniaStoreMarket.currentMarket"
      ></modal-fire>
    </modal-table>
  </div>
</template>

<script setup lang="ts">
import { Vue3SeamlessScroll } from "vue3-seamless-scroll";
import { ref, reactive, toRefs, onMounted, onUnmounted, watch } from "vue";
import EventAlarmItem from "@/components/businessPanel/public/snEventItem.vue";
import elevatorAnalysisPie from "@/components/businessPanel/public/charts/pie/elevator-analysis-pie.vue";
import elevatorAnalysisList from "@/components/businessPanel/public/elevator-analysis-list.vue";
import SubPanelTemplate from "@/components/businessPanel/public/snPanelTemplate.vue";
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
import { ModelValueItf } from "@/components/businessPanel/public/types";
import ModalRecord from "../gasPanel/gastable.vue";
import ModalFire from "./firetable.vue";
import modalTable from "@/components/modal-table/modal.vue";
import modalAlarmTable from "@/components/modal-table/modal-alart-sn-table.vue";
import {
  getallNumber,
  autoPage,
  getXDataByType,
  HData,
  getcurrentData,
  TwoArray,
} from "@/utils/common";
import overviewChartBar from "@/components/businessPanel/hospital/overview-chartBar.vue";
import { storeMarket } from "@/piniaStore/other";
import { alarmStatisticsRank } from "@/api/shennong/alarm";
import { fireDeviceData, fireDeviceExpire } from "@/api/shennong/compre";
import dayjs from "dayjs";
import noData from "@/components/businessPanel/public/noData.vue";
import StackedBar from "@/components/businessPanel/public/charts/stacked-bar/snstacked-bar.vue";

const applicationCode = "FIRECONTROL";
const piniaStoreMarket = storeMarket();

const showmodal = ref(false);
const showmodalfire = ref(false);
const statusName = ref("");
const currenrnumber = ref("ALARM_ALL");
const alarmModalShow = ref<boolean>(false);
const modalshow = ref(false);
const alarmParameter = ref<Record<string, any>>({
  applicationCode: applicationCode,
  alarmStatus: "",
  alarmTypeCode: applicationCode,
});
const closeModal = () => {
  alarmModalShow.value = false;
};
const openalarm = (record) => {

  alarmModalShow.value = true;
  alarmParameter.value = Object.assign(alarmParameter.value, record);
  alarmParameter.value.alarmStatus =
    currenrnumber.value == "ALARM_ALL"
      ? ""
      : currenrnumber.value == "ALARM_PROGRESS"
      ? "ALARM_PROGRESS_CONFIRMED"
      : currenrnumber.value;
};

const workOrderTime = ref<ModelValueItf>({
  timeType: "THIS_YEAR",
  dateRange: [
    dayjs(new Date()).format("YYYY-MM-DD 00:00:00"),

    dayjs(new Date()).format("YYYY-MM-DD 23:59:59"),
  ],
});
const pieTime = ref<ModelValueItf>({
  timeType: "THIS_YEAR",
  dateRange: [
    dayjs(new Date()).format("YYYY-MM-DD 00:00:00"),

    dayjs(new Date()).format("YYYY-MM-DD 23:59:59"),
  ],
});
const riskTime = ref<ModelValueItf>({
  timeType: "THIS_YEAR",
  dateRange: [""],
});
const marketid = ref("");
const Xdata = ref([]);
const handlecurrent = (item) => {
  marketid.value = Xdata.value.find((res) => res.marketName == item.name)?.marketTenant;
  showmodal.value = true;
};
const handlecurrent1 = (item) => {
  showmodalfire.value = true;
  statusName.value = item.name;
};
const closemod = () => {
  showmodal.value = false;
  showmodalfire.value = false;
};
const barData = reactive({
  xData: [],
  yData: [],
});
const risk = ref([]);
const colors = ["#94BAF9", "#6C9BE8", "#3F7CDF", "#2989FF"];
const changepieTime = async () => {
  let param = {
    period: pieTime.value.dateRange.join(","),
    type: pieTime.value.timeType,
    marketTenant: piniaStoreMarket.currentMarket,
    applicationCode: applicationCode,
  };
  let res: any = await fireDeviceData(param);
  pieData.value = res?.deviceStateList.map((item, index) => {
    return {
      name: item.stateName,
      value: item.stateNum,
      // ratio: item.ratio,
      color: colors[index % colors.length],
    };
  });
  pieDataTotal.value = res.totalNum;
};

const pieDataTotal = ref();
const pieData = ref([]);
const riskPage = reactive({
  total: 0,
  pageSize: 50,
  pageNumber: 1,
  pages: 0,
});
const changeTimeRisk = async () => {
  alarmParameter.value.dateRange = riskTime.value.dateRange;
  let param = {
    period: riskTime.value.dateRange.join(","),
    type: riskTime.value.timeType,
    stateRange: currenrnumber.value,
    pageSize: riskPage.pageSize,
    pageNumber: riskPage.pageNumber,
    // marketTenant: piniaStoreMarket.currentMarket,
    applicationCode: applicationCode,
  };
  let { records, total, pages } = await alarmStatisticsRank(param);
  autoPage(riskPage, total, pages);
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
const page = reactive({
  total: 0,
  pages: 0,
  pageSize: 5,
  pageNumber: 1,
});
const currentindex = ref(0);
const changeReceptionTrendsTime = async () => {
  currentindex.value += 1;
  let param = {
    period: workOrderTime.value.dateRange.join(","),
    type: workOrderTime.value.timeType,
    // marketTenant: piniaStoreMarket.currentMarket,
  };
  let { records, total, pages } = await fireDeviceExpire(param);
  let newdata = JSON.parse(JSON.stringify(records));
  // autoPage(page, total, pages);
  let page1 = records.length / page.pageSize;
  if (currentindex.value >= Math.ceil(page1)) {
    currentindex.value = 0;
  }


  // let a = TwoArray(records, page.pageSize)[currentindex.value].map(
  //   (item) => item.marketName
  // );

  let xdata = records.map((item) => item.marketName);
  let ydata = records.map((item) => item.num);
  //  TwoArray

  barData.xData =
    xdata.length > 0
      ? TwoArray(records, page.pageSize)[currentindex.value].map(
          (item) => item.marketName
        )
      : [];

  barData.yData = [
    {
      value:
        xdata.length > 0
          ? TwoArray(records, page.pageSize)[currentindex.value].map((item) => item.num)
          : [],
      marketlist: {
        xdata: TwoArray(xdata, page.pageSize),
        ydata: TwoArray(ydata, page.pageSize),
      },
    },
  ];

  Xdata.value = records;
};

let timer = null;
// 消防到期设备统计 报警事件排名 每15秒轮播
onMounted(() => {
  timer = setInterval(() => {
    // changeTimeRisk();
    changeReceptionTrendsTime();
    changepieTime()
  }, (window as any).config.pageLoopRequestTime);
});

watch(
  () => piniaStoreMarket.currentMarket,
  (n) => {
    changeReceptionTrendsTime();
    changepieTime()
  }
);
const currentMarketName = ref(true);
watch(
  () => piniaStoreMarket.currentMarketName,
  (n) => {

    if (n == "") {
      currentMarketName.value = true;
      changeReceptionTrendsTime();
      timer = setInterval(() => {
        // changeTimeRisk();
        changeReceptionTrendsTime();
      }, (window as any).config.pageLoopRequestTime);
    } else {
      clearInterval(timer);
      currentMarketName.value = getcurrentData(risk.value, n);
    }
  }
);
onUnmounted(() => {
  clearInterval(timer);
});
</script>
<style scoped lang="less">
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
.xf {
  height: 300px;
}
.xf1 {
  height: 300px;
}
.visiting-data {
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
  display: flex;
  justify-content: flex-end;
  margin-bottom: 10px;
  width: 100%;
  cursor: pointer;
  margin-top: -5px;
  color: #93aadb;
  font-size: 12px;
  div {
    margin-right: 10px;
    height: 25px;
    line-height: 25px;
  }
}
.bgc {
  font-size: 14px;
  background: linear-gradient(
    180deg,
    rgba(97, 148, 247, 0.0196) 0%,
    rgba(97, 148, 247, 0.5) 96%
  );
  font-weight: 500;
  color: #6194f7;
}
.chart {
  flex: 1;
  height: 250px;
}
.levelone {
  width: 26px;
  height: 18px;
  background: rgba(237, 73, 73, 0.1);
  border-radius: 2px 2px 2px 2px;
  opacity: 1;
  border: 1px solid #ed4949;
}
.level {
  width: 26px;
  height: 18px;
  background: rgba(63, 124, 223, 0.102);
  border-radius: 2px 2px 2px 2px;
  opacity: 1;
  border: 1px solid #3f7cdf;
}
.leveltwo {
  width: 26px;
  height: 18px;
  background: rgba(255, 170, 0, 0.1);
  border-radius: 2px 2px 2px 2px;
  opacity: 1;
  border: 1px solid #ffaa00;
}

.fx-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  .name {
    font-size: 12px;
    font-family: Source Han Sans CN-Regular, Source Han Sans CN;
    font-weight: 400;
    color: #e2edff;
  }
  .score {
    font-size: 26px;
    font-family: pnzd;
    font-weight: 400;
    color: #19d9a9;
  }
}
.line {
  width: 100%;
  border: 1px dotted;
  border-image: linear-gradient(
      90deg,
      rgba(226.0000017285347, 237.0000010728836, 255, 1),
      rgba(226.0000017285347, 237.0000010728836, 255, 0.10000000149011612),
      rgba(226.0000017285347, 237.0000010728836, 255, 1),
      rgba(226.0000017285347, 237.0000010728836, 255, 0.15000000596046448)
    )
    1 1;
}

.content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;

  .device {
    margin-top: 10px;
    width: 22%;
    border-right: 1px dashed;

    border-image: linear-gradient(
        360deg,
        rgba(226.0000017285347, 237.0000010728836, 255, 1),
        rgba(226.0000017285347, 237.0000010728836, 255, 0.10000000149011612),
        rgba(226.0000017285347, 237.0000010728836, 255, 1),
        rgba(226.0000017285347, 237.0000010728836, 255, 0.15000000596046448)
      )
      1 1;
  }

  .bgc {
    font-size: 14px;
    background: linear-gradient(
      180deg,
      rgba(97, 148, 247, 0.0196) 0%,
      rgba(97, 148, 247, 0.5) 96%
    );
    font-weight: 500;
    color: #6194f7;
  }
  .name {
    font-size: 12px;
    font-weight: 400;
    color: rgba(226, 237, 255, 0.7);
  }
  .value {
    font-size: 24px;
    font-family: pnzd;
    font-weight: 400;
    color: #ccdfff;
  }
  .ratio {
    margin-left: 5px;
    font-size: 12px;
    font-family: Roboto-Regular, Roboto;
    font-weight: 400;
    color: #19d9a9;
  }
}
.nodata {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
}
</style>
