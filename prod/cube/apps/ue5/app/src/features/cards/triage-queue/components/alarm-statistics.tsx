import { CaretRightOutlined } from "@ant-design/icons-vue";
import { defineComponent } from "vue";

import CountTo from "@/shared-ui/panel/count-to/count-to";

import styles from "./alarm-statistics.module.less";

export const AlarmStatistics = defineComponent({
  name: "AlarmStatistics",
  props: {
    statisticsData: { type: Array, required: true, default: () => [] },
  },
  setup(props, ctx) {},
});

export default AlarmStatistics;
