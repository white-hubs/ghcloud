<template>
  <div class="sub-panel-wrapper">
    <Convention
      :title="title"
      :titleFontSize="titleFontSize"
      :zoomable="zoomable"
      v-if="titleType === 'classicsCard'"
      @title-click="openZoom"
    >
      <template #extra>
        <slot name="extra"></slot>
      </template>
      <slot />
    </Convention>
    <BackgroundTitleBar
      :title="title"
      :zoomable="zoomable"
      v-else-if="titleType === 'policeCard'"
      @title-click="openZoom"
    >
      <template #extra>
        <slot name="extra"></slot>
      </template>
      <slot />
    </BackgroundTitleBar>
    <Teleport to="body" v-if="zoomable">
      <ModalPanelZoom
        v-model:visible="zoomVisible"
        :title="zoomTitle || title"
        :width="zoomWidth"
      >
        <slot name="zoom-content">
          <slot />
        </slot>
      </ModalPanelZoom>
    </Teleport>
  </div>
</template>
<script lang="ts" setup>
import { ref } from "vue";
import Convention from "./subPanelType/convention.vue";
import BackgroundTitleBar from "./subPanelType/background-title-bar.vue";
import ModalPanelZoom from "../../modal-table/modal-panel-zoom.vue";

interface Props {
  title?: string;
  titleFontSize?: string;
  zoomable?: boolean;
  zoomTitle?: string;
  zoomWidth?: string | number;
}
const props = withDefaults(defineProps<Props>(), {
  title: "标题",
  zoomable: false,
  zoomWidth: 1200,
});

const emit = defineEmits<{
  'zoom': [];
}>();

const titleType = ref(window.config?.otherConfig?.cardType ?? 'classicsCard');
const zoomVisible = ref(false);

const openZoom = () => {
  if (!props.zoomable) return;
  zoomVisible.value = true;
  emit('zoom');
};
</script>
<style scoped lang="less">
.sub-panel-wrapper {
  position: relative;
}
</style>
