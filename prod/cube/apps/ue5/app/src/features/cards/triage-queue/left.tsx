import { defineComponent } from "vue";

import AppointmentVisitDistributionPanel from "./components/appointment-visit-distribution-panel-exhibition";
import ReceptionTrendsPanel from "./components/reception-trends-panel-exhibition";
import VisitingDataPanel from "./components/visiting-data-panel-exhibition";
import WaitingSituationPanel from "./components/waiting-situation-panel-exhibition";

import styles from "./left.module.less";

export const Left = defineComponent({
  name: "Left",
  setup(_props, ctx) {
    return (): JSX.Element => (
      <div>
        <VisitingDataPanel />
        <ReceptionTrendsPanel />
        <WaitingSituationPanel />
        <AppointmentVisitDistributionPanel />
      </div>
    );
  },
});

export default Left;
