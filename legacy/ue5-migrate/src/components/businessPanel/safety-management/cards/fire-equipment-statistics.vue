<template>
  <SubPanelTemplate title="消防设备统计" class="alarm-event">
    <template #extra>
      <DateInlineForm v-model:modelValue="fireControlTime" @search="fireControlStat"></DateInlineForm>
    </template>
    <div v-show="listData.length > 0">
      <DeviceStatistics @handelClickItemize="clickRow" imgPath="89-icon.png" :statistic="deviceStatisticsData"> </DeviceStatistics>
      <RollTable :column="column" :data="listData" :limitScrollNum="4">
        <template #alarmStatus="{ record }">
          <span v-if="record.expireStatus === 'EXPIRE'" style="color: #f14545">已过期</span>
          <span v-else="record.alarmStatus === 'NOT_EXPIRED'" style="color: #00f27b">已处理</span>
        </template>
      </RollTable>
    </div>
    <div v-show="listData.length === 0">
      <noData></noData>
    </div>
  </SubPanelTemplate>
  <modal-alarm-table :show-modal="alarmModalShow" @close="alarmModalShow = false" :parameter="parameter"></modal-alarm-table>
</template>

<script setup lang="ts">
import dayjs from "dayjs";
import { ref, reactive } from "vue";

import RollTable from "../../public/rollTable/index.vue";
import SubPanelTemplate from "../../public/subPanelTemplate.vue";
import { ModelValueItf } from "../../public/types";
import DeviceStatistics from "../../security-overview/components/device-statistics.vue";
import { sourceLedgerPage } from "@/api/property";
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
import noData from "@/components/businessPanel/public/noData.vue";
import modalAlarmTable from "@/components/modal-table/modal-alarm-table.vue";

//消防设备统计==================================================================================================
const fireControlTime = ref<ModelValueItf>({
  timeType: "THIS_YEAR",
  dateRange: [],
});

const alarmModalShow = ref<boolean>(false);
const parameter = reactive({
  dateRange: [],
});

const listData = ref([{ alarmTime: "11" }]);
const column = reactive([
  {
    title: "设备名称",
    dataIndex: "name",
    width: 120,
  },
  {
    title: "设备类型",
    dataIndex: "typeName",
  },
  {
    title: "使用年限",
    dataIndex: "usageDate",
    width: 140,
  },
  {
    title: "状态",
    dataIndex: "status",
    slots: {
      customRender: "status",
    },
  },
]);

const deviceStatisticsData = reactive({
  title: "到期设备数",
  total: 48,
});

const getFireControlCount = async () => {
  const params = {
    status: "EXPIRE",
    typeCode: "FIRE_FIGHTING_EQUIPMENT",
  };
  const data = await sourceLedgerPage(params);
  deviceStatisticsData.total = data.total;
  listData.value = data.records.map((e) => {
    return {
      ...e,
      status: e.status === "EXPIRE" ? "已过期" : "正常",
      usageDate: e.usageDate ? dayjs(e.usageDate).format("YYYY-MM-DD") : "-",
    };
  });
};

const fireControlStat = () => {
  getFireControlCount();
};

const clickRow = () => {
  parameter.dateRange = fireControlTime.value.dateRange;
  alarmModalShow.value = true;
};
</script>

<style lang="less" scoped></style>
