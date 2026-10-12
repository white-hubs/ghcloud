import { defineComponent, onMounted, ref } from "vue";

import type { InspectBusinessType, InspectResultItem } from "@ghcloud/cube-daily-inspection-service";
import { Select } from "@ghcloud/cube-ui";

import { cubeDailyInspectionService } from "../../../api/service";

/** 巡检结果下拉框 */
interface Props {
  value: string;
  mode?: string;
  width?: string;
  businessType?: InspectBusinessType;
  disabled?: boolean;
}
export const InspectResultSelect = defineComponent({
  props: ["value", "width", "mode", "businessType", "disabled"],
  emits: ["update:value", "change"],
  setup: (props: Props, { emit }) => {
    const options = ref<unknown[]>([]);
    const list = ref<InspectResultItem[]>([]);
    const getData = async (): Promise<void> => {
      cubeDailyInspectionService.getInspectResultList(props.businessType).then((res) => {
        options.value = res?.map((e) => {
          return {
            name: e.name,
            id: e.id,
          };
        });
        list.value = res;
        const selectValue = list.value.find((e) => e.id === props.value);
        emit("change", props.value, selectValue);
      });
    };
    onMounted(async () => {
      await getData();
    });
    return (): JSX.Element => (
      <>
        <Select
          v-model:value={props.value}
          options={options.value}
          placeholder="请选择巡检结果"
          style={{ width: props.width ?? "180px" }}
          fieldNames={{ label: "name", value: "id" }}
          onUpdate:value={(value) => {
            emit("update:value", value);
          }}
          onChange={(value: unknown) => {
            emit(
              "change",
              value,
              list.value.find((e) => e.id === value),
            );
          }}
          mode={props.mode ?? ""}
          disabled={props.disabled}
          allowClear
        />
      </>
    );
  },
});
