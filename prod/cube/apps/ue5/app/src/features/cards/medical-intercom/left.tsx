import { defineComponent } from "vue";

import CallStatisticsInfoPanel from "./components/call-statistics-info-panel";
import CallStatisticsPanel from "./components/call-statistics-panel";

export const Left = defineComponent({
  name: "Left",
  setup(_props, ctx) {
    return (): JSX.Element => (
      <div>
        <CallStatisticsPanel />
        <CallStatisticsInfoPanel chart-height={400} />
      </div>
    );
  },
});

export default Left;
