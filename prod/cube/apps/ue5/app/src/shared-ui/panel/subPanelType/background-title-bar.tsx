import { defineComponent, inject } from "vue";

import { panelCardLoadedKey } from "@/shared-ui/panel/panel-card-loaded-context";
import PanelCardLoading from "@/shared-ui/panel/panel-card-loading";

import "./background-title-bar.module.less";

export const BackgroundTitleBar = defineComponent({
  name: "BackgroundTitleBar",
  props: {
    title: { type: String, required: false, default: "标题" },
    zoomable: { type: Boolean, required: false, default: false },
  },
  emits: ["title-click"],
  setup(props, { emit, slots }) {
    const cardLoaded = inject(panelCardLoadedKey, undefined);

    const handleTitleClick = (): void => {
      if (props.zoomable) {
        emit("title-click");
      }
    };

    return (): JSX.Element => (
      <div class="sub-panel flex-column bg-img police-title-bar">
        <div style="border-bottom: none" class="sub-panel-header flex-between">
          <div class={["title flex-between", props.zoomable ? "zoomable-title" : ""]} onClick={handleTitleClick}>
            <span class="sub-title">{props.title}</span>
          </div>
          <div class="header-extra">{slots.extra?.()}</div>
        </div>
        <div class="sub-panel-content">{cardLoaded && !cardLoaded.value ? <PanelCardLoading /> : slots.default?.()}</div>
      </div>
    );
  },
});

export default BackgroundTitleBar;
