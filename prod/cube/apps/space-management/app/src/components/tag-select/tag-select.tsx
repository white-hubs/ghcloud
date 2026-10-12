import { cubeMdataService } from '@/api/service'
import { defineComponent, onMounted, ref, watch } from 'vue';
import type { ListVO } from '@ghcloud/cube-mdata-service/src/type'
import { Select } from '@ghcloud/cube-ui'

export interface Props {
  value: string | string[] | undefined;
  isSingle: boolean;
}
export const TagSelect = defineComponent({
  props: ['value', 'isSingle'],
  emits: ['update:value'],
  setup (props: Props, { emit }) {
    const tag = ref(props.value ?? []);
    const tagOptions = ref<ListVO[]>([])
    watch(() => props.value, (newValue) => {
      tag.value = newValue ?? []
    }, { deep: true, immediate: true })
    const getTagOptions = async (): Promise<void> => {
      const res = await cubeMdataService.getAreaTagList()
      tagOptions.value = (res ?? [])?.map(e => {
        return {
          label: e.name ?? e.value ?? '',
          value: e.id ?? e.key ?? ''
        }
      })
    };
    onMounted(() => {
      getTagOptions();
    });
    return (): JSX.Element => (
      <Select
        v-model:value={tag.value}
        mode={props.isSingle ? '' : 'multiple' }
        showSearch
        optionFilterProp='name'
        options={tagOptions.value}
        placeholder='请选择标签'
        allowClear
        onChange={() => emit('update:value', tag.value)}
        getPopupContainer={(e: { parentNode: unknown; }) => e.parentNode}
      />
    );
  },
});