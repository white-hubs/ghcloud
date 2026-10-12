import { defineComponent } from "vue";
import { ref } from "vue";

import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { popularVideos } from "@/infrastructure/api/securitymanagement";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";
import EventAlarmItem from "@/shared-ui/panel/eventAlarmItem";
import noData from "@/shared-ui/panel/noData";
import { ModelValueItf } from "@/shared-ui/panel/types";

export const PopularVideos = defineComponent({
  name: "PopularVideos",
  setup(_props, ctx) {
    const handleTime = ref<ModelValueItf>({
      timeType: "TODAY",
      dateRange: [],
    });
    const areaAlarmRank = ref<any[]>([]);

    const areaAlarmStatistic = async () => {
      let param = {
        period: handleTime.value.dateRange.join(","),
        type: handleTime.value.timeType,
      };
      areaAlarmRank.value = await popularVideos(param);
    };

    return (): JSX.Element => (
      <>
        <SubPanelTemplate title="最受欢迎视频Top10" class="alarm-event">
          <template>
            {" "}
            <DateInlineForm
              modelValue={handleTime.value}
              onUpdate:modelValue={(v) => {
                handleTime.value = v;
              }}
              onSearch={areaAlarmStatistic}
            ></DateInlineForm>
          </template>
          <div class="body" style="min-height: 250px">
            {areaAlarmRank.map((item, index) => (
              <EventAlarmItem sn={false} sort={index + 1} name={item.name} count={item.num} key={index} />
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

export default PopularVideos;
