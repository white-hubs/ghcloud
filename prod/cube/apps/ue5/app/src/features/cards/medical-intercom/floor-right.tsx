import { defineComponent } from "vue";

import DeviceFailurePanel from "./components/device-failure-panel";
import DeviceFailureTypePanel from "./components/device-failure-type-panel";
import DeviceStatisticsPanel from "./components/device-statistics-panel";

import styles from "./floor-right.module.less";

export const FloorRight = defineComponent({
  name: "FloorRight",
  setup(_props, ctx) {
    return (): JSX.Element => (
      <div>
        <DeviceStatisticsPanel />
        <DeviceFailureTypePanel chart-height={220} />
        <DeviceFailurePanel chart-height={220} />
      </div>
    );
  },
});

export default FloorRight;
