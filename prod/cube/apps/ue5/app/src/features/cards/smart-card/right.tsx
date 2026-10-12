import { defineComponent } from "vue";
import { ref, reactive, onMounted } from "vue";

import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { accessNameStat } from "@/infrastructure/api/door";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";
import EventAlarmItem from "@/shared-ui/panel/eventAlarmItem";
import noData from "@/shared-ui/panel/noData";
import { ModelValueItf } from "@/shared-ui/panel/types";

export const Right = defineComponent({
  name: "Right",
  setup(_props, ctx) {
    const handleTime = ref<ModelValueItf>();
    const intercomTime = ref<ModelValueItf>();
    const areaAlarmRank = ref([]);
    const intercomRank = ref([]);
    const getPassengerFlowRegions = async () => {
      areaAlarmRank.value = await accessNameStat({ period: handleTime.value.dateRange.join(","), accessType: "TK" });
    };
    const getIntercomEvent = async () => {
      intercomRank.value = await accessNameStat({ period: intercomTime.value.dateRange.join(","), accessType: "KSDJ" });
    };

    return (): JSX.Element => (
      <>
        <div>
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
          <SubPanelTemplate title="可视对讲事件Top10">
            <template>
              {" "}
              <DateInlineForm
                modelValue={intercomTime.value}
                onUpdate:modelValue={(v) => {
                  intercomTime.value = v;
                }}
                onSearch={getIntercomEvent}
              ></DateInlineForm>
            </template>
            <div class="body" style="min-height: 250px">
              {intercomRank.map((item, index) => (
                <EventAlarmItem sn={false} sort={index + 1} name={item.name} count={item.value} />
              ))}
            </div>
            <div class="body" style="min-height: 250px">
              {" "}
              <noData></noData>
            </div>
          </SubPanelTemplate>
        </div>
      </>
    );
  },
});

export default Right;
