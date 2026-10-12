import { defineComponent } from "vue";

import { AlarmRateList } from "./types";

import styles from "./deviceModule.module.less";

export const DeviceModule = defineComponent({
  name: "DeviceModule",
  props: {
    dataList: { type: Array, required: true },
  },
  setup(props, ctx) {
    interface Props {
      dataList: AlarmRateList[];
    }
    return (): JSX.Element => (
      <>
        <div class="deviceList">
          {props.dataList.map((item, index) => (
            <div class="deviceBox" key={index}>
              <div class="titleBox">
                <span class="drop" style={{ background: item.color }}></span>
                <span> {item.title}</span>
              </div>
              <div class="ringRatio">
                <span> {item.value}</span>
                {item.ringRatio && (
                  <div class="row">
                    <div class={["downtriangle", Number(item.label) > 0 && "uptriangle"]}></div>
                    <div class={[Number(item.label) > 0 ? "up" : "down"]}> {item.label + item.unit}</div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </>
    );
  },
});

export default DeviceModule;
