import { defineComponent } from "vue";

import TianjinBatchSuspicionRate from "./cards/tianjin-batch-suspicion-rate";
import TianjinDeviceData from "./cards/tianjin-device-data";
import TianjinFoodSafetyFloor from "./cards/tianjin-food-safety-floor";

export const TianjinFloorLeft = defineComponent({
  name: "TianjinFloorLeft",
  setup() {
    return (): JSX.Element => (
      <>
        <TianjinFoodSafetyFloor />
        <TianjinBatchSuspicionRate />
        <TianjinDeviceData />
      </>
    );
  },
});

export default TianjinFloorLeft;
