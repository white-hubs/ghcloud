<template>
  <SubPanelTemplate title="报警统计">
    <div class="header">
      <DateInlineForm v-model:modelValue="timeFrame" @search="changeTimeFrame" />
    </div>
    <div class="body">
      <OperateDays title="报警总数" :value="alarmCon.count" class="body-bum alarm-num">
        <div class="extra flex-start">
          <div class="mode">环比</div>
          <div :class="['downtriangle', alarmCon.ratio > 0 && 'uptriangle']"></div>
          <div :class="[alarmCon.ratio < 0 ? 'down' : 'up']">{{ alarmCon.ratio }}%</div>
        </div>
      </OperateDays>
      <GridContainer :data="alarmStatusData"></GridContainer>
      <RollTable :column="column" :data="data" class="roll-table" @click-row="handelClickRow">
        <template #alarmStatus="{ record }">
          <span :style="{ color: statusStyle(record.alarmStatus).color }">{{ statusStyle(record.alarmStatus).label }}</span>
        </template>
        <template #alarmLevelCode="{ record }">
          <span :style="{ color: leaveStyle(record.alarmLevelCode).color }">{{ leaveStyle(record.alarmLevelCode).label }}</span>
        </template>
      </RollTable>
    </div>
  </SubPanelTemplate>
</template>

<script lang="ts" setup>
import moment from "moment";
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from "vue";

import DateInlineForm from "../../public/dateInlineForm.vue";
import GridContainer from "../../public/gridContainer.vue";
import OperateDays from "../../public/operateDays.vue";
import RollTable from "../../public/rollTable/index.vue";
import SubPanelTemplate from "../../public/subPanelTemplate.vue";
import { ModelValueItf } from "../../public/types";
import { alarmStatisticsList, statisticsStatus } from "@/api/alarm";
import { AlarmStatus } from "@/api/models/alarm";
import { useStateStore } from "@/pages/state/use-state-store";
import bus from "@/utils/bus";
import enumeratie from "@/utils/enumeratie";

let timer = ref<any>(null);
const { globalState } = useStateStore();
let timeFrame = ref<ModelValueItf>();
const colorList = ["#FFC700", "#74AEE7", "#00F27B", "#29C2FF"];

const { alarmStatusOptions, alarmLeaveOptions } = enumeratie();
const alarmCon = ref({
  count: 0,
  ratio: 10,
});

let alarmStatusData = ref<AlarmStatus[]>([]);

const column = ref([
  {
    title: "报警时间",
    dataIndex: "alarmTime",
    width: 120,
  },
  {
    title: "报警级别",
    dataIndex: "alarmLevelCode",
    slots: {
      customRender: "alarmLevelCode",
    },
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
watch(
  () => globalState.business.currentAreaId,
  () => {
    clearInterval(timer.value);
    timer.value = setInterval(
      () => {
        init();
      },
      (window as any).config.pageLoopRequestTime,
    );
    init();
  },
);
const data = ref([]);
const statusStyle = computed(() => (key: string) => {
  let option = alarmStatusOptions.value.find((item) => {
    return item.value === key;
  });
  return option;
});
const leaveStyle = computed(() => (key: string) => {
  let option = alarmLeaveOptions.value.find((item) => {
    return item.value === key;
  });
  return option;
});

// 电气报警
function changeTimeFrame() {
  getAlarmList();
}
// 报警状态数量和报警列表
async function getAlarmList() {
  let params = {
    sceneType: globalState.business.currentMenu,
    areaId: globalState.business.currentAreaId,
    period: timeFrame.value.dateRange.join(","),
    type: timeFrame.value.timeType,
    pageSize: 50,
    pageNumber: 1,
  };
  let status = await statisticsStatus(params);
  let res: any = await alarmStatisticsList(params);
  alarmStatusData.value = status.alarmStatusStatistics.map((item, index) => {
    item.color = colorList[index];
    return item;
  });
  alarmCon.value = {
    count: status.alarmNum,
    ratio: status.chainRatio,
  };
  data.value = res.records.map((item) => {
    item.alarmTime = moment(item.alarmTime).format("YYYY-MM-DD");
    return item;
  });
}
const handelClickRow = (record) => {
  if (record.alarmTargetCode) {
    bus.emit("equipmentPosition", record);
  }
};
function init() {
  getAlarmList();
}
onMounted(() => {
  init();
  timer.value = setInterval(
    () => {
      init();
    },
    (window as any).config.pageLoopRequestTime,
  );
});
onBeforeUnmount(() => {
  clearInterval(timer.value);
});
</script>

<style lang="less" scoped>
.body-num {
  margin: 10px 0;
  :deep(.statstics) {
    font-size: 22px;
    font-family:
      Source Han Sans CN-Medium,
      Source Han Sans CN;
  }

  &.alarm-num {
    :deep(.statstics) {
      color: #ffbaba;
    }
  }
}

.extra {
  margin-left: 16px;
  font-size: 12px;
  font-weight: 400;
  font-family: Roboto-Regular, Roboto;

  .mode {
    color: #e7f0ff;
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

.title {
  padding-bottom: 10px;
  color: #e6f7ff;
  font-size: 16px;
}

.roll-table {
  margin-top: 10px;
}
</style>
