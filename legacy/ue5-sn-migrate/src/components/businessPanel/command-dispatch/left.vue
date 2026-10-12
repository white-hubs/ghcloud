<template>
  <div class="panel">
    <SubPanelTemplate title="报警级别分布" class="alarm-level">
      <div class="header">
        <!-- <QuickTimeRange btn1="昨日" /> -->
        <DateInlineForm
          v-model:modelValue="timeFrame"
          @search="changeTimeFrame"
        ></DateInlineForm>
      </div>
      <div class="chart">
        <Pie3D :data="fakeData" label-key="name" value-key="alarmNum" />
      </div>
      <div class="footer">
        <AlarmStatisticsItem
          v-for="(item, index) in fakeData"
          :key="item.name"
          :level="index + 1"
          :alarmNum="item.alarmNum"
          :chainRatio="item.chainRatio"
          :name="item.name"
          :is-grow="item.isGrow"
        />
      </div>
    </SubPanelTemplate>
    <SubPanelTemplate title="报警记录" class="alarm-record">
      <div class="header">
        <DateInlineForm
          v-model:modelValue="takeNotes"
          @search="changeTakeNotes"
        ></DateInlineForm>
      </div>
      <div class="chart">
        <Pie :data="alarmsNumber" :x-data="pieData" />
        <TipsCount
          v-for="(item, index) in pieData"
          :status="String(index)"
          :count="item.value"
        />
      </div>
      <div class="footer">
        <RollTable
          :key="falg"
          :column="column"
          :data="listData"
          @click-row="handelClickRow"
          :limitScrollNum="4"
        >
          <template #alarmStatus="{ record }">
            <span
              v-if="record.alarmStatus === 'ALARM_UN_CONFIRMED'"
              style="color: #f14545"
              >待处理</span
            >
            <span
              v-else-if="record.alarmStatus === 'ALARM_PROGRESS_CONFIRMED'"
              style="color: #ffab10"
              >处理中</span
            >
            <span v-else="record.alarmStatus === 'ALARM_CONFIRMED'" style="color: #00f27b"
              >已处理</span
            >
          </template>
        </RollTable>
      </div>
    </SubPanelTemplate>
  </div>
</template>
<script lang="ts" setup>
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
import Pie from "@/components/businessPanel/public/pie.vue";
import Pie3D from "@/components/businessPanel/public/charts/pie/pie.vue";
import AlarmStatisticsItem from "@/components/businessPanel/public/alarmStatisticsItem.vue";
import TipsCount from "../public/tipsCount.vue";
import RollTable from "../public/rollTable/index.vue";
import { ModelValueItf } from "../public/types";
import { AlarmLevelType } from "@/api/models/alarm";
import { storeArea } from "@/piniaStore/area";
import { statisticsLevel, alarmStatisticsList, recordStatus } from "@/api/alarm";
import { onBeforeUnmount, onMounted, reactive, ref, watch } from "vue";
import moment from "moment";
import { storeMenu } from "@/piniaStore/menu";
import bus from "@/utils/bus";
const piniaStoreMenu = storeMenu();
const piniaStoreArea = storeArea();
let timeFrame = ref<ModelValueItf>();
let takeNotes = ref<ModelValueItf>();
const fakeData = ref<AlarmLevelType[]>([
  {
    alarmNum: 0,
    name: "一级报警",
    chainRatio: 0,
    isGrow: false,
  },
]);
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
    width: 140,
  },
  {
    title: "状态",
    dataIndex: "alarmStatus",
    slots: {
      customRender: "alarmStatus",
    },
  },
]);
let pieData = reactive([]);
let falg = ref<number>(0);
let listData = reactive([]);
let alarmsNumber = ref<number>(0);
let timer: any = reactive(null);
watch(
  () => piniaStoreArea.currentAreaId,
  () => {
    clearInterval(timer);
    timer = setInterval(() => {
      init();
    }, (window as any).config.pageLoopRequestTime);
    init();
  }
);
// 报警级别分布
function changeTimeFrame() {
  getAlarmLevel();
}
// 报警记录
function changeTakeNotes() {
  getAlarmTakeNotes();
}
// 获取报警列表
async function getAlarmTakeNotes() {
  let params = {
    sceneType: piniaStoreMenu.currentMenu,
    areaId: piniaStoreArea.currentAreaId,
    period: takeNotes.value.dateRange.join(","),
    type: takeNotes.value.timeType,
    pageSize: 50,
    pageNumber: 1,
  };
  let res: any = await alarmStatisticsList(params);
  let data = await recordStatus(params);
  listData = res.records.map((item) => {
    return {
      ...item,
      alarmTime: moment(item.alarmTime).format("YYYY-MM-DD"),
    };
  });
  alarmsNumber.value = data.alarmNum;
  pieData = [
    {
      value: data.alarmUnresolvedHandlerNum,
      name: "未处理数",
    },
    {
      value: data.alarmTimeoutNum,
      name: "超时报警数",
    },
  ];
  falg.value++;
}
// 获取报警级别分布数据
async function getAlarmLevel() {
  let params = {
    sceneType: piniaStoreMenu.currentMenu,
    areaId: piniaStoreArea.currentAreaId,
    period: timeFrame.value.dateRange.join(","),
    type: timeFrame.value.timeType,
  };
  let res = await statisticsLevel(params);
  fakeData.value = res.map((item) => {
    item.chainRatio <= 0 ? (item.isGrow = false) : (item.isGrow = true);
    item.name += "报警";
    return item;
  });
}
const handelClickRow = (record) => {
  if (record.alarmTargetCode) {
    bus.emit("equipmentPosition", record);
  }
};
function init() {
  getAlarmLevel();
  getAlarmTakeNotes();
}
onMounted(() => {
  timer = setInterval(() => {
    init();
  }, (window as any).config.pageLoopRequestTime);
});
onBeforeUnmount(() => {
  clearInterval(timer);
});
</script>
<style lang="less" scoped>
.panel {
  padding: 8px;
  display: flex;
  flex-direction: column;
}
.alarm-level {
  .chart {
    height: 140px;
    display: flex;
  }
}
.alarm-record {
  .chart {
    display: flex;
    height: 100px;
    justify-content: center;

    > div {
      width: 100px;
      align-items: center;
      margin-left: 10px;
    }
  }

  .footer > div {
    width: 100%;
  }
}

.footer {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  color: #fff;
}
</style>
