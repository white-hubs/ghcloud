import { defineComponent } from "vue";
import { ref, reactive, onMounted } from "vue";

import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { cameraPatrolStatisticsPointTop } from "@/infrastructure/api/vmonitor";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";
import EventAlarmItem from "@/shared-ui/panel/eventAlarmItem";
import noData from "@/shared-ui/panel/noData";
import { ModelValueItf } from "@/shared-ui/panel/types";

import styles from "./patrol-point-ranking-list.module.less";

export const PatrolPointRankingList = defineComponent({
  name: "PatrolPointRankingList",
  setup(_props, ctx) {
    const alarmTypeTime = ref<ModelValueItf>();
    const areaAlarmRank = ref([]);
    const areaAlarmStatistic = async () => {
      areaAlarmRank.value = await cameraPatrolStatisticsPointTop({ period: alarmTypeTime.value.dateRange.join(","), topSize: 10 });
    };

    return (): JSX.Element => (
      <>
        <SubPanelTemplate title="巡逻点位排行榜">
          <template>
            {" "}
            <DateInlineForm
              modelValue={alarmTypeTime.value}
              onUpdate:modelValue={(v) => {
                alarmTypeTime.value = v;
              }}
              onSearch={areaAlarmStatistic}
            ></DateInlineForm>
          </template>
          <div class="eventAlarmItem-box">
            {areaAlarmRank.map((item, index) => (
              <EventAlarmItem sort={index + 1} name={item.name} count={item.totalNum} sn={false} />
            ))}
          </div>
          <div style="min-height: 250px">
            {" "}
            <noData></noData>
          </div>
        </SubPanelTemplate>
      </>
    );
  },
});

export default PatrolPointRankingList;
