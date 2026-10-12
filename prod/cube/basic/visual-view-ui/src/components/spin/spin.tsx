import { defineComponent } from "vue";
import { NSpin } from "naive-ui";
export const Spin = defineComponent({
  props: ["show", "type"],
  emits: ["tabChange"],
  setup(props, { slots, emit }) {
    return () => {
      return (
        <NSpin
          {...props}
        >
          {slots}
        </NSpin>
      );
    };
  }
});
