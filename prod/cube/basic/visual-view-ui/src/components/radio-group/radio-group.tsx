import { NRadioGroup, NRadio } from "naive-ui";
import { type PropType, defineComponent, computed, ref, watch } from "vue";
interface RadioGroupChildOption {
  label: string;
  value: string | boolean;
}
type valueType = string | boolean;
interface Props {
  options: RadioGroupChildOption[];
  vertical: boolean;
  value?: valueType;
  readonly?: boolean;
  checked?: boolean;
}

export default defineComponent({
  props: {
    options: {
      type: Array as PropType<RadioGroupChildOption[]>,
      default: () => [],
    },
    vertical: {
      type: Boolean,
      default: false,
    },
    value: {
      type: String || Boolean,
      default: null,
    },
    readonly: {
      type: Boolean,
      default: false,
    },
    checked: {
      type: Boolean,
      default: false,
    },
  },
  emits: ["update:value", "change"],
  setup(props: Props, { slots, emit }) {
    const radioStyle = computed(() => {
      if (props.vertical) {
        return {
          display: "flex",
          height: "30px",
          lineHeight: "30px",
        };
      }
      return {};
    });
    const value = ref(props.value);
    watch(
      () => value.value,
      () => {
        emit("update:value", value.value);
        emit("change", value.value);
      },
    );
    watch(
      () => props.value,
      () => {
        value.value = props.value;
      },
    );
    return () => (
      <NRadioGroup v-model:value={value.value} disabled={props.readonly ?? false}>
        {props.options.length > 0
          ? props.options?.map((e, i) => (
              <NRadio value={e.value} key={i} style={radioStyle.value} checked={props.checked}>
                {e.label}
              </NRadio>
            ))
          : slots.default?.()}
      </NRadioGroup>
    );
  },
});
