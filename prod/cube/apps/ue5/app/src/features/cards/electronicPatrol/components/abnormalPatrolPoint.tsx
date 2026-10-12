import { defineComponent } from "vue";
import { ref, reactive, onMounted } from "vue";

import RollTable from "@/features/panel-shell/tables/roll-table/roll-table";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { locationList } from "@/infrastructure/api/maintain";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";

export const AbnormalPatrolPoint = defineComponent({
  name: "AbnormalPatrolPoint",
  setup(_props, ctx) {
    const alarmTime = ref();
    const column = [
      {
        title: "巡更点",
        dataIndex: "locationName",
        width: 120,
      },
      {
        title: "异常次数",
        dataIndex: "abnormalNum",
      },
      {
        title: "巡更率",
        dataIndex: "patrolRatio",
        width: 140,
      },
    ];
    const planListData = ref([]);
    const changeAlarmTime = async () => {
      planListData.value = await locationList({ period: alarmTime.value.dateRange.join(",") });
      planListData.value.map((item) => {
        item.abnormalNum = item.abnormalNum || 0;
      });
    };

    return (): JSX.Element => (
      <>
        <SubPanelTemplate title="巡更点异常top5统计">
          <template>
            {" "}
            <DateInlineForm
              modelValue={alarmTime.value}
              onUpdate:modelValue={(v) => {
                alarmTime.value = v;
              }}
              onSearch={changeAlarmTime}
            ></DateInlineForm>
          </template>
          <RollTable column={column} data={planListData.value}></RollTable>
        </SubPanelTemplate>
      </>
    );
  },
});

export default AbnormalPatrolPoint;
