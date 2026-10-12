import { defineComponent } from "vue";

import CallStatisticsPanel from "./components/call-statistics-panel";

export const FloorLeft = defineComponent({
  name: "FloorLeft",
  setup(_props, ctx) {
    return (): JSX.Element => (
      <div>
        <CallStatisticsPanel />
      </div>
    );
  },
});

export default FloorLeft;
