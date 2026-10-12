import { computed, defineComponent, type PropType } from "vue";

import type { GrainWarehouseOption } from "@ghcloud/cube-service-interface/intelligent-grain";
import { Select } from "@ghcloud/cube-ui";

export const IntelligentGrainWarehouseSelector = defineComponent({
  name: "IntelligentGrainWarehouseSelector",
  props: {
    value: {
      type: String,
      default: undefined,
    },
    options: {
      type: Array as PropType<GrainWarehouseOption[]>,
      default: () => [],
    },
    loading: {
      type: Boolean,
      default: false,
    },
  },
  emits: ["change"],
  setup: (props, { emit }) => {
    const selectOptions = computed(() =>
      props.options.map((item) => ({
        label: `${item.warehouseName}${item.areaName ? ` · ${item.areaName}` : ""}${item.grainType ? ` · ${item.grainType}` : ""}`,
        value: item.warehouseId,
      })),
    );

    return (): JSX.Element => (
      <Select
        value={props.value}
        options={selectOptions.value}
        loading={props.loading}
        showSearch
        filterOption={(input: string, option: { label?: string }) => (option.label ?? "").toLowerCase().includes(input.toLowerCase())}
        placeholder="搜索或选择仓房"
        style={{ width: "320px" }}
        onChange={(value: string) => emit("change", value)}
      />
    );
  },
});
