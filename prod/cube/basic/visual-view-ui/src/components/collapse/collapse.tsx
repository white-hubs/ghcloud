import { defineComponent } from "vue";
import { NCollapse, type CollapseProps } from "naive-ui";
export const Collapse = defineComponent({
  props: ["accordion", "arrow-placement","onUpdateExpandedNames"],
  setup(props: CollapseProps, { slots, emit }) {
    return () => {
      return <NCollapse {...props} onUpdateExpandedNames={props.onUpdateExpandedNames}>{slots}</NCollapse>;
    };
  }
});
