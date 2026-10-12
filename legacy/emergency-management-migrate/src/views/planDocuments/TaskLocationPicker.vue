<script setup lang="ts">
import { computed } from "vue";

import { useMapModal } from "@ghcloud/generic-component";

const props = defineProps<{
  locationDesc: string;
  longitude?: number | null;
  latitude?: number | null;
  disabled?: boolean;
}>();

const emit = defineEmits<{
  (event: "update", value: { locationDesc: string; longitude: number; latitude: number }): void;
}>();

const { showMapModal } = useMapModal();

const locationValue = computed(() => {
  if (props.locationDesc) {
    return props.locationDesc;
  }
  return props.longitude != null && props.latitude != null ? `${props.longitude}, ${props.latitude}` : "";
});

const openMap = () => {
  if (props.disabled) {
    return;
  }
  showMapModal({
    title: "选择执行位置",
    address: props.locationDesc,
    center: props.longitude != null && props.latitude != null ? { lng: props.longitude, lat: props.latitude } : undefined,
    modalConfirm: ({ address, lng, lat }) => {
      emit("update", { locationDesc: address, longitude: lng, latitude: lat });
    },
  });
};
</script>

<template>
  <div class="task-location-picker">
    <a-input :value="locationValue" disabled placeholder="请地图选点" />
    <a-button :disabled="disabled" @click="openMap">地图选点</a-button>
  </div>
</template>

<style lang="less" scoped>
.task-location-picker {
  display: flex;
  gap: 8px;
}

.task-location-picker :deep(.ant-input) {
  flex: 1;
  min-width: 0;
}
</style>
