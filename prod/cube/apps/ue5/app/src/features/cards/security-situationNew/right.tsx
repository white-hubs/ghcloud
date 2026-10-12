import { defineComponent } from "vue";

import ElevatorAnalysisPanel from "./components/elevator-analysis-panel";
import SecurityStatisticsPanel from "./components/security-statistics-panel";
import TodayAnalysisPanel from "./components/today-analysis-panel";

export const Right = defineComponent({
  name: "Right",
  setup(_props, ctx) {
    const fromPage: FromPageType = "PARK";

    return (): JSX.Element => (
      <div>
        <SecurityStatisticsPanel from-page={fromPage} chart-height={220} />
        <TodayAnalysisPanel from-page={fromPage} chart-height={240} />
        <ElevatorAnalysisPanel from-page={fromPage} />
      </div>
    );
  },
});

export default Right;
