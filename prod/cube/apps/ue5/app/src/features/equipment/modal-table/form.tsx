import { defineComponent } from "vue";
import { computed, reactive } from "vue";

import type { FormItem } from "./type";

import styles from "./form.module.less";

export const Form = defineComponent({
  name: "Form",
  props: {
    formItem: { type: Array, required: true, default: () => [] },
  },
  setup(props, ctx) {
    interface Props {
      formItem: FormItem[];
    }
  },
});

export default Form;
