import { defineComponent } from "vue";

import TianjinSlaughterhouseSupplyTop from "./cards/tianjin-slaughterhouse-supply-top";
import TianjinTransactionTop5 from "./cards/tianjin-transaction-top5";

export const TianjinBuildLeft = defineComponent({
  name: "TianjinBuildLeft",
  setup() {
    return (): JSX.Element => (
      <>
        <TianjinTransactionTop5 />
        <TianjinSlaughterhouseSupplyTop />
      </>
    );
  },
});

export default TianjinBuildLeft;
