import { defineComponent } from "vue";
import { onMounted, onUnmounted, reactive, ref } from "vue";

import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { px2rem } from "@/infrastructure/utils/common";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";
import EventAlarmItem from "@/shared-ui/panel/eventAlarmItem";
import { ModelValueItf } from "@/shared-ui/panel/types";

import styles from "./call-statistics-info-panel.module.less";

export const CallStatisticsInfoPanel = defineComponent({
  name: "CallStatisticsInfoPanel",
  props: {
    chartHeight: { type: Number, required: false, default: 300 },
  },
  setup(props, ctx) {
    // import { AlarmAreaTop } from "@/infrastructure/api/models/alarm";

    const receptionTrendsTime = ref<ModelValueItf>();
    const changeReceptionTrendsTime = (): void => {
      // TODO  接口调用
      const { timeType } = receptionTrendsTime.value;
      if (timeType === "TODAY") {
        areaAlarmRank.value = [
          { name: "心脏内科", count: 75, ratio: 75 },
          { name: "耳鼻喉科", count: 55, ratio: 55 },
          { name: "烧伤科", count: 50, ratio: 50 },
          { name: "心脏外科", count: 50, ratio: 50 },
          { name: "呼吸道科", count: 40, ratio: 40 },
          { name: "肠胃科", count: 35, ratio: 35 },
        ];
      } else if (timeType === "THIS_WEEK") {
        areaAlarmRank.value = [
          { name: "神经内科", count: 75, ratio: 75 },
          { name: "泌尿外科", count: 60, ratio: 60 },
          { name: "心血管科", count: 50, ratio: 50 },
          { name: "心脏外科", count: 40, ratio: 40 },
          { name: "呼吸道科", count: 35, ratio: 35 },
          { name: "肠胃科", count: 35, ratio: 35 },
        ];
      } else if (timeType === "THIS_MONTH") {
        areaAlarmRank.value = [
          { name: "呼吸道科", count: 80, ratio: 80 },
          { name: "肠胃科", count: 65, ratio: 65 },
          { name: "心脏内科", count: 55, ratio: 55 },
          { name: "耳鼻喉科", count: 50, ratio: 50 },
          { name: "烧伤科", count: 45, ratio: 45 },
          { name: "心脏外科", count: 40, ratio: 40 },
        ];
      } else if (timeType === "THIS_YEAR") {
        areaAlarmRank.value = [
          { name: "心血管科", count: 70, ratio: 70 },
          { name: "心脏外科", count: 50, ratio: 50 },
          { name: "神经内科", count: 45, ratio: 45 },
          { name: "泌尿外科", count: 25, ratio: 25 },
          { name: "呼吸道科", count: 20, ratio: 20 },
          { name: "肠胃科", count: 10, ratio: 10 },
        ];
      }
    };
    let timer = null;
    let fakeData = ["TODAY", "THIS_WEEK", "THIS_MONTH", "THIS_YEAR"];
    let fakeIndex = 1;
    onMounted(() => {
      timer = setInterval(
        () => {
          receptionTrendsTime.value.timeType = fakeData[fakeIndex];
          changeReceptionTrendsTime();
          fakeIndex++;
          if (fakeIndex > fakeData.length - 1) {
            fakeIndex = 0;
            clearInterval(timer);
          }
        },
        (window as any).config.pageLoopRequestTime,
      );
    });
    onUnmounted(() => {
      clearInterval(timer);
    });

    return (): JSX.Element => (
      <>
        <SubPanelTemplate title="科室呼叫情况">
          <template>
            {" "}
            <DateInlineForm
              modelValue={receptionTrendsTime.value}
              onUpdate:modelValue={(v) => {
                receptionTrendsTime.value = v;
              }}
              onSearch={changeReceptionTrendsTime}
            ></DateInlineForm>
          </template>
          <div class="body" style={{ height: px2rem(chartHeight + "px") }}>
            {areaAlarmRank.map((item, index) => (
              <EventAlarmItem sort={index + 1} name={item.name} count={item.count} ratio={item.ratio + "%"} modes={"次"} />
            ))}
          </div>
        </SubPanelTemplate>
      </>
    );
  },
});

export default CallStatisticsInfoPanel;
