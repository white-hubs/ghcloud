import type { FormInstance } from "ant-design-vue/es";
import type { RuleObject } from "ant-design-vue/lib/form";
import { defineComponent } from "vue";
import { ref, shallowRef, watch } from "vue";

import styles from "./g-form.module.less";

export const GForm = defineComponent({
  name: "GForm",
  props: {
    formSource: { type: Array, required: true, default: () => [] },
    formState: { type: Object, required: true, default: () => ({}) },
    rule: { type: Object, required: true, default: () => ({}) },
    labelWidth: { type: String, required: false, default: "80px" },
  },
  setup(props, ctx) {
    const modalFormRef = shallowRef<FormInstance>();
  },
});

export default GForm;
