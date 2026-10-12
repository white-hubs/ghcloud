<template>
  <SubPanelTemplate :title="props.title" class="application-device-status" zoomable :zoom-title="`${props.title}详情`" :zoom-width="900">
    <ApplicationDeviceBarChart class="application-device-status__chart" :categories="applicationNames" :series="chartSeries" />
    <template #zoom-content>
      <div class="application-device-status__zoom-content">
        <ApplicationDeviceBarChart class="application-device-status__zoom-chart" :categories="applicationNames" :series="chartSeries" />
      </div>
    </template>
  </SubPanelTemplate>
</template>

<script setup lang="ts">
import { computed, onMounted } from "vue";

import ApplicationDeviceBarChart from "./application-device-bar-chart.vue";
import { useApplicationDeviceStatusStatistics } from "./use-application-device-statistics";
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";

const props = withDefaults(defineProps<{ title?: string }>(), {
  title: "设备在线情况",
});

const { statistics, load } = useApplicationDeviceStatusStatistics();

const applicationNames = computed(() => statistics.value.map((item) => item.applicationName));
const chartSeries = computed(() => [
  { name: "在线设备", color: "#18e29c", data: statistics.value.map((item) => item.onlineNum) },
  { name: "离线设备", color: "#ff6674", data: statistics.value.map((item) => item.offlineNum) },
]);

onMounted(() => {
  void load();
});
</script>

<style lang="less" scoped>
.application-device-status {
  :deep(.sub-panel-content) {
    padding: 8px 12px 12px;
  }

  &__chart {
    height: 250px;
  }

  &__zoom-content {
    min-height: 500px;
  }

  &__zoom-chart {
    height: 500px;
  }
}
</style>
