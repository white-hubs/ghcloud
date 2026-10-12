import { defineComponent } from "vue";
import { ref, reactive } from "vue";

import overviewChartBar from "@/features/cards/hospital/overview-chartBar";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { broadcastSessions } from "@/infrastructure/api/securitymanagement";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";
import { ModelValueItf } from "@/shared-ui/panel/types";

import styles from "./teaching-live-sessions.module.less";

export const TeachingLiveSessions = defineComponent({
  name: "TeachingLiveSessions",
  setup(_props, ctx) {
    const eventInfo = ref<ModelValueItf>({
      timeType: "TODAY",
      dateRange: [],
    });
    const barData = reactive({
      xData: [] as string[],
      yData: [
        {
          data: [] as number[],
          name: "",
          color: ["rgba(41, 137, 255, 0.80)", "rgba(41, 137, 255, 0)"],
        },
      ],
    });

    const alarmEventTop = async () => {
      let param = {
        period: eventInfo.value.dateRange.join(","),
        type: eventInfo.value.timeType,
      };
      const res = await broadcastSessions(param);
      barData.xData = res.xtitle.map((item: string) => {
        if (eventInfo.value.timeType === "TODAY") {
          return item + "时";
        } else if (eventInfo.value.timeType === "THIS_YEAR") {
          return item + "月";
        } else {
          return item;
        }
      });
      barData.yData[0].data = res.xtitle.map((xItem: string) => {
        const found = res.overviewVos.find((item: any) => item.timeFlag === xItem);
        return found ? found.num : 0;
      });
    };

    return (): JSX.Element => (
      <>
        <SubPanelTemplate title="示教直播场次">
          <template>
            {" "}
            <DateInlineForm
              modelValue={eventInfo.value}
              onUpdate:modelValue={(v) => {
                eventInfo.value = v;
              }}
              onSearch={alarmEventTop}
            ></DateInlineForm>
          </template>
          <div class="chart">
            {" "}
            <overviewChartBar xData={barData.xData} yData={barData.yData}></overviewChartBar>
          </div>
        </SubPanelTemplate>
      </>
    );
  },
});

export default TeachingLiveSessions;
