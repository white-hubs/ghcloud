import { defineComponent } from "vue";
import { withDefaults, ref, onMounted } from "vue";

import { render } from "./chart";

import styles from "./scanRadar.module.less";

export const ScanRadar = defineComponent({
  name: "ScanRadar",
  props: {
    value: { type: Number, required: true, default: 0 },
  },
  setup(props, ctx) {
    interface Props {
      value: number; //设备健康度 数值
    }
    const scanRadar = ref();
    onMounted(() => {
      render(scanRadar.value);
    });

    return (): JSX.Element => (
      <>
        <div class="radar-box">
          <div class="radar" ref={scanRadar}></div>
          <span class="value">{props.value}</span>
        </div>
      </>
    );
  },
});

export default ScanRadar;
