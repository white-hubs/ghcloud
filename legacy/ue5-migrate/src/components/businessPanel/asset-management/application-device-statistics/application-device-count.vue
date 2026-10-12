<template>
  <SubPanelTemplate :title="props.title" class="application-device-card" zoomable :zoom-title="`${props.title}详情`" :zoom-width="900">
    <div class="application-device-card__summary">
      <div v-for="item in summary" :key="item.label" :class="['application-device-card__metric', item.type]">
        <span class="application-device-card__value">{{ item.value }}</span>
        <span class="application-device-card__label">{{ item.label }}</span>
      </div>
    </div>
    <ApplicationDeviceBarChart class="application-device-card__chart" :categories="applicationNames" :series="chartSeries" />
    <template #zoom-content>
      <div class="application-device-card__zoom-content">
        <div class="application-device-card__summary">
          <div v-for="item in summary" :key="item.label" :class="['application-device-card__metric', item.type]">
            <span class="application-device-card__value">{{ item.value }}</span>
            <span class="application-device-card__label">{{ item.label }}</span>
          </div>
        </div>
        <ApplicationDeviceBarChart class="application-device-card__zoom-chart" :categories="applicationNames" :series="chartSeries" />
      </div>
    </template>
  </SubPanelTemplate>
</template>

<script setup lang="ts">
import { computed, onMounted } from "vue";

import ApplicationDeviceBarChart from "./application-device-bar-chart.vue";
import { useApplicationDeviceCountStatistics, useApplicationDeviceStatusStatistics } from "./use-application-device-statistics";
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";

const props = withDefaults(defineProps<{ title?: string }>(), {
  title: "设备总数面板",
});

const { statistics: countStatistics, load: loadCountStatistics } = useApplicationDeviceCountStatistics();
const { statistics: statusStatistics, load: loadStatusStatistics } = useApplicationDeviceStatusStatistics();

const applicationNames = computed(() => countStatistics.value.map((item) => item.applicationName));
const chartSeries = computed(() => [{ name: "设备数量", color: "#3d9dff", data: countStatistics.value.map((item) => item.num) }]);
const summary = computed(() => [
  { label: "设备总数", value: countStatistics.value.reduce((total, item) => total + item.num, 0), type: "total" },
  { label: "在线设备", value: statusStatistics.value.reduce((total, item) => total + item.onlineNum, 0), type: "online" },
  { label: "离线设备", value: statusStatistics.value.reduce((total, item) => total + item.offlineNum, 0), type: "offline" },
]);

onMounted(() => {
  void Promise.all([loadCountStatistics(), loadStatusStatistics()]);
});
</script>

<style lang="less" scoped>
.application-device-card {
  :deep(.sub-panel-content) {
    padding: 10px 12px 12px;
  }

  &__summary {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 8px;
  }

  &__metric {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 8px 4px;
    border: 1px solid rgba(50, 148, 232, 0.34);
    border-radius: 4px;
    background: linear-gradient(145deg, rgba(17, 69, 129, 0.38), rgba(8, 41, 84, 0.52));
  }

  &__value {
    font-size: 23px;
    font-weight: 700;
    line-height: 1.2;
  }

  &__label {
    margin-top: 4px;
    color: #c8d8e8;
    font-size: 12px;
  }

  &__metric.total &__value {
    color: #3d9dff;
  }
  &__metric.online &__value {
    color: #18e29c;
  }
  &__metric.offline &__value {
    color: #ff6674;
  }

  &__chart {
    height: 190px;
    margin-top: 8px;
  }

  &__zoom-content {
    min-height: 500px;
  }

  &__zoom-chart {
    height: 410px;
    margin-top: 20px;
  }
}
</style>
