import { defineComponent } from "vue";

import StarOrderDistribution from "./cards/star-order-distribution";
import StarOrderTrend from "./cards/star-order-trend";
import StarUserDistribution from "./cards/star-user-distribution";
import StarUserTrend from "./cards/star-user-trend";

export const Left = defineComponent({
  name: "Left",
  setup() {
    return (): JSX.Element => (
      <div>
        <StarOrderDistribution />
        <StarOrderTrend />
        <StarUserDistribution />
        <StarUserTrend />
      </div>
    );
  },
});

export default Left;
