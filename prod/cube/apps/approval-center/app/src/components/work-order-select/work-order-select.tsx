import { defineComponent, onMounted, ref, watch } from "vue";

import type { CustomFormFlowTypeVO } from "@ghcloud/cube-approval-center-service";
import { Select } from "@ghcloud/cube-ui";

import { cubeApprovalCenterService } from "@/api/service";
import { getCurrentApplicationCode } from "@/utils/current-application";

export interface Props {
  value: string | undefined;
}

export const WorkOrderSelect = defineComponent({
  props: ["value"],
  emits: ["update:value"],
  setup(props: Props, { emit }) {
    const workOrder = ref(props.value ?? []);
    const workOrderList = ref<CustomFormFlowTypeVO[]>([]);
    watch(
      () => props.value,
      (newValue) => {
        workOrder.value = newValue ?? [];
      },
      { deep: true, immediate: true },
    );
    const getFeatureOptions = async (): Promise<void> => {
      const result = await cubeApprovalCenterService.getCustomFormFlowTypeList({ application: getCurrentApplicationCode() });
      workOrderList.value = result;
    };
    onMounted(() => {
      getFeatureOptions();
    });
    return (): JSX.Element => (
      <Select
        allowClear
        showSearch
        v-model:value={workOrder.value}
        options={workOrderList.value}
        placeholder="请选择工单"
        onChange={() => emit("update:value", workOrder.value)}
        fieldNames={{
          label: "businessTypeName",
          value: "businessType",
        }}
      />
    );
  },
});
