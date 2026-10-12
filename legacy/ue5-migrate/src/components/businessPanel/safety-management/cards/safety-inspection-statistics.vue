<template>
  <SubPanelTemplate title="安全巡检统计" class="alarm-event">
    <template #extra>
      <DateInlineForm v-model:modelValue="eventTime" @search="alarmEventTop"></DateInlineForm>
    </template>
    <div v-show="inspectionStat.list.length > 0">
      <DeviceStatistics imgPath="87-icon.png" :statistic="inspectionStat.countStat"> </DeviceStatistics>
      <div class="switch">
        <div @click="switchClick(item)" v-for="item in switchList" :class="item === currentItem ? 'active' : ''">{{ item }}</div>
      </div>
      <div class="body" style="min-height: 150px">
        <EventAlarmItem
          @click="openInspect(item)"
          v-for="(item, index) in inspectionStat.list"
          :key="item.id"
          :sort="index + 1"
          :name="item.name"
          :linkRatio="item.chainRatio"
          :count="item.number"
          :ratio="item.ratio + '%'"
        />
      </div>
    </div>
    <div class="body" style="min-height: 150px" v-show="inspectionStat.list.length <= 0">
      <noData></noData>
    </div>
  </SubPanelTemplate>
  <small-inspect-table :show-modal="inspectModalShow" @close="inspectModalShow = false" :parameter="inspectParameter"></small-inspect-table>
</template>

<script setup lang="ts">
import { ref, reactive } from "vue";

import EventAlarmItem from "../../public/eventAlarmItem.vue";
import SubPanelTemplate from "../../public/subPanelTemplate.vue";
import { ModelValueItf } from "../../public/types";
import DeviceStatistics from "../../security-overview/components/device-statistics.vue";
import smallInspectTable from "../components/small-inspect-table.vue";
import { insTaskCountStat, insTaskStat } from "@/api/maintain";
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
import noData from "@/components/businessPanel/public/noData.vue";

//安全巡检统计==================================================================================================
const eventTime = ref<ModelValueItf>({
  timeType: "THIS_YEAR",
  dateRange: [],
});

const inspectParameter = reactive({
  depId: "",
  status: "",
  period: "",
});

const inspectModalShow = ref<boolean>(false);
const switchList = ["任务数", "完成数"];
const currentItem = ref("任务数");

const switchClick = (index) => {
  currentItem.value = index;
  getInsStat();
};

const inspectionStat = reactive({
  countStat: {
    title: "巡检任务总数",
    total: 0,
    itemize: [
      {
        name: "进行中任务数：",
        label: "待接收任务数：",
        value: 0,
        offline: 0,
        key: "OFFLINE1",
      },
    ],
  },
  list: [],
});

const getInsCount = async () => {
  const params = {
    begin: eventTime.value.dateRange[0],
    end: eventTime.value.dateRange[1],
  };
  const res = await insTaskCountStat(params);
  inspectionStat.countStat.total = res.inspectionTaskNum;
  inspectionStat.countStat.itemize[0].value = res.waitAcceptNum;
  inspectionStat.countStat.itemize[0].offline = res.underwayTaskNum;
};

const getInsStat = async () => {
  const params = {
    period: eventTime.value.dateRange.join(","),
    status: currentItem.value === "任务数" ? "" : "OVER",
  };
  const res = await insTaskStat(params);
  const allCount = res.reduce((pre, item) => {
    return pre + item.taskNum;
  }, 0);
  inspectionStat.list = res.map((item) => {
    return {
      name: item.depName,
      id: item.depId,
      number: item.taskNum,
      ratio: +(item.taskNum / allCount).toFixed(2) * 100,
      chainRatio: item.chainRatio,
    };
  });
};

const openInspect = (item) => {
  if (currentItem.value === "任务数") {
    inspectParameter.depId = item.id;
    inspectParameter.status = "";
  } else {
    inspectParameter.depId = "";
    inspectParameter.status = "OVER";
  }
  inspectParameter.period = eventTime.value.dateRange.join(",");
  inspectModalShow.value = true;
};

const alarmEventTop = async () => {
  getInsCount();
  getInsStat();
};
</script>

<style lang="less" scoped>
.switch {
  display: flex;
  justify-content: flex-end;
  color: #ffffff;
  height: 20px;
  line-height: 20px;
  font-size: 20px;

  div {
    cursor: pointer;
    padding: 0px 2px;
    font-size: 14px;
  }

  .active {
    background: linear-gradient(180deg, rgba(41, 137, 255, 0) 0%, #2989ff 100%);
  }
}

.body {
  height: 150px;
  overflow-y: auto;
}
</style>
