import { defineComponent } from "vue";
import { onMounted, onUnmounted, reactive } from "vue";

import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { px2rem } from "@/infrastructure/utils/common";
import HorizontalBar from "@/shared-ui/panel/charts/horizontal-bar/horizontal-bar";

import styles from "./device-failure-type-panel.module.less";

export const DeviceFailureTypePanel = defineComponent({
  name: "DeviceFailureTypePanel",
  props: {
    chartHeight: { type: Number, required: false, default: 220 },
  },
  setup(props, ctx) {},
});

export default DeviceFailureTypePanel;
