<template>
  <div class="panel">
    <!--电动车违规情况-->
    <CarViolationPanel
      :applicationCode="applicationCode"
      @clickViolationStat="handleClickMarketStatRow"
      @click-alarm-stat="handleClickAlarmRow"
    />
    <!-- 各市场违规统计 -->
    <CarViolationStat @clickViolationRow="handleClickMarketStatRow" @clickAlarmRow="handleClickAlarmRow" />
    <modal-table
      v-if="violationModalShow"
      :modalStyle="{
        width: '1060px',
      }"
      :show="violationModalShow && !violationDetailVisible"
      :title="modalTableTitle"
      @close="closeViolationModal"
    >
      <inspect-record :parameter="violationParameter" @detail-visible="violationDetailVisible = $event"></inspect-record>
    </modal-table>
    <modal-alarm-table :show-modal="alarmModalShow" @close="alarmModalShow = false" :parameter="alarmParameter" />
  </div>
</template>
<script setup lang="ts">
import { ref, computed } from "vue";

import { TopParams } from "../common/alarmlist-event";
import CarViolationPanel from "./components/car-violation-panel.vue";
import CarViolationStat from "./components/car-violation-stat.vue";
import inspectRecord from "./components/inspect-record.vue";
import useEscClose from "@/components/hooks/useEscClose";
import modalAlarmTable from "@/components/modal-table/modal-alart-sn-table.vue";
import modalTable from "@/components/modal-table/modal.vue";
import bus from "@/utils/bus";

const applicationCode = "ELECTRlC_VEHICLE";
const violationModalShow = ref(false);
const violationDetailVisible = ref(false);
const closeViolationModal = () => {
  violationModalShow.value = false;
  violationDetailVisible.value = false;
};
const alarmModalShow = ref(false);
const violationParameter = ref<Record<string, any>>({
  period: [],
  tagList: "",
  marketTenant: "",
});
const showTenantSearch = ref(false);
const modalTableTitle = computed(() => {
  return violationParameter.value.tagList === "CHARGE"
    ? "车辆违规充电记录"
    : violationParameter.value.tagList === "CHARGE,PARKING"
      ? "车辆违规充电停放记录"
      : "车辆违规停车记录";
});
const alarmParameter = ref<Record<string, any>>({
  applicationCode,
  alarmTypeCode: "",
});
const handleClickMarketStatRow = (row: any) => {
  violationParameter.value = {
    period: row.period,
    tagList: row.tagList,
    marketTenant: row.marketTenant,
  };
  violationModalShow.value = true;
};

bus.on("topPanelClick", (item: TopParams): void => {
  if (item?.key === "abnormalNum") {
    violationParameter.value = {
      period: item?.period?.split(","),
      tagList: "CHARGE,PARKING",
    };
    violationModalShow.value = true;
  }
});
useEscClose(() => {
  if (violationModalShow.value) {
    violationModalShow.value = false;
  }
});
useEscClose(() => {
  if (alarmModalShow.value) {
    alarmModalShow.value = false;
  }
});
const handleClickAlarmRow = (row: any) => {
  alarmParameter.value = {
    applicationCode,
    dateRange: row.dateRange,
    marketTenant: row.marketTenant,
    name: row.marketName,
    alarmEventTypeCode: "electricVehucle_wgrt",
    alarmTypeCode: "",
  };
  alarmModalShow.value = true;
};
</script>
<style lang="scss" scoped>
.panel {
  display: flex;
  flex-direction: column;
  height: 100%;
}
</style>
