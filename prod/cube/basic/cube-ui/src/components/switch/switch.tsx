import { Switch as ASwitch } from "ant-design-vue";
import { defineComponent, ref, watch } from "vue";
type SwitchValue = boolean | string | number | null | undefined;
interface Props {
  value?: SwitchValue;
  checkedChildren?: string;
  unCheckedChildren?: string;
  loading?: boolean;
  checked?: boolean;
  checkedValue?: SwitchValue;
  unCheckedValue?: SwitchValue;
  disabled?: boolean;
}

export const Switch = defineComponent({
  emits: ["update:value", "update:checked", "change"],
  props: ["value", "checked", "checkedChildren", "unCheckedChildren", "checkedValue", "unCheckedValue", "loading", "disabled"],
  setup(props: Props, { emit, attrs }) {
    const getCheckedValue = (): SwitchValue => props.checkedValue ?? true;
    const getUnCheckedValue = (): SwitchValue => props.unCheckedValue ?? false;
    const resolveChecked = (): boolean => {
      if (typeof props.checked === "boolean") {
        return props.checked;
      }
      if (props.checkedValue !== undefined) {
        return props.value === props.checkedValue;
      }
      return Boolean(props.value);
    };
    const checked = ref(resolveChecked());
    watch(
      () => [props.value, props.checked, props.checkedValue],
      () => {
        checked.value = resolveChecked();
      },
    );
    const onchange = (val: boolean): void => {
      checked.value = val;
      const nextValue = val ? getCheckedValue() : getUnCheckedValue();
      emit("update:value", nextValue);
      emit("update:checked", val);
      emit("change", nextValue);
    };

    return (): JSX.Element => (
      <ASwitch
        {...attrs}
        checked={checked.value}
        checkedChildren={props.checkedChildren}
        unCheckedChildren={props.unCheckedChildren}
        loading={props.loading}
        disabled={props.disabled}
        onChange={onchange}
      />
    );
  },
});
