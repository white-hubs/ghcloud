import { defineComponent } from "vue";

import CallStatisticsInfoPanel from "./components/call-statistics-info-panel";
import CallStatisticsPanel from "./components/call-statistics-panel";

export const BuildLeft = defineComponent({
  name: "BuildLeft",
  setup(_props, ctx) {
    return (): JSX.Element => (
      <div>
        <CallStatisticsPanel />
        <CallStatisticsInfoPanel chart-height={220} />
      </div>
    );
  },
});

export default BuildLeft;
