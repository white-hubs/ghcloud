import { defineComponent } from "vue";
import { ref, reactive, onMounted } from "vue";

import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { patrolLocationTop } from "@/infrastructure/api/door";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";
import noData from "@/shared-ui/panel/noData";

import styles from "./rankingPatrolPersonnel.module.less";

export const RankingPatrolPersonnel = defineComponent({
  name: "RankingPatrolPersonnel",
  setup(_props, ctx) {
    const intercomRank = ref([]);
    const intercomTime = ref();
    const getIntercomEvent = async () => {
      intercomRank.value = await patrolLocationTop({ period: intercomTime.value.dateRange.join(",") });
    };

    return (): JSX.Element => (
      <>
        <SubPanelTemplate title="巡更点位排行榜Top10">
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
          <div class="box-body">
            {intercomRank.map((item, index) => (
              <EventAlarmItem sn={false} sort={index + 1} name={item.key} count={item.value} />
            ))}
          </div>
          <div class="box-body">
            {" "}
            <noData></noData>
          </div>
        </SubPanelTemplate>
      </>
    );
  },
});

export default RankingPatrolPersonnel;
