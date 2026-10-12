import { defineComponent, type PropType } from "vue";

import "./childLevelSubPanel.module.less";

export const ChildLevelSubPanel = defineComponent({
  name: "ChildLevelSubPanel",
  props: {
    title: { type: String as PropType<string>, required: false, default: "标题" },
  },
  setup(props, { slots }) {
    return (): JSX.Element => (
      <div class="sub-panel child-level-sub-panel">
        <div class="child-panel-box">
          <div class="sub-panel-front"></div>
          <div class="child-panel-header flex-between">
            <div class="title flex-between">
              <div class="mark">
                <div class="box"></div>
              </div>
              <span class="sub-title">{props.title}</span>
              {slots.titleIcon?.()}
            </div>
            <div class="sub-panel-extra">{slots.extra?.()}</div>
          </div>
        </div>
        <div class="sub-panel-content">{slots.default?.()}</div>
      </div>
    );
  },
});

export default ChildLevelSubPanel;
