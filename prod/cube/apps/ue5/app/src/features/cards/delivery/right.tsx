import { defineComponent } from "vue";

import StarRealtimeEvaluation from "./cards/star-realtime-evaluation";
import StarRevenueDistribution from "./cards/star-revenue-distribution";
import StarRevenueTrend from "./cards/star-revenue-trend";

export const Right = defineComponent({
  name: "Right",
  setup() {
    return (): JSX.Element => (
      <div>
        <StarRevenueDistribution />
        <StarRevenueTrend />
        <StarRealtimeEvaluation />
      </div>
    );
  },
});

export default Right;
