import { defineComponent } from "vue";
import { nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from "vue";

import { cubeSecurityManagementService } from "@/infrastructure/api/service";
import { BaseDashboard } from "@/shared-ui/base/base-dashboard";
import { CurrentDashboard } from "@/shared-ui/dashboard/electric/current/current";
import { TemperatureDashboard } from "@/shared-ui/dashboard/electric/temperature/temperature";
import { VoltageDashboard } from "@/shared-ui/dashboard/electric/voltage/voltage";

import styles from "./electric.module.less";

export const Electric = defineComponent({
  name: "Electric",
  props: {
    data: { type: null, required: true, default: {} },
    productPropVoList: { type: Array, required: true, default: () => [] },
    showAllElectricEnergy: { type: Boolean, required: true, default: false },
  },
  setup(props, ctx) {},
});

export default Electric;
