import { defineComponent } from "vue";

import AlarmStatisticsPanelFloor from "./components/alarm-statistics-panel-floor";
import DeviceStatisticsPanel from "./components/device-statistics-panel";
import faultInformationPanel from "./components/fault-information-panel";

import styles from "./floor-right.module.less";

export const FloorRight = defineComponent({
  name: "FloorRight",
  setup(_props, ctx) {
    return (): JSX.Element => (
      <div>
        <DeviceStatisticsPanel />
        <faultInformationPanel />
        <AlarmStatisticsPanelFloor />
      </div>
    );
  },
});

export default FloorRight;
