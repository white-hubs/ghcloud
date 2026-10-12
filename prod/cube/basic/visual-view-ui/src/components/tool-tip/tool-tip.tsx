import { defineComponent } from "vue";
import { NTooltip } from "naive-ui";
export const ToolTip = defineComponent({
  setup(props, { slots, emit }) {
    return () => {
      return (
        <NTooltip
          {...props}
        >
          {slots}
        </NTooltip>
      );
    };
  }
});
