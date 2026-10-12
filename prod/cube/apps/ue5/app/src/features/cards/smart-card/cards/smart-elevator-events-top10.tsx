import { defineComponent } from "vue";
import { ref } from "vue";

import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { accessNameStat } from "@/infrastructure/api/door";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";
import EventAlarmItem from "@/shared-ui/panel/eventAlarmItem";
import noData from "@/shared-ui/panel/noData";
import { ModelValueItf } from "@/shared-ui/panel/types";

export const SmartElevatorEventsTop10 = defineComponent({
  name: "SmartElevatorEventsTop10",
  setup(_props, ctx) {
    const handleTime = ref<ModelValueItf>();
    const areaAlarmRank = ref([]);

    const getPassengerFlowRegions = async () => {
      areaAlarmRank.value = await accessNameStat({ period: handleTime.value.dateRange.join(","), accessType: "TK" });
    };

    return (): JSX.Element => (
      <>
        <SubPanelTemplate title="梯控事件Top10">
          <template>
            {" "}
            <DateInlineForm
              modelValue={handleTime.value}
              onUpdate:modelValue={(v) => {
                handleTime.value = v;
              }}
              onSearch={getPassengerFlowRegions}
            ></DateInlineForm>
          </template>
          <div class="body" style="min-height: 250px">
            {areaAlarmRank.map((item, index) => (
              <EventAlarmItem sn={false} sort={index + 1} name={item.name} count={item.value} />
            ))}
          </div>
          <div class="body" style="min-height: 250px">
            {" "}
            <noData></noData>
          </div>
        </SubPanelTemplate>
      </>
    );
  },
});

export default SmartElevatorEventsTop10;
