import { defineComponent } from "vue";
import { ref } from "vue";

import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { teachOverview } from "@/infrastructure/api/securitymanagement";
import RoundPie from "@/shared-ui/panel/charts/roundPie/roundPie";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";
import pieList from "@/shared-ui/panel/pieList";
import { ModelValueItf } from "@/shared-ui/panel/types";

import styles from "./teaching-overview.module.less";

export const TeachingOverview = defineComponent({
  name: "TeachingOverview",
  setup(_props, ctx) {
    const timeFrame = ref<ModelValueItf>({
      timeType: "TODAY",
      dateRange: [],
    });
    const roundPieData = ref([]);
    const devicesNum = ref(0);

    const getAlarmLevel = async () => {
      let param = {
        period: timeFrame.value.dateRange.join(","),
        type: timeFrame.value.timeType,
      };
      const res = await teachOverview(param);
      devicesNum.value = 0;
      roundPieData.value = res.map((item: any) => {
        devicesNum.value += item.num;
        return {
          label: item.name,
          value: item.num,
        };
      });
    };

    return (): JSX.Element => (
      <>
        <SubPanelTemplate title="示教情况总览">
          <template>
            {" "}
            <DateInlineForm
              modelValue={timeFrame.value}
              onUpdate:modelValue={(v) => {
                timeFrame.value = v;
              }}
              onSearch={getAlarmLevel}
            ></DateInlineForm>
          </template>
          <div class="equipmentAlarm">
            <RoundPie data={roundPieData.value} eventNum={devicesNum.value}>
              <div class="content">
                <span> {devicesNum.value}</span>
                <br />
                报警总数
              </div>
            </RoundPie>
            <pieList roundPieData={roundPieData.value}></pieList>
          </div>
        </SubPanelTemplate>
      </>
    );
  },
});

export default TeachingOverview;
