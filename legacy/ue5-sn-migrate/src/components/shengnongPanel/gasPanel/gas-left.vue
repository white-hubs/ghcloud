<template>
  <div class="panel">
    <SubPanelTemplate
      title="报警事件排名"
      image="zh.png"
      class="visiting-data"
      style="min-height: 400px"
    >
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
              v-model:activeKey="activeKey"
              @change="changeTimeRisk"
            >
              <a-tab-pane key="ALARM_ALL" tab="报警数"></a-tab-pane>
              <a-tab-pane key="ALARM_HANDLER" tab="处理数" force-render></a-tab-pane>
              <a-tab-pane key="ALARM_PROGRESS" tab="响应数"></a-tab-pane>
            </a-tabs>
          </div>
        </div>
        <div
          style="width: 100%; overflow: hidden; height: 320px"
          v-if="risk.length !== 0"
        >
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
              :width="item.width"
              @click="clickrow(item)"
            ></EventAlarmItem>
          </vue3-seamless-scroll>
          <div v-else>
            <EventAlarmItem
              v-for="(item, index) in risk"
              :sort="item.rank"
              :ratio="item.ratio"
              :count="item.count"
              :name="item.name"
              :width="item.width"
              @click="clickrow(item)"
            ></EventAlarmItem>
          </div>
        </div>
        <noData v-else />
      </div>
    </SubPanelTemplate>
    <SubPanelTemplate title="报警情况统计" image="zh.png">
      <template #extra>
        <DateInlineForm
          class="shengNongColor"
          v-model:modelValue="pieTime"
          @search="changepieTime"
        ></DateInlineForm>
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
              style="width: 155px"
            ></moer-pie>
          </div>
          <snElevatorList
            @handlecurrent="handlecurrent"
            :contentList="morepieData"
          ></snElevatorList>
        </template>
      </div>
    </SubPanelTemplate>
    <SubPanelTemplate title="报警记录" image="jl.png" style="margin-top: 10px">
      <template #extra>
        <DateInlineForm
          class="shengNongColor"
          v-model:modelValue="RecordTime"
          @search="changeReceptionRecordTime"
        >
        </DateInlineForm>
      </template>
      <RollTable
        v-if="tableData.length !== 0"
        :column="column"
        :data="tableData"
        @click-row="clickRowAlarm"
      >
        <template #level="{ record }">
          <span :style="`color:${color[record.level - 1]}`">{{ record.level }}</span>
        </template>
      </RollTable>
      <noData v-else />
    </SubPanelTemplate>
    <modal-alarm-table
      :show-modal="alarmModalShow"
      @close="closeModal"
      :parameter="alarmParameter"
    ></modal-alarm-table>

    <Alarm
      v-if="alarmDetailModalShow"
      @close="() => {
        alarmDetailModalShow = false
        removeMarketToken()
      }"
      :isalarm="true"
      :alarmDetailData="alarmDetailParameter"
    ></Alarm>
  </div>
</template>

<script setup lang="ts">
import { Vue3SeamlessScroll } from "vue3-seamless-scroll";
import { ref, reactive, toRefs, onMounted, onUnmounted, watch } from "vue";
import noData from "@/components/businessPanel/public/noData.vue";
import EventAlarmItem from "@/components/businessPanel/public/snEventItem.vue";
import snElevatorList from "@/components/businessPanel/public/sn-elevator-list.vue";
import RollTable from "@/components/businessPanel/public/rollTable/index.vue";
import SubPanelTemplate from "@/components/businessPanel/public/snPanelTemplate.vue";
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
import { ModelValueItf } from "@/components/businessPanel/public/types";
import modalAlarmTable from "@/components/modal-table/modal-alart-sn-table.vue";
import { autoPage, getXDataByType, getcurrentData, getallNumber } from "@/utils/common";
import MoerPie from "@/components/businessPanel/public/charts/pie/morepie.vue";
import { storeMarket } from "@/piniaStore/other";
import {
  alarmStatistics,
  alarmStatisticsRank,
  alarmRecordPage,
} from "@/api/shennong/alarm";
import moment from "moment";
import { openAlarmDetail, removeMarketToken } from '@/components/hooks/useAlarm'
import Alarm from "@/components/alarmdetails/equipmentModesn.vue";

const applicationCode = "GAS_MANAGEMENT";
const piniaStoreMarket = storeMarket();
const activeKey = ref("ALARM_ALL");


const alarmDetailModalShow = ref<boolean>(false);
const alarmDetailParameter = ref<Record<string, any>>({
  applicationCode: applicationCode,
  alarmTypeCode: applicationCode,
});
const clickRowAlarm = async (record) => {
  await openAlarmDetail(record, (res)=>{
    alarmDetailParameter.value = Object.assign(alarmDetailParameter.value, record);
    alarmDetailModalShow.value = true;
  })
};

