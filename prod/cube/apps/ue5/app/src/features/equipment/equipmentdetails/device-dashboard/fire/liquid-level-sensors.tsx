import { defineComponent } from "vue";
import { onBeforeUnmount, onMounted, watch } from "vue";

import { BaseDashboard } from "@/shared-ui/base/base-dashboard";
import { LiquidLevelDashboard } from "@/shared-ui/dashboard/fire/liquid-level/liquid-level";

import styles from "./liquid-level-sensors.module.less";

export const LiquidLevelSensors = defineComponent({
  name: "LiquidLevelSensors",
  props: {
    data: { type: null, required: true, default: {} },
    productPropVoList: { type: Array, required: true, default: () => [] },
    showAllElectricEnergy: { type: Boolean, required: true, default: false },
  },
  setup(props, ctx) {},
});

export default LiquidLevelSensors;
