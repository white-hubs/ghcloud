import { Loading, Overlay } from "vant";
import { defineComponent, type PropType } from "vue";

import styles from "./index.module.less";

export const PageLoadingOverlay = defineComponent({
  name: "PageLoadingOverlay",
  props: {
    show: {
      type: Boolean,
      required: true,
    },
    text: {
      type: String as PropType<string>,
      default: "加载中...",
    },
  },
  setup: (props) => () => (
    <Overlay show={props.show} zIndex={2800} class={styles.overlay}>
      <div class={styles.panel}>
        <Loading size="24px" vertical>
          {props.text}
        </Loading>
      </div>
    </Overlay>
  ),
});
