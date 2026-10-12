import { defineComponent } from "vue";
import "./custom-radio.less";
const frame1 = "/resource/v1/visual-low-code/frame-1.png";
export const CustomRadio = defineComponent({
  props: {
    options: {
      type: Array,
      default: [],
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    value: {
      type: String,
      default: "",
    },
  },
  emits: ["change", "update:value"],
  setup: (props, { emit }) => {
    const handleChange = (val: string): void => {
      if (props.disabled) return;
      emit("update:value", val);
      emit("change", val);
    };
    return () => (
      <>
        <div class={["custom-radio", props.disabled && "disabled"]}>
          <div
            class={["option", props.value === "empty" && "checked"]}
            onClick={() => {
              handleChange("empty");
            }}
          >
            空白
          </div>
          <div
            class={["option", props.value === "init-first" && "checked"]}
            onClick={() => {
              handleChange("init-first");
            }}
          >
            <img src={frame1} alt="" srcset="" />
          </div>
        </div>
      </>
    );
  },
});
