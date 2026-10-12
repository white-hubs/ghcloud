import { defineComponent } from "vue";

import AlarmStatisticsPanel from "./components/alarm-statistics-panel";
import DeviceFailureTrendPanel from "./components/device-failure-trend-panel-exhibition";
import DeviceStatisticsPanel from "./components/device-statistics-panel-exhibition";

import styles from "./right.module.less";

export const Right = defineComponent({
  name: "Right",
  setup(_props, ctx) {
    return (): JSX.Element => (
      <div>
        <DeviceStatisticsPanel />
        <DeviceFailureTrendPanel />
        <AlarmStatisticsPanel />
      </div>
    );
  },
});

export default Right;
