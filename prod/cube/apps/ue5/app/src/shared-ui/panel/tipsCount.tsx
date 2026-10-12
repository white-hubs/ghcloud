import { defineComponent } from "vue";

import styles from "./tipsCount.module.less";

export const TipsCount = defineComponent({
  name: "TipsCount",
  props: {
    status: { type: String, required: true, default: "1" },
    count: { type: Number, required: true, default: 23244 },
  },
  setup(props, ctx) {
    interface Props {
      status: string;
      count: number;
    }
    const statusTextMap: Map<string, string> = new Map([
      ["0", "未处理"],
      ["1", "已处理"],
      ["2", "超时处理"],
    ]);
    return (): JSX.Element => (
      <>
        <div class="tips_count">
          {props.status === "0" && <div class={["dot", " warring"]}></div>}
          {props.status === "1" && <div class={["dot", "success"]}></div>}
          {props.status === "2" && <div class={["dot", "wait"]}></div>}
          <div class="content">
            <div class="status"> {statusTextMap.get(props.status)}</div>
            <div class="count"> {props.count}</div>
          </div>
        </div>
      </>
    );
  },
});

export default TipsCount;
