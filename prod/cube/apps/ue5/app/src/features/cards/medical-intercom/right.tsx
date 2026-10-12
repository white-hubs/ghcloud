import { defineComponent } from "vue";

import DeviceAnalysisPanel from "./components/device-analysis-panel";
import DeviceFailureTrendPanel from "./components/device-failure-trend-panel";
import DeviceStatisticsPanel from "./components/device-statistics-panel";
import PublicSecurityDeviceCount from "@/features/cards/security-overview/cards/public-security-device-count";

import styles from "./right.module.less";

export const Right = defineComponent({
  name: "Right",
  setup(_props, ctx) {
    return (): JSX.Element => (
      <div>
        <DeviceStatisticsPanel />
        <DeviceFailureTrendPanel chart-height={220} />
        <PublicSecurityDeviceCount />
      </div>
    );
  },
});

export default Right;
