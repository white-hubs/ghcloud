import { Comment, defineComponent, inject } from "vue";
import type { VNode } from "vue";

import { getThemeImage } from "@/infrastructure/utils/getImage";
import { panelCardLoadedKey } from "@/shared-ui/panel/panel-card-loaded-context";
import PanelCardLoading from "@/shared-ui/panel/panel-card-loading";

import "./convention.module.less";

const DEFAULT_TITLE_ICON = getThemeImage("security-situation.png");

const hasSlotContent = (nodes: VNode | VNode[] | undefined): boolean => {
  if (!nodes) return false;
  const list = Array.isArray(nodes) ? nodes : [nodes];
  return list.some((node) => node != null && node.type !== Comment);
};

export const Convention = defineComponent({
  name: "Convention",
  props: {
    title: { type: String, required: false, default: "标题" },
    titleFontSize: { type: String, required: false },
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

    return (): JSX.Element => {
      const titleIcon = slots.titleIcon?.();

      return (
        <div class="sub-panel flex-column bg-img">
          <div class="sub-panel-header flex-between">
            <div class={["title", "flex-start", props.zoomable ? "zoomable-title" : ""]} onClick={handleTitleClick}>
              <span class="title-icon-slot flex-center">
                {hasSlotContent(titleIcon) ? titleIcon : <img src={DEFAULT_TITLE_ICON} alt="" class="title-card-icon title-icon-default" />}
              </span>
              <div class="mark" aria-hidden="true">
                <div class="box"></div>
              </div>
              <span class="sub-title" style={props.titleFontSize ? { fontSize: props.titleFontSize } : undefined}>
                {props.title}
              </span>
            </div>
            <div class="header-extra flex-start">{slots.extra?.()}</div>
          </div>
          <div class="lineBox">
            <div></div>
            <div></div>
            <div></div>
          </div>
          <div class="sub-panel-content">{cardLoaded && !cardLoaded.value ? <PanelCardLoading /> : slots.default?.()}</div>
        </div>
      );
    };
  },
});

export default Convention;
