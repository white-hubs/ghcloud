import { InputNumber, Select } from '@ghcloud/cube-ui'
import { defineComponent, reactive, watch } from 'vue';
import styles from './area-range.module.less'

export interface Props {
  value: {
    areaSymbol: string | undefined;
    areaNumber: number | undefined;
  };
}
export const AreaRange = defineComponent({
  props: ['value'],
  emits: ['update:value', 'change'],
  setup (props: Props, { emit }) {
    const rangeArea = reactive({
      areaSymbol: props.value?.areaSymbol ?? undefined,
      value: props.value?.areaNumber ?? '',
    });
    watch(() => props.value, (newValue) => {
      Object.assign(rangeArea, newValue ?? {
        areaSymbol: undefined,
        value: '',
      })
    }, { deep: true, immediate: true })
    const areaSymbolOptions = [
      {
        label: '小于',
        value: 'LT',
      },
      {
        label: '小于等于',
        value: 'LE',
      },
      {
        label: '等于',
        value: 'EQ',
      },
      {
        label: '大于',
        value: 'GT',
      },
      {
        label: '大于等于',
        value: 'GE',
      },
    ];
    const handleChange = (): void => {
      emit('update:value', rangeArea);
      emit('change', rangeArea);
    };
    return (): JSX.Element => (
      <div class={styles.areaRange}>
        <Select class={styles.areaSymbol} options={areaSymbolOptions} v-model:value={rangeArea.areaSymbol} placeholder='条件' onChange={handleChange} allowClear />
        <InputNumber class={styles.value} v-model:value={rangeArea.value} placeholder='面积' onChange={handleChange} />
        m²
      </div>
    );
  },
});