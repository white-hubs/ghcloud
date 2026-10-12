import { defineComponent } from "vue";
import { reactive, toRefs, onMounted, ref, watch } from "vue";

import HistoryCourtTrial from "./history-court-trial";
import monitorPanel from "@/features/cards/court-panel/court-overview/components/monitor-panel";
import childLevelSubPanel from "@/shared-ui/panel/childLevelSubPanel";
import LineChart from "@/shared-ui/panel/lineChart";

import styles from "./court-arrange-info.module.less";

export const CourtArrangeInfo = defineComponent({
  name: "CourtArrangeInfo",
  props: {
    modelValue: { type: String, required: true, default: "THIS_YEAR" },
  },
  setup(props, ctx) {
    interface Props {
      modelValue: string;
    }
  },
});

export default CourtArrangeInfo;
