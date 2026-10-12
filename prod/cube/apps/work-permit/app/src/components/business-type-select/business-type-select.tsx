import { defineComponent, onMounted, ref, watch } from "vue";

import type { WorkOrderBusinessTypeModel } from "@ghcloud/cube-service-interface/process-engine";
import { getWorkOrderBusinessTypeList } from "@ghcloud/cube-services-client/process-engine.client";
import { Select } from "@ghcloud/cube-ui";

import { getCurrentApplicationCode } from "@/utils/current-application";

interface BusinessTypeOption {
  label: string;
  value: string;
}

export const BusinessTypeSelect = defineComponent({
  name: "BusinessTypeSelect",
  props: {
    value: {
      type: String,
      default: undefined,
    },
  },
  emits: ["update:value"],
  setup: (props, { emit }) => {
    const businessType = ref<string | undefined>(props.value);
    const businessTypeList = ref<BusinessTypeOption[]>([]);

    watch(
      () => props.value,
      (newValue) => {
        businessType.value = newValue;
      },
      { immediate: true },
    );

    const getOptions = async (): Promise<void> => {
      const result = await getWorkOrderBusinessTypeList({ application: getCurrentApplicationCode() });
      businessTypeList.value = result
        .map((item: WorkOrderBusinessTypeModel) => ({
          label: item.businessTypeName,
          value: item.businessType,
        }))
        .filter((item) => item.label && item.value);
    };

    onMounted(() => {
      void getOptions();
    });

    return (): JSX.Element => (
      <Select
        allowClear
        showSearch
        v-model:value={businessType.value}
        options={businessTypeList.value}
        placeholder="请选择作业类型"
        onChange={() => emit("update:value", businessType.value)}
      />
    );
  },
});
