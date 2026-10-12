<template>
  <SubPanelTemplate title="报警记录">
    <template #extra>
      <DateInlineForm v-model:modelValue="takeNotes" @search="changeTakeNotes"></DateInlineForm>
    </template>
    <div class="body">
      <OperateDays title="报警总数" :value="alarmCon.count" class="body-num"></OperateDays>
      <div class="pie-chart">
        <Pie :data="alarmsNumber" :x-data="pieData" />
        <TipsCount v-for="(item, index) in pieData" :status="String(index)" :count="item.value" :key="index" />
      </div>
      <div class="footer">
        <RollTable :column="column" :data="listData">
          <template #alarmStatus="{ record }">
            <span v-if="record.alarmStatus === 'ALARM_UN_CONFIRMED'" style="color: #f14545">待处理</span>
            <span v-else-if="record.alarmStatus === 'ALARM_PROGRESS_CONFIRMED'" style="color: #ffab10">处理中</span>
            <span v-else="record.alarmStatus === 'ALARM_CONFIRMED'" style="color: #00f27b">已处理</span>
          </template>
        </RollTable>
      </div>
    </div>
  </SubPanelTemplate>
</template>

<script setup lang="ts">
import { ref, reactive } from "vue";

import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
import OperateDays from "@/components/businessPanel/public/operateDays.vue";
import Pie from "@/components/businessPanel/public/pie.vue";
import RollTable from "@/components/businessPanel/public/rollTable/index.vue";
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import TipsCount from "@/components/businessPanel/public/tipsCount.vue";
import useCommon from "@/components/hooks/useCommon";
import { useStateStore } from "@/pages/state/use-state-store";

const { takeNotes, getAlarmTakeNotes, getAlarmsNumber } = useCommon();
const { globalState } = useStateStore();

const alarmCon = ref({
  count: 0,
  ratio: 10,
});
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
  },
  {
    title: "状态",
    dataIndex: "alarmStatus",
    slots: {
      customRender: "alarmStatus",
    },
  },
]);
const pieData = reactive<any[]>([]);
const listData = reactive([]);
const alarmsNumber = ref<number>(0);

// 报警记录
async function changeTakeNotes() {
  let param = {
    sceneType: globalState.business.currentMenu,
    areaId: globalState.business.currentAreaId,
    period: takeNotes.value.dateRange.join(","),
    type: takeNotes.value.timeType,
    pageSize: 1000,
    pageNumber: 1,
  };
  let data = await getAlarmTakeNotes(param);
  alarmCon.value = await getAlarmsNumber(param);
  Object.assign(listData, data.listData);
  alarmsNumber.value = data.alarmsNumber;
  Object.assign(pieData, data.pieData);
}
</script>

<style lang="less" scoped>
.pie-chart {
  display: flex;
  height: 100px;
  justify-content: center;

  > div {
    width: 100px;
    align-items: center;
    margin-left: 10px;
  }
}

.footer {
  height: 250px;
}
</style>
