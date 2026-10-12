import { defineComponent, ref, watch, computed, type PropType } from 'vue';
import { Select } from 'ant-design-vue';

interface OptionType {
  label: string | number;
  value: string | number;
  disabled?: boolean;
}

export const SearchSelect = defineComponent({
  props: {
    // 继承 Select 组件的属性
    ...Select.props,
    // 选项数据
    options: {
      type: Array as PropType<OptionType[]>,
      default: () => []
    },
    // 是否允许自定义值
    allowCustomValue: {
      type: Boolean,
      default: true
    },
    allowClear: {
      type: Boolean,
      default: true,
    },
    // 默认值
    value: {
      type: [String, Number, Array],
      default: undefined
    },
    // 选择事件
    onChange: {
      type: Function as PropType<(value: any, option: any) => void>,
      default: undefined
    },
    // 占位符
    placeholder: {
      type: String,
      default: '请选择'
    }
  },
  setup(props, { attrs, slots, emit }) {
    // 内部值状态
    const innerValue = ref(props.value);
    // 搜索文本
    const searchText = ref('');
    
    // 监听外部值变化
    watch(
      () => props.value,
      (newVal) => {
        innerValue.value = newVal;
      }
    );
    
    // 合并选项，如果允许自定义值且有搜索文本但没有匹配项，则添加自定义选项
    const mergedOptions = computed(() => {
      if (!props.allowCustomValue || !searchText.value) {
        return props.options;
      }
      
      // 检查是否已有匹配的选项
      const hasMatchingOption = props.options.some(
        (option: OptionType) => 
          String(option.label).toLowerCase() === searchText.value.toLowerCase() ||
          String(option.value).toLowerCase() === searchText.value.toLowerCase()
      );
      
      // 如果没有匹配项，添加自定义选项
      if (!hasMatchingOption) {
        return [...props.options, { label: searchText.value, value: searchText.value }];
      }
      
      return props.options;
    });
    
    // 处理选择变化
    const handleChange = (value: any, option: any) => {
      innerValue.value = value;
      emit('update:value', value);
      if (props.onChange) {
        props.onChange(value, option);
      }
    };
    
    // 处理搜索文本变化
    const handleSearch = (text: string) => {
      searchText.value = text;
    };
    
    // 过滤选项
    const filterOption = (input: string, option: any) => {
      const optionLabel = String(option.label || '').toLowerCase();
      const optionValue = String(option.value || '').toLowerCase();
      const searchValue = input.toLowerCase();
      
      return optionLabel.includes(searchValue) || optionValue.includes(searchValue);
    };
    
    return () => (
      <Select
        {...attrs}
        allowClear={props.allowClear}
        value={innerValue.value}
        options={mergedOptions.value}
        onChange={handleChange}
        onSearch={handleSearch}
        filterOption={filterOption}
        showSearch={true}
        placeholder={props.placeholder}
        v-slots={slots}
      />
    );
  }
});