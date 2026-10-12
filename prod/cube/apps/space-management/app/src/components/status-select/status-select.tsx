import { cubeMdataService } from '@/api/service'
import type { ListVO } from '@ghcloud/cube-mdata-service/src/type'
import { Select } from '@ghcloud/cube-ui'
import { defineComponent, onMounted, ref, watch } from 'vue';

export interface Props {
  value: string | string[] | undefined;
}
export const StatusSelect = defineComponent({
  props: ['value'],
  emits: ['update:value'],
  setup (props: Props, { emit }) {
    const status = ref(props.value);
    const statusOptions = ref<ListVO[]>([])
    watch(() => props.value, (newValue) => {
      status.value = newValue ?? undefined
    }, { deep: true, immediate: true })
    const getStatusOptions = async (): Promise<void> => {
      const res = await cubeMdataService.getAreaStatusList()
      statusOptions.value = (res ?? [])?.map(e => {
        return {
          label: e.name ?? e.value ?? '',
          value: e.id ?? e.key ?? ''
        }
      })
    };
    onMounted(() => {
      getStatusOptions();
    });
    return (): JSX.Element => (
      <Select
        v-model:value={status.value}
        showSearch
        optionFilterProp='name'
        options={statusOptions.value}
        placeholder='请选择状态'
        allowClear
        onChange={() => emit('update:value', status.value)}
        getPopupContainer={(e: { parentNode: unknown; }) => e.parentNode}
      />
    );
  },
});