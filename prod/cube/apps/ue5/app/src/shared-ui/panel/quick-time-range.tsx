import { defineComponent } from "vue";

import styles from "./quick-time-range.module.less";

export const QuickTimeRange = defineComponent({
  name: "QuickTimeRange",
  props: {
    btn1: { type: String, required: false, default: "今天" },
  },
  setup(props, ctx) {},
});

export default QuickTimeRange;
