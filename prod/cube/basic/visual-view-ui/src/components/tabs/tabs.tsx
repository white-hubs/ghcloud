import { defineComponent } from "vue";
import { NTabs as ATabs, type TabsProps,NTabPane } from "naive-ui";
export const Tabs = defineComponent({
  props: ["defaultValue", "type"],
  emits: ["tabChange"],
  setup(props: TabsProps, { slots, emit }) {
    const tabschange = (): void => {
      emit("tabChange");
    };
    return () => {
      return (
        <ATabs
          {...props}
          defaultValue={props.defaultValue}
          onUpdateValue={tabschange}
        >
          {slots}
        </ATabs>
      );
    };
  }
});
