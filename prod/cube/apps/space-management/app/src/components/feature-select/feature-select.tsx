import { cubeMdataService } from '@/api/service'
import type { ListVO } from '@ghcloud/cube-mdata-service/src/type'
import { Select } from '@ghcloud/cube-ui'
import { defineComponent, onMounted, ref, watch } from 'vue';

export interface Props {
  value: string | string[] | undefined;
  isSingle: boolean;
}
export const FeatureSelect = defineComponent({
  props: ['value', 'isSingle'],
  emits: ['update:value'],
  setup (props: Props, { emit }) {
    const feature = ref(props.value ?? []);
    const tagOptions = ref<ListVO[]>([])
    watch(() => props.value, (newValue) => {
      feature.value = newValue ?? []
    }, { deep: true, immediate: true })
    const getFeatureOptions = async (): Promise<void> => {
      const res = await cubeMdataService.getAreaFeatureList()
      tagOptions.value = (res ?? [])?.map(e => {
        return {
          label: e.name ?? e.value ?? '',
          value: e.id ?? e.key ?? ''
        }
      })
    };
    onMounted(() => {
      getFeatureOptions();
    });
    return (): JSX.Element => (
      <Select
        v-model:value={feature.value}
        mode={props.isSingle ? '' : 'multiple' }
        showSearch
        optionFilterProp='name'
        options={tagOptions.value}
        placeholder='请选择特征'
        allowClear
        onChange={() => emit('update:value', feature.value)}
        getPopupContainer={(e: { parentNode: unknown; }) => e.parentNode}
      />
    );
  },
});