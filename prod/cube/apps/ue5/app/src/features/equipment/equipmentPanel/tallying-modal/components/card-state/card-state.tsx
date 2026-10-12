import { defineComponent } from "vue";

import { PorkArrangeStatus } from "@ghcloud/cube-slide-rail-service";

import styles from "./index.module.less";

interface Props {
  state: PorkArrangeStatus;
}
export const CardState = defineComponent({
  props: ["state"],
  setup: (props: Props) => {
    const stateList = [
      {
        state: PorkArrangeStatus.Finished,
        title: "完成理货",
      },
      {
        state: PorkArrangeStatus.Paused,
        title: "暂停理货",
      },
      {
        state: PorkArrangeStatus.Progressed,
        title: "正在理货",
      },
      {
        state: PorkArrangeStatus.Waited,
        title: "待理货",
      },
      {
        state: PorkArrangeStatus.Unknown,
        title: "理货未知",
      },
    ];
    return () => (
      <div class={[styles.title, styles[props.state]]}>
        <span>{stateList.find((e) => e.state === props.state)?.title}</span>
      </div>
    );
  },
});
