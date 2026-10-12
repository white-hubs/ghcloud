import { defineComponent, onMounted, ref, watch } from "vue";

import type { FormGroupTypeVO } from "@ghcloud/cube-approval-center-service";
import { Select } from "@ghcloud/cube-ui";

import { cubeApprovalCenterService } from "@/api/service";
import { getCurrentApplicationCode } from "@/utils/current-application";

export interface Props {
  value: string | undefined;
  applicationCode?: string;
}
export const FormGroupSelect = defineComponent({
  props: ["value"],
  emits: ["update:value"],
  setup(props: Props, { emit }) {
    const formGroupId = ref<string | undefined>(props.value);
    const formGroupList = ref<FormGroupTypeVO[]>([]);
    watch(
      () => props.value,
      (newValue) => {
        formGroupId.value = newValue;
      },
      { immediate: true },
    );
    const getFormGroupOptions = async (): Promise<void> => {
      const result = await cubeApprovalCenterService.getFormFlowGroupList({ application: getCurrentApplicationCode() });
      formGroupList.value = result;
    };
    onMounted(() => {
      getFormGroupOptions();
    });
    return (): JSX.Element => (
      <Select
        allowClear
        showSearch
        v-model:value={formGroupId.value}
        options={formGroupList.value}
        placeholder="请选择表单分组"
        onChange={() => emit("update:value", formGroupId.value)}
        fieldNames={{
          label: "name",
          value: "id",
        }}
      />
    );
  },
});
