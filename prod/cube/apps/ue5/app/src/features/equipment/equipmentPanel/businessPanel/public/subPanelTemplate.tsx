import styles from "./subPanelTemplate.module.less";
import { defineComponent } from "vue";
import { withDefaults } from "vue";

export const SubPanelTemplate = defineComponent({
  name: "SubPanelTemplate",
  props: {

    title: { type: String, required: false, default: "标题" }
  },
  setup(props, ctx) {

    interface Props {
      title?: string;
    }
    return (): JSX.Element => (
      <>
<div class="sub-panel flex-column">
        <div style="border-bottom: none" class="sub-panel-header flex-between">
          <div class="title flex-between">
            <div class="mark">              <div class="box"></div></div>
            <span>              {title}</span>
          </div>
          <slot name="bar"></slot>
        </div>
        <div class="lineBox">
          <div></div>
          <div></div>
          <div></div>
        </div>
        <div class="sub-panel-content">          <slot /></div>
      </div>
      </>
    );
  },
});

export default SubPanelTemplate;
