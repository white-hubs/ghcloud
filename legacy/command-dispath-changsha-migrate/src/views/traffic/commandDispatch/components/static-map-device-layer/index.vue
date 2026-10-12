<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, shallowRef, watch } from "vue";

import { calculateCoverLayout, projectNormalizedPoint } from "../../utils/static-map-cover";

const props = defineProps({
  backgroundUrl: {
    type: String,
    required: true,
  },
  devices: {
    type: Array,
    default: () => [],
  },
  selectedDeviceId: {
    type: [String, Number],
    default: "",
  },
});

const emit = defineEmits(["device-click"]);

const rootRef = ref(null);
const imageSize = shallowRef({
  width: 0,
  height: 0,
});
const coverLayout = shallowRef(null);
let resizeObserver = null;
let imageLoadToken = 0;

const backgroundStyle = computed(() => ({
  backgroundImage: `url("${props.backgroundUrl}")`,
}));

const visibleDevices = computed(() =>
  props.devices
    .map((device) => {
      const position = projectNormalizedPoint(device, coverLayout.value);
      if (!position) return null;
      return {
        device,
        popupOnLeft: position.left > (rootRef.value?.clientWidth || 0) * 0.65,
        style: {
          left: `${position.left}px`,
          top: `${position.top}px`,
        },
      };
    })
    .filter(Boolean),
);

const updateCoverLayout = () => {
  const root = rootRef.value;
  if (!root) return;

  coverLayout.value = calculateCoverLayout({
    containerWidth: root.clientWidth,
    containerHeight: root.clientHeight,
    imageWidth: imageSize.value.width,
    imageHeight: imageSize.value.height,
  });
};

const loadBackgroundImageSize = (url) => {
  const token = ++imageLoadToken;
  coverLayout.value = null;
  imageSize.value = {
    width: 0,
    height: 0,
  };
  if (!url) return;

  const image = new Image();
  image.onload = () => {
    if (token !== imageLoadToken) return;
    imageSize.value = {
      width: image.naturalWidth,
      height: image.naturalHeight,
    };
    nextTick(updateCoverLayout);
  };
  image.onerror = () => {
    if (token !== imageLoadToken) return;
    coverLayout.value = null;
  };
  image.src = url;
};

watch(
  () => props.backgroundUrl,
  (url) => loadBackgroundImageSize(url),
  { immediate: true },
);

onMounted(() => {
  if (typeof ResizeObserver === "function") {
    resizeObserver = new ResizeObserver(updateCoverLayout);
    rootRef.value && resizeObserver.observe(rootRef.value);
  } else {
    window.addEventListener("resize", updateCoverLayout);
  }
  nextTick(updateCoverLayout);
});

onBeforeUnmount(() => {
  ++imageLoadToken;
  resizeObserver?.disconnect();
  window.removeEventListener("resize", updateCoverLayout);
});
</script>

<template>
  <div ref="rootRef" class="static-map-device-layer" :style="backgroundStyle">
    <div
      v-for="{ device, popupOnLeft, style } in visibleDevices"
      :key="device.id"
      class="static-map-device-position"
      :class="{
        selected: String(selectedDeviceId) === String(device.id),
        special: device.isSpecial,
      }"
      :style="style"
    >
      <button
        class="static-map-device-marker"
        :class="{ special: device.isSpecial }"
        type="button"
        :title="device.name || device.id"
        @click="emit('device-click', device)"
      >
        <img class="static-map-device-icon" :class="{ special: device.isSpecial }" :src="device.iconUrl" :alt="device.name || '设备'" />
      </button>
      <div v-if="String(selectedDeviceId) === String(device.id)" class="static-map-device-popup" :class="{ left: popupOnLeft }" @click.stop>
        <slot name="device-popup" :device="device"></slot>
      </div>
    </div>
  </div>
</template>

<style lang="less" scoped>
.static-map-device-layer {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
}

.static-map-device-position {
  width: 0;
  height: 0;
  position: absolute;
  z-index: 5;

  &.special .static-map-device-popup {
    left: 44px;

    &.left {
      right: 44px;
      left: auto;
    }
  }
}

.static-map-device-marker {
  width: 32px;
  height: 32px;
  padding: 0;
  position: absolute;
  top: 0;
  left: 0;
  display: flex;
  align-items: center;
  border: 0;
  background: transparent;
  color: #ff3d3d;
  cursor: pointer;
  transform: translate(-50%, -50%);

  &.special {
    width: 64px;
    height: 64px;
  }
}

.static-map-device-icon {
  width: 32px;
  height: 32px;
  flex: 0 0 32px;
  object-fit: contain;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.35));

  &.special {
    width: 64px;
    height: 64px;
    flex-basis: 64px;
    border: 2px solid #ffffff;
    border-radius: 50%;
    background: #ffffff;
    object-fit: cover;
  }
}

.static-map-device-popup {
  position: absolute;
  top: 50%;
  left: 28px;
  transform: translateY(-50%);

  &.left {
    right: 28px;
    left: auto;
  }
}
</style>
