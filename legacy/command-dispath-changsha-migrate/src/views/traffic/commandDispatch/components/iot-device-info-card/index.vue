<script setup>
import { CloseOutlined } from "@ant-design/icons-vue";

defineProps({
  device: {
    type: Object,
    default: () => ({}),
  },
});

const emit = defineEmits(["close", "realtime-monitor"]);
</script>

<template>
  <div class="iot-device-info" @click.stop>
    <button class="iot-device-info-close" type="button" aria-label="关闭" @click="emit('close')">
      <CloseOutlined />
    </button>
    <div class="iot-device-info-name">
      <a-tag :color="device.status?.onlineState ? 'green' : 'orange'">
        {{ device.status?.onlineState ? "在线" : "离线" }}
      </a-tag>
      {{ device.name || "--" }}
    </div>
    <div class="iot-device-info-content">
      <div>所属区域：{{ device.area?.pathName || "--" }}</div>
      <div>设备类型：{{ device.productInfo?.productCategory?.name || "--" }}</div>
      <div>设备品牌：{{ device.productInfo?.brandName || "--" }}</div>
      <div>经纬度：{{ device.lntAndLat || "--" }}</div>
    </div>
    <div class="iot-device-info-btn">
      <button type="button" @click="emit('realtime-monitor')">实时监控</button>
    </div>
  </div>
</template>

<style lang="less" scoped>
.iot-device-info {
  width: 280px;
  min-height: 190px;
  padding: 16px;
  position: relative;
  background: var(--dispatch-modal-bg, rgba(255, 255, 255, 0.98));
  border: 1px solid var(--dispatch-border, #dbe4ef);
  box-shadow: var(--dispatch-shadow-strong, 0 12px 32px rgba(26, 54, 93, 0.18));
  color: var(--dispatch-text, #1f2d3d);
  border-radius: 4px;
}

.iot-device-info-close {
  width: 24px;
  height: 24px;
  padding: 0;
  position: absolute;
  top: 12px;
  right: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--dispatch-map-blue-soft, #eaf4ff);
  border: 1px solid var(--dispatch-map-blue-border, #cfe0f3);
  border-radius: 4px;
  color: var(--dispatch-map-blue, #216cc3);
  cursor: pointer;
}

.iot-device-info-name {
  min-height: 28px;
  padding-right: 32px;
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--dispatch-text, #1f2d3d);
  font-size: 16px;
  font-weight: 500;
  line-height: 22px;
}

.iot-device-info-content {
  margin-top: 10px;
  color: var(--dispatch-text-secondary, #4f5f72);
  font-size: 13px;
  line-height: 24px;
}

.iot-device-info-btn {
  margin-top: 12px;
  display: flex;
  justify-content: flex-end;
}

.iot-device-info-btn > button {
  min-width: 88px;
  height: 30px;
  padding: 0 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--dispatch-map-blue, #216cc3);
  border: 1px solid var(--dispatch-map-blue, #216cc3);
  border-radius: 4px;
  color: #ffffff;
  cursor: pointer;
}
</style>
