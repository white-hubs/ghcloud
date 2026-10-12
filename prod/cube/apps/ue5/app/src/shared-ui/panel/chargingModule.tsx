import { defineComponent } from "vue";

import { getAssetsImage } from "@/infrastructure/utils/getImage";

import styles from "./chargingModule.module.less";

export const ChargingModule = defineComponent({
  name: "ChargingModule",
  props: {
    collectFeesData: { type: Object, required: true },
  },
  setup(props, ctx) {
    interface data {
      img: string;
      value: number;
      label: string;
      ringRatio: number;
    }

    interface Props {
      collectFeesData: data;
    }
    return (): JSX.Element => (
      <>
        <div class="collectFeesBox">
          <div class="imgBox">
            {" "}
            <img src={getAssetsImage(props.collectFeesData.img)}></img>
          </div>
          <div class="box1"> {props.collectFeesData.value ?? 0}</div>
          <div class="box2"> {props.collectFeesData.label}</div>
          <div class="ringRatio">
            <span> 环比</span>
            <div class={["downtriangle", props.collectFeesData.ringRatio > 0 && "uptriangle"]}></div>
            <div class={[props.collectFeesData.ringRatio > 0 ? "up" : "down"]}> {props.collectFeesData.ringRatio + "%"}</div>
          </div>
        </div>
      </>
    );
  },
});

export default ChargingModule;
