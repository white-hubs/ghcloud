import { defineComponent } from "vue";
import { onMounted, ref, watch } from "vue";

import { render } from "./chart";
import { getOption } from "./option";

import styles from "./pie.module.less";

export const Pie = defineComponent({
  name: "Pie",
  props: {
    data: { type: Array, required: true },
    valueKey: { type: String, required: true },
    labelKey: { type: String, required: true },
    falg: { type: Boolean, required: false },
  },
  setup(props, ctx) {
    const pieRef = ref();
    onMounted(() => {
      if (!pieRef.value) {
        throw new Error("容器初始化失败");
      }
      render(pieRef.value, getOption(props.data, props.valueKey, props.labelKey, props?.falg));
    });

    return (): JSX.Element => (
      <div class="pie" ref={pieRef}>
        {" "}
        pie
      </div>
    );
  },
});

export default Pie;
