import { defineComponent } from "vue";
import { ref, reactive, toRefs, onMounted } from "vue";

import CountTo from "@/shared-ui/panel/count-to/count-to";

import styles from "./faultBox.module.less";

export const FaultBox = defineComponent({
  name: "FaultBox",
  props: {
    data: { type: Array, required: true },
  },
  setup(props, ctx) {
    interface List {
      color: string;
      name: string;
      value: number;
    }
    interface Props {
      data: List[];
    }
    return (): JSX.Element => (
      <>
        {data.map((item) => (
          <div class="faultBox" key={item.name}>
            <div class="faultBox-left">
              <span class="faultBox-data" style={{ backgroundColor: item.color }}></span>
              <span class="faultBox-value"> {item.name}</span>
            </div>
            <div class="faultBox-right">
              {" "}
              <CountTo startVal={0} endVal={item.value} duration={2000} separator />
            </div>
          </div>
        ))}
      </>
    );
  },
});

export default FaultBox;
