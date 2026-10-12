import { defineComponent } from "vue";
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from "vue";

import { BaseDashboard } from "@/shared-ui/base/base-dashboard";
import { PressureDashboard } from "@/shared-ui/dashboard/fire/pressure/pressure";

import styles from "./pressure.module.less";

export const Pressure = defineComponent({
  name: "Pressure",
  props: {
    data: { type: null, required: true, default: {} },
    productPropVoList: { type: Array, required: true, default: () => [] },
  },
  setup(props, ctx) {},
});

export default Pressure;
