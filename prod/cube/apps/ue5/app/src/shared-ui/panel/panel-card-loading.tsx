import { Spin } from "ant-design-vue";
import { defineComponent } from "vue";

import "@/features/cards/_shared/v2-panel-base.less";

export const PanelCardLoading = defineComponent({
  name: "PanelCardLoading",
  props: {
    zoom: { type: Boolean, default: false },
    tip: { type: String, default: "数据加载中..." },
    minHeight: { type: [Number, String], default: undefined },
  },
  setup(props) {
    return (): JSX.Element => (
      <div
        class={["panel-loading", props.zoom ? "is-zoom" : ""]}
        data-no-zoom
        style={
          props.minHeight !== undefined
            ? { minHeight: typeof props.minHeight === "number" ? `${props.minHeight}px` : props.minHeight }
            : undefined
        }
      >
        <Spin size="large" tip={props.tip} />
      </div>
    );
  },
});

export default PanelCardLoading;
