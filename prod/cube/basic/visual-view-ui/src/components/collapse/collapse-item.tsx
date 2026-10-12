import { defineComponent } from "vue";
import { NCollapseItem, type CollapseItemProps } from "naive-ui";
export const CollapseItem = defineComponent({
  props: ["disabled", "name", "title"],
  setup(props: CollapseItemProps, { slots }) {
    return () => {
      return <NCollapseItem {...props}>{slots}</NCollapseItem>;
    };
  }
});
