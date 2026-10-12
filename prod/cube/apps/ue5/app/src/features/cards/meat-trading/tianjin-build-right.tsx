import { defineComponent } from "vue";

import TianjinFoodSafetyInfo from "./cards/tianjin-food-safety-info";
import TianjinSupplyInfo from "./cards/tianjin-supply-info";
import TianjinTransactionInfo from "./cards/tianjin-transaction-info";

export const TianjinBuildRight = defineComponent({
  name: "TianjinBuildRight",
  setup() {
    return (): JSX.Element => (
      <>
        <TianjinTransactionInfo />
        <TianjinSupplyInfo />
        <TianjinFoodSafetyInfo />
      </>
    );
  },
});

export default TianjinBuildRight;
