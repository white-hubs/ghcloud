import { defineComponent } from "vue";
import { ref } from "vue";

import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { eventNameStat } from "@/infrastructure/api/door";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";
import EventAlarmItem from "@/shared-ui/panel/eventAlarmItem";
import noData from "@/shared-ui/panel/noData";
import { ModelValueItf } from "@/shared-ui/panel/types";

export const SmartAccessEventsTop10 = defineComponent({
  name: "SmartAccessEventsTop10",
  setup(_props, ctx) {
    const handleTime = ref<ModelValueItf>();
    const areaAlarmRank = ref([]);

    const getPassengerFlowRegions = async () => {
      const res = await eventNameStat({ period: handleTime.value.dateRange.join(",") });
      areaAlarmRank.value = res;
    };

    return (): JSX.Element => (
      <>
        <SubPanelTemplate title="门禁事件Top10">
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

export default SmartAccessEventsTop10;
