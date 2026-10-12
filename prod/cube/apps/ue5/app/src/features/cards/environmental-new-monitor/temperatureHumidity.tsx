import { defineComponent } from "vue";

import styles from "./temperatureHumidity.module.less";

export const TemperatureHumidity = defineComponent({
  name: "TemperatureHumidity",
  setup(_props, ctx) {
    return (): JSX.Element => (
      <>
        <div class="lenged-container">
          <div class="lenged-item"></div>
          <div class="lenged-item"></div>
        </div>
      </>
    );
  },
});

export default TemperatureHumidity;
