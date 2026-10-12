import { defineComponent } from "vue";

import styles from "./traffic.module.less";

export const Traffic = defineComponent({
  name: "Traffic",
  props: {
    trafficInfo: { type: Object, required: true },
    unit: { type: String, required: false },
  },
  setup(props, ctx) {
    interface data {
      color: string;
      label: string;
      value: number | string;
    }
    interface Props {
      trafficInfo: data;
      unit?: string;
    }
    return (): JSX.Element => (
      <>
        <div class="trafficList">
          <div class="trafficBox">
            <div class="trafficBoxLfet">
              <div class="icon" style={{ background: props.trafficInfo.color }}></div>
              <div> {props.trafficInfo.label}</div>
            </div>
            <span class="trafficBoxRight">
              {props.trafficInfo.value}
              {props.unit}
            </span>
          </div>
        </div>
      </>
    );
  },
});

export default Traffic;
