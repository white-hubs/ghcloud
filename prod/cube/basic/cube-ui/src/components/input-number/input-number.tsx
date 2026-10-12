import { InputNumber } from "ant-design-vue/es";
import type { SizeType } from "ant-design-vue/es/config-provider";
import "./input-number.less";
import type { ValueType } from "ant-design-vue/es/input-number/src/utils/MiniDecimal";
import { type PropType, defineComponent } from "vue";

type Status = "error" | "warning" | "";
interface Props {
  name?: string;
  placeholder?: string;
  size?: SizeType;
  disabled?: boolean;
  readonly?: boolean;
  stringMode?: boolean;
  allowClear?: boolean;
  precision?: number;
  maxlength?: number;
  showCount?: boolean;
  bordered?: boolean;
  value?: number;
  status?: Status;
}
export default defineComponent({
  emits: ["change", "pressEnter", "blur"],
  props: {
    status: {
      type: String as PropType<Status>,
      default: '',
    },
    placeholder: {
      type: String,
      default: "请输入数字",
    },
    min: {
      type: Number,
      default: 0,
    },
    step: {
      type: Number,
      default: 1,
    },
    max: {
      type: Number,
      default: 999999999999999,
    },
    precision: {
      type: Number,
      default: 0,
    },
    allowClear: {
      type: Boolean,
      default: true,
    },
    readonly: {
      type: Boolean,
      default: false,
    },
    bordered: {
      type: Boolean,
      default: true,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    stringMode: {
      type: Boolean,
      default: false,
    },
  },
  setup(props: Props, { emit }) {
    const onchange = (value: ValueType): void => {
      emit("change", value);
    };
    const onPressEnter = (): void => {
      emit("pressEnter");
    };
    const onBlur = (): void => {
      emit("blur");
    };
    return (): JSX.Element => (
      <InputNumber
        {...props}
        class="cube-input-number"
        onBlur={onBlur}
        v-model={props.value}
        onPressEnter={onPressEnter}
        onChange={onchange}
      />
    );
  },
});
