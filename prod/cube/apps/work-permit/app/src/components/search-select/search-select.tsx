import { computed, defineComponent, ref, watch, type PropType } from "vue";

import { Select } from "@ghcloud/cube-ui";

interface OptionType {
  label: string | number;
  value: string | number;
  disabled?: boolean;
}

export const SearchSelect = defineComponent({
  name: "SearchSelect",
  props: {
    ...Select.props,
    options: {
      type: Array as PropType<OptionType[]>,
      default: () => [],
    },
    allowCustomValue: {
      type: Boolean,
      default: true,
    },
    allowClear: {
      type: Boolean,
      default: true,
    },
    value: {
      type: [String, Number, Array],
      default: undefined,
    },
    onChange: {
      type: Function as PropType<(value: unknown, option: unknown) => void>,
      default: undefined,
    },
    placeholder: {
      type: String,
      default: "请选择",
    },
  },
  setup: (props, { attrs, slots, emit }) => {
    const innerValue = ref(props.value);
    const searchText = ref("");

    watch(
      () => props.value,
      (newValue) => {
        innerValue.value = newValue;
      },
    );

    const mergedOptions = computed(() => {
      if (!props.allowCustomValue || !searchText.value) {
        return props.options;
      }

      const hasMatchingOption = props.options.some(
        (option) =>
          String(option.label).toLowerCase() === searchText.value.toLowerCase() ||
          String(option.value).toLowerCase() === searchText.value.toLowerCase(),
      );

      if (hasMatchingOption) {
        return props.options;
      }

      return [...props.options, { label: searchText.value, value: searchText.value }];
    });

    const handleChange = (value: unknown, option: unknown): void => {
      innerValue.value = value as string | number | unknown[] | undefined;
      emit("update:value", value);
      props.onChange?.(value, option);
    };

    const handleSearch = (text: string): void => {
      searchText.value = text;
    };

    const filterOption = (input: string, option: OptionType): boolean => {
      const optionLabel = String(option.label || "").toLowerCase();
      const optionValue = String(option.value || "").toLowerCase();
      const searchValue = input.toLowerCase();
      return optionLabel.includes(searchValue) || optionValue.includes(searchValue);
    };

    return (): JSX.Element => (
      <Select
        {...attrs}
        allowClear={props.allowClear}
        value={innerValue.value}
        options={mergedOptions.value}
        onChange={handleChange}
        onSearch={handleSearch}
        filterOption={filterOption}
        showSearch
        placeholder={props.placeholder}
        v-slots={slots}
      />
    );
  },
});
