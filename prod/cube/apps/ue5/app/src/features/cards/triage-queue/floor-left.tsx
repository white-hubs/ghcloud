import { defineComponent } from "vue";

import AppointmentVisitDistributionPanel from "./components/appointment-visit-distribution-panel";
import ReceptionTrendsPanel from "./components/reception-trends-panel";
import WaitingSituationPanleFloor from "./components/waiting-situation-panle-floor";

import styles from "./floor-left.module.less";

export const FloorLeft = defineComponent({
  name: "FloorLeft",
  setup(_props, ctx) {
    return (): JSX.Element => (
      <div>
        <WaitingSituationPanleFloor />
        <ReceptionTrendsPanel chart-height={230} />
        <AppointmentVisitDistributionPanel />
      </div>
    );
  },
});

export default FloorLeft;
