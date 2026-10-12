import { defineComponent, onMounted, ref, watch } from "vue";

import type { FormGroupTypeVO } from "@ghcloud/cube-service-interface/process-engine";
import { getFormFlowGroupList } from "@ghcloud/cube-services-client/process-engine.client";
import { Select } from "@ghcloud/cube-ui";

import { getCurrentApplicationCode } from "@/utils/current-application";

export const FormGroupSelect = defineComponent({
  name: "FormGroupSelect",
  props: {
    value: {
      type: String,
      default: undefined,
    },
  },
  emits: ["update:value"],
  setup: (props, { emit }) => {
    const formGroupId = ref<string | undefined>(props.value);
    const formGroupList = ref<FormGroupTypeVO[]>([]);

    watch(
      () => props.value,
      (newValue) => {
        formGroupId.value = newValue;
      },
      { immediate: true },
    );

    const getOptions = async (): Promise<void> => {
      formGroupList.value = await getFormFlowGroupList({ application: getCurrentApplicationCode() });
    };

    onMounted(() => {
      void getOptions();
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
