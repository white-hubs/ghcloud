import { TreeSelect as ATreeSelect, type TreeSelectProps } from "ant-design-vue/es";
import { defineComponent } from "vue";
export const TreeSelect = defineComponent({
  props: [
    "fieldNames",
    "disabled",
    "placeholder",
    "showSearch",
    "multiple",
    "treeData",
    "value",
    "treeNodeLabelProp",
    "treeNodeFilterProp",
    "maxTagCount",
    "allowClear",
    "showCheckedStrategy",
  ],
  emits: ["change", "update:value"],
  setup(props: TreeSelectProps, { emit }) {
    const handleChange = (value: string[], label: string[], extra: unknown): void => {
      emit("update:value", value);
      emit("change", value, label, extra);
    };
    return (): JSX.Element => <ATreeSelect {...props} v-model:value={props.value} onChange={handleChange} />;
  },
});
