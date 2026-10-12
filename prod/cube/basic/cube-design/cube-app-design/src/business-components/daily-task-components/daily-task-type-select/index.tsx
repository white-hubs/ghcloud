import { cubeDailyTaskService } from "../../../api/service";
import { getCurrentDailyType, type TaskCategoryModel } from "@ghcloud/cube-daily-task-service";
import { Select } from "@ghcloud/cube-ui";
import { defineComponent, onMounted, ref } from "vue";

/** 任务类型下拉框 */
interface Props {
  value: string | string[] | undefined;
  width?: string;
  placeholder?: string;
  multiple?: boolean;
}
export const DailyTaskTypeSelect = defineComponent({
  props: ["value", "width", "placeholder", "multiple"],
  emits: ["update:value", "change"],
  setup: (props: Props, { emit }) => {
    const options = ref<TaskCategoryModel[]>([]);
    const getData = async (): Promise<void> => {
      cubeDailyTaskService
        .getTaskCategoryPage({
          pageSize: 1000,
          pageNumber: 1,
          dailyType: getCurrentDailyType(),
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
          placeholder={props.placeholder ?? "请选择类型"}
          style={{ width: props.width ?? "100%" }}
          fieldNames={{ label: "name", value: "id" }}
          onUpdate:value={(value) => {
            emit("update:value", value);
          }}
          onChange={(value: unknown, option: unknown) => {
            emit("change", value, option);
          }}
          mode={(props.multiple ?? false) ? "multiple" : undefined}
          allowClear
        />
      </>
    );
  },
});
