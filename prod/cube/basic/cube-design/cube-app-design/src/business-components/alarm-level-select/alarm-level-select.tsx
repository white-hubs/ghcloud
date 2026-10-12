import { cubeAlarmCenterService } from "../../api/service";
import { AlarmLevel } from "@ghcloud/cube-alarm-center-service/src/types/alarm-center";
import { Select } from "@ghcloud/cube-ui";
import { defineComponent, ref } from "vue";

export const AlarmLevelSelect = defineComponent({
  props: ["value", "placeholder", "fieldNames"],
  emits: ["update:value", "change"],
  setup: (props, { emit }) => {
    const alarmLevelList = ref<AlarmLevel[]>([]);
    const getAlarmLevelOptions = async (): Promise<void> => {
      alarmLevelList.value = await cubeAlarmCenterService.getSatAlarmLevels();
    };
    getAlarmLevelOptions();

    return () => (
      <Select
        placeholder={props.placeholder}
        value={props.value}
        options={alarmLevelList.value}
        style={{ width: "100%" }}
        allowClear
        fieldNames={props.fieldNames ? props.fieldNames : { label: "name", value: "id" }}
        onUpdate:value={(value: string) => {
          emit("update:value", value);
          emit("change", value);
        }}
      />
    );
  },
});
