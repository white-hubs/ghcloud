import { defineComponent } from "vue";
import { ref, reactive, onMounted } from "vue";

import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { personLocationTop } from "@/infrastructure/api/door";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";
import EventAlarmItem from "@/shared-ui/panel/eventAlarmItem";
import { ModelValueItf } from "@/shared-ui/panel/types";

export const RankingListPatrolPoints = defineComponent({
  name: "RankingListPatrolPoints",
  setup(_props, ctx) {
    const intercomTime = ref<ModelValueItf>();
    const intercomRank = ref([]);
    const getIntercomEvent = async () => {
      intercomRank.value = await personLocationTop({ period: intercomTime.value.dateRange.join(",") });
    };

    return (): JSX.Element => (
      <>
        <SubPanelTemplate title="巡更人员点位排行Top10">
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
              <EventAlarmItem sn={false} sort={index + 1} name={item.key} count={item.value} />
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

export default RankingListPatrolPoints;
