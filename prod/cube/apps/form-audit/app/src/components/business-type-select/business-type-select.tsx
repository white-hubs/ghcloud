import { defineComponent, onMounted, ref, watch } from "vue";

import type { WorkOrderBusinessTypeModel } from "@ghcloud/cube-form-audit-service";
import { Select } from "@ghcloud/cube-ui";

import { cubeFormAuditService } from "@/api/service";
import { getCurrentApplicationCode } from "@/utils/current-application";

export interface Props {
  value: string | undefined;
}
export const BusinessTypeSelect = defineComponent({
  props: ["value"],
  emits: ["update:value"],
  setup(props: Props, { emit }) {
    const businessType = ref(props.value ?? []);
    const businessTypeList = ref<WorkOrderBusinessTypeModel[]>([]);
    watch(
      () => props.value,
      (newValue) => {
        businessType.value = newValue ?? [];
      },
      { deep: true, immediate: true },
    );
    const getFeatureOptions = async (): Promise<void> => {
      const result = await cubeFormAuditService.getWorkOrderBusinessTypeList({ application: getCurrentApplicationCode() });
      businessTypeList.value = result;
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
        placeholder="请选择工单类型"
        onChange={() => emit("update:value", businessType.value)}
        fieldNames={{
          label: "name",
          value: "code",
        }}
      />
    );
  },
});
