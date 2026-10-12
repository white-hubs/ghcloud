import { defineComponent } from "vue";
import { computed, ref, watch } from "vue";

import styles from "./elevator-analysis-list.module.less";

export const ElevatorAnalysisList = defineComponent({
  name: "ElevatorAnalysisList",
  props: {
    contentList: { type: Array, required: true },
    showRatio: { type: Boolean, required: false, default: false },
    warperClassName: { type: String, required: false, default: "" },
    showNumber: { type: Boolean, required: false, default: true },
    unit: { type: String, required: false, default: "个" },
  },
  emits: ["handlecurrent", "clickName", "clickValue"],
  setup(props, { emit }) {
    interface list {
      name: string;
      value: number | string;
      color: string;
      ratio?: string;
      code?: string;
    }
    interface Props {
      contentList: list[];
      showRatio?: boolean;
      warperClassName?: string;
      showNumber?: boolean;
      unit?: string;
    }
    const countNum = (value: number | string) => {
      let num = 0;
      contentList.value.forEach((item) => {
        num += Number(item.value);
      });
      if (props.showRatio) {
        return value ? (Math.round((Number(value) / num) * 10000) / 100).toFixed(1) + "%" : value + "%";
      } else {
        return value;
      }
    };

    const contentList = ref([]);
    watch(
      () => props.contentList,
      () => {
        contentList.value = props.contentList;
      },
      { deep: true, immediate: true },
    );

    const handleCurrent = (item) => {
      emit("handlecurrent", item);
    };
    const handleName = (item) => {
      emit("clickName", item);
    };
    const handleValue = (item) => {
      emit("clickValue", item);
    };

    return (): JSX.Element => (
      <>
        <div class={`alarm-analysis ${props.warperClassName}`}>
          {(contentList.value ?? []).map((item, index) => (
            <div
              class="alarm-analysisBox"
              key={item.name || index}
              onClick={() => {
                handleCurrent(item);
              }}
            >
              <div class="alarm-analysis-left">
                <div class="alarm-analysis-color" style={{ background: item.color }}></div>
                <div
                  class="alarm-analysis-name"
                  title={item.name}
                  onClick={() => {
                    handleName(item);
                  }}
                >
                  {" "}
                  {item.name}
                </div>
              </div>
              {props.showNumber && (
                <div class="alarm-analysis-right">
                  {item.value}
                  {props.unit}
                </div>
              )}
              {props.showRatio && (
                <div
                  onClick={() => {
                    handleValue(item);
                  }}
                >
                  {" "}
                  {countNum(item.value)}
                </div>
              )}
            </div>
          ))}
        </div>
      </>
    );
  },
});

export default ElevatorAnalysisList;
