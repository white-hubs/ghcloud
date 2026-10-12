import { cubeWorkOrderCenterService } from '@/api/service'
import type { WorkOrderBusinessTypeModel } from '@ghcloud/cube-work-order-center-service'
import { Select } from '@ghcloud/cube-ui'
import { defineComponent, onMounted, ref, watch } from 'vue';

export interface Props {
  value: string | undefined;
}
export const BusinessTypeSelect = defineComponent({
  props: ['value'],
  emits: ['update:value'],
  setup (props: Props, { emit }) {
    const businessType = ref(props.value ?? []);
    const businessTypeList = ref<WorkOrderBusinessTypeModel[]>([])
    watch(() => props.value, (newValue) => {
      businessType.value = newValue ?? []
    }, { deep: true, immediate: true })
    const getFeatureOptions = async (): Promise<void> => {
      const result = await cubeWorkOrderCenterService.getWorkOrderBusinessTypeList()
      businessTypeList.value = result
    };
    onMounted(() => {
      getFeatureOptions();
    });
    return (): JSX.Element => (
      <Select
        allowClear
        showSearch
        v-model:value={businessType.value}
        options={businessTypeList.value}
        placeholder='请选择工单类型'
        onChange={() => emit('update:value', businessType.value)}
        fieldNames={{
          label: 'name',
          value: 'code'
        }}
      />
    );
  },
});