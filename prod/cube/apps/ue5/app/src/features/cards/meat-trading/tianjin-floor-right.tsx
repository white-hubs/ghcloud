import { defineComponent } from "vue";

import TianjinTallyData from "./cards/tianjin-tally-data";
import TianjinWhiteStripeTransactionData from "./cards/tianjin-white-stripe-transaction-data";

export const TianjinFloorRight = defineComponent({
  name: "TianjinFloorRight",
  setup() {
    return (): JSX.Element => (
      <>
        <TianjinWhiteStripeTransactionData />
        <TianjinTallyData />
      </>
    );
  },
});

export default TianjinFloorRight;
