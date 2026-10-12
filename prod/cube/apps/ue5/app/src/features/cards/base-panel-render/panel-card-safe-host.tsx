import { defineComponent, onErrorCaptured, ref } from "vue";

import styles from "./panel-card-safe-host.module.less";

/** 单卡错误边界：渲染/生命周期异常时降级，避免拖垮整侧面板 */
export const PanelCardSafeHost = defineComponent({
  name: "PanelCardSafeHost",
  props: {
    code: { type: String, required: false, default: "" },
    title: { type: String, required: false, default: "" },
  },
  setup(props, { slots }) {
    const failed = ref(false);
    const message = ref("");

    onErrorCaptured((error) => {
      failed.value = true;
      message.value = error instanceof Error ? error.message : String(error);
      console.error(`[PanelCardSafeHost] card "${props.code || props.title}" crashed`, error);
      return false;
    });

    return (): JSX.Element => {
      if (failed.value) {
        return (
          <div class={styles.fallback} data-card-code={props.code || undefined}>
            <div class={styles.title}>{props.title || props.code || "数据卡片"}</div>
            <div class={styles.desc}>卡片加载失败，其他面板不受影响</div>
            {message.value ? <div class={styles.detail}>{message.value}</div> : null}
          </div>
        );
      }
      return <>{slots.default?.()}</>;
    };
  },
});

export default PanelCardSafeHost;
