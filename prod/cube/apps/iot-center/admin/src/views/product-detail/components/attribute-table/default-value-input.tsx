import { isSelectType, isIntegerType, isFloatType } from "@/constants/data-type";
import type { ProductProp } from "@ghcloud/cube-iot-center-service";
import { Select, Input, InputNumber } from "@ghcloud/cube-ui";
import { computed, defineComponent, ref, type PropType, watch } from "vue";

interface Props {
  value?: string | number | unknown[] | undefined;
  propertyOption: ProductProp;
  onChange?: (value: string) => void;
  maxValue?: number;
  minValue?: number;
  precision?: number;
  disabled?: boolean;
}

const DEFAULT_MAX_VALUE = 999999999999999;
const DEFAULT_MIN_VALUE = 0;
const DEFAULT_PRECISION = 2;
const UNIT_MARGIN_LEFT = "8px";

/** 默认值输入组件 */
export const DefaultValueInput = defineComponent({
  name: "DefaultValueInput",
  props: {
    value: {
      type: [String, Number, Array] as PropType<string | number | unknown[]>,
      default: undefined,
    },
    propertyOption: {
      type: Object as PropType<ProductProp>,
      required: true,
    },
    onChange: {
      type: Function as PropType<(value: string) => void>,
      default: () => {},
    },
    maxValue: {
      type: Number,
      default: 999999999999999,
    },
    minValue: {
      type: Number,
      default: 0,
    },
    precision: {
      type: Number,
      default: 2,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  emits: ["update:value", "change"],
  setup(props: Props, { emit }) {
    const unitName = computed(() => props.propertyOption.unitName?.replace("-", "") ?? "");

    const options = computed(() => props.propertyOption.dataConstraint || []);

    // 使用 computed 确保 dataType 变化时组件会重新渲染
    const dataType = computed(() => props.propertyOption.dataType ?? "");

    const defaultValue = ref(props.value);

    // 监听 value 变化
    watch(
      () => props.value,
      () => {
        defaultValue.value = props.value;
      },
      { immediate: true },
    );

    // 监听 dataType 变化，当数据类型改变时清空默认值
    watch(
      () => dataType.value,
      (newDataType, oldDataType) => {
        if (oldDataType && newDataType !== oldDataType) {
          defaultValue.value = undefined;
          handleChange();
        }
      },
    );

    const handleChange = (): void => {
      emit("update:value", defaultValue.value);
      emit("change", defaultValue.value);
      props.onChange?.(defaultValue.value as string);
    };

    /**
     * 渲染单位显示
     */
    const renderUnit = (): JSX.Element | null =>
      unitName.value ? <span style={{ marginLeft: UNIT_MARGIN_LEFT }}>{unitName.value}</span> : null;

    /**
     * 渲染输入容器
     */
    const renderInputWrapper = (input: JSX.Element): JSX.Element => (
      <div style={{ display: "flex", alignItems: "center" }}>
        {input}
        {renderUnit()}
      </div>
    );

    return (): JSX.Element => {
      const currentDataType = dataType.value;
      if (isSelectType(currentDataType)) {
        return renderInputWrapper(
          <Select
            v-model:value={defaultValue.value}
            options={options.value}
            placeholder="请选择默认值"
            onChange={handleChange}
            disabled={props.disabled || false}
            allowClear
            style={{ flex: 1 }}
          />,
        );
      }

      if (isIntegerType(currentDataType)) {
        return renderInputWrapper(
          <InputNumber
            v-model:value={defaultValue.value}
            placeholder="请输入整数值"
            onChange={handleChange}
            min={props.minValue ?? DEFAULT_MIN_VALUE}
            max={props.maxValue ?? DEFAULT_MAX_VALUE}
            precision={0}
            disabled={props.disabled || false}
            allowClear
            style={{ flex: 1 }}
          />,
        );
      }

      if (isFloatType(currentDataType)) {
        return renderInputWrapper(
          <InputNumber
            v-model:value={defaultValue.value}
            placeholder="请输入数值"
            onChange={handleChange}
            precision={props.propertyOption.precision ?? props.precision ?? DEFAULT_PRECISION}
            min={props.minValue ?? DEFAULT_MIN_VALUE}
            max={props.maxValue ?? DEFAULT_MAX_VALUE}
            disabled={props.disabled || false}
            allowClear
            style={{ flex: 1 }}
          />,
        );
      }

      return renderInputWrapper(
        <Input
          v-model:value={defaultValue.value}
          placeholder="请输入默认值"
          onChange={handleChange}
          maxLength={props.maxValue}
          showCount={false}
          disabled={props.disabled || false}
          allowClear
          style={{ flex: 1 }}
        />,
      );
    };
  },
});
