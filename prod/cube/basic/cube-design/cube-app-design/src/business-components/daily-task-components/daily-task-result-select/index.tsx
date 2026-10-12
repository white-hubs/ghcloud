import { cubeDailyTaskService } from "../../../api/service";
import { getCurrentDailyType, type TaskResultModel } from "@ghcloud/cube-daily-task-service";
import { Select } from "@ghcloud/cube-ui";
import { defineComponent, onMounted, ref } from "vue";

/** 巡检结果下拉框 */
interface Props {
  value: string;
  mode?: string;
  width?: string;
  enable?: boolean;
}
export const DailyTaskResultSelect = defineComponent({
  props: ["value", "width", "mode", "enable"],
  emits: ["update:value", "change"],
  setup: (props: Props, { emit }) => {
    const options = ref<TaskResultModel[]>([]);
    const getData = async (): Promise<void> => {
      cubeDailyTaskService
        .getDailyTaskResultPage({
          pageSize: 1000,
          pageNumber: 1,
          dailyType: getCurrentDailyType(),
          enable: props.enable ?? undefined,
        })
        .then((res) => {
          options.value = res?.records || [];
          const selectValue = options.value.find((e) => e.id === props.value);
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
          placeholder="请选择结果"
          style={{ width: props.width }}
          fieldNames={{ label: "name", value: "id" }}
          onUpdate:value={(value) => {
            emit("update:value", value);
          }}
          onChange={(value: unknown) => {
            emit(
              "change",
              value,
              options.value.find((e) => e.id === value),
            );
          }}
          mode={props.mode ?? ""}
          allowClear
        />
      </>
    );
  },
});
