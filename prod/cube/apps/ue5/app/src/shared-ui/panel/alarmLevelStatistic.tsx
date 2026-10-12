import { defineComponent } from "vue";
import { withDefaults } from "vue";

import subPanelTemplate from "./subPanelTemplate";
import Pie from "@/shared-ui/panel/charts/pie/pie";

export const AlarmLevelStatistic = defineComponent({
  name: "AlarmLevelStatistic",
  props: {
    title: { type: String, required: false, default: "标题" },
  },
  setup(props, ctx) {
    interface Props {
      title?: string;
    }
  },
});

export default AlarmLevelStatistic;