const clickrow = (record) => {
  alarmModalShow.value = true;
  alarmParameter.value = {
    applicationCode: applicationCode,
    alarmTypeCode: applicationCode,
    dateRange: riskTime.value.dateRange
  }
  alarmParameter.value = Object.assign(alarmParameter.value, record);

  alarmParameter.value.alarmStatus =
    activeKey.value == "ALARM_ALL"
      ? ""
      : activeKey.value == "ALARM_PROGRESS"
      ? "ALARM_PROGRESS_CONFIRMED"
      : activeKey.value;
};
const tableData = ref([]);
const column = ref([
  {
    title: "报警事件",
    dataIndex: "alarmEventTypeName",
  },
  {
    title: "报警时间",
    dataIndex: "time",
  },

  {
    title: "报警市场",
    dataIndex: "marketName",
  },
  {
    title: "报警级别",
    dataIndex: "level",
    slots: {
      customRender: "level",
    },
  },

  {
    title: "报警状态",
    dataIndex: "status",
  },
]);
let color = ["#E52121", "#F37712"];
const alarmModalShow = ref<boolean>(false);
const alarmParameter = ref<Record<string, any>>({
  applicationCode: applicationCode,
  alarmStatus: "",
  alarmTypeCode: applicationCode,
});
const closeModal = () => {
  alarmModalShow.value = false;
};
const RecordTime = ref<ModelValueItf>({
  timeType: "THIS_YEAR",
  dateRange: [""],
});
const pieTime = ref<ModelValueItf>({
  timeType: "THIS_YEAR",
  dateRange: [""],
});
const riskTime = ref<ModelValueItf>({
  timeType: "THIS_YEAR",
  dateRange: [""],
});

const alarmtotal = ref({
  total: "",
  title: "",
});
const morepie = ref();
const handlecurrent = (item) => {
  alarmtotal.value.title = item.name;
  alarmtotal.value.total = item.value;
  // morepie.value.render()
};
const risk = ref([]);
const changepieTime = async () => {
  let param = {
    period: pieTime.value.dateRange.join(","),
    type: pieTime.value.timeType,
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
  morepieData.value = [
    {
      name: "电气报警占比",
      value: ratio,
      color: "#326bd3",
    },
    {
      name: "报警响应率",
      value: confirmedRatio,
      color: "#3C85FC",
    },
    {
      name: "报警正确率",
      value: actualRatio,
      color: "#7297D4",
    },
    {
      name: "报警处理率",
      value: handlerRatio,
      color: "#7094d5",
    },
    {
      name: "报警超时率",
      value: timeoutRatio,
      color: "#94BAF9",
    },
  ];
};
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
    stateRange: activeKey.value,
    pageSize: riskPage.pageSize,
    pageNumber: riskPage.pageNumber,
    // marketTenant: piniaStoreMarket.currentMarket,
    applicationCode: applicationCode,
  };
  let { records, total, pages } = await alarmStatisticsRank(param);
  autoPage(riskPage, total, pages)
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
const recordPage = reactive({
  total: 0,
  pageSize: 50,
  pageNumber: 1,
  pages: 0,
});
const changeReceptionRecordTime = async () => {
  recordPage.pageNumber = 1
  alarmDetailParameter.value.dateRange = RecordTime.value.dateRange;
  let param = {
    period: RecordTime.value.dateRange.join(","),
    type: RecordTime.value.timeType,
    pageSize: recordPage.pageSize,
    pageNumber: recordPage.pageNumber,
    marketTenant: piniaStoreMarket.currentMarket,
    applicationCode: applicationCode,
  };
  let { records, total, pages } = await alarmRecordPage(param);
  autoPage(recordPage, total, pages);
  tableData.value = records.map((item, index) => {
    return {
      ...item,
      event: item.alarmEventName || item.alarmTargetName,
      // time: moment(item.alarmTime).format("YYYY-MM-DD HH:mm:ss"),
      time:
        RecordTime.value.timeType === "TODAY"
          ? moment(item.alarmTime).format("HH:mm:ss")
          : moment(item.alarmTime).format("YYYY-MM-DD HH:mm:ss"),

      name: item.marketName,
      level: item.alarmLevelName,
      type: item.alarmTypeName,
      status: item.alarmStatusName,
    };
  });
};
const morepieData = ref();
let timer = null;
// 报警事件排名 报警记录 每15秒轮播
onMounted(() => {
  timer = setInterval(() => {
    // changeTimeRisk()
    // changeReceptionRecordTime()
  }, (window as any).config.pageLoopRequestTime);
});

watch(
  () => piniaStoreMarket.currentMarket,
  (n) => {
    // changeTimeRisk()
    changeReceptionRecordTime();
    changepieTime();
  }
);
const currentMarketName = ref(true);
watch(
  () => piniaStoreMarket.currentMarketName,
  (n) => {

    if (n == "") {
      currentMarketName.value = true;
    } else {
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
    color: #d9e7ff;
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
.visiting-data {
  width: 100%;
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
  align-items: center;
}
.more {
  display: flex;
  justify-content: flex-end;
  width: 100%;
  cursor: pointer;
  margin-top: -5px;
  color: #93aadb;
  font-size: 12px;
  div {
    margin-right: 10px;
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
  height: 220px;
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
</style>
