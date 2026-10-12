import { CaretRightOutlined } from "@ant-design/icons-vue";
import { defineComponent } from "vue";
import { onMounted, ref } from "vue";

import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { callStatistics } from "@/infrastructure/api/medical-intercom";
import CountTo from "@/shared-ui/panel/count-to/count-to";
import { useStateStore } from "@/visualization-core/stores/use-state-store";

import styles from "./call-statistics-panel.module.less";

export const CallStatisticsPanel = defineComponent({
  name: "CallStatisticsPanel",
  setup(_props, ctx) {
    const { globalState } = useStateStore();

    /**
     * 呼叫统计
     */
    const callStatisticsData = ref([
      { time: "昨日", value: 0, rate: 0 },
      { time: "今日", value: 0, rate: 0 },
      { time: "上周", value: 0, rate: 0 },
      { time: "本周", value: 0, rate: 0 },
    ]);
    const getCallStatistics = async () => {
      let params = {
        sceneType: globalState.business.currentMenu,
        areaId: globalState.business.currentAreaId,
      };
      const res = await callStatistics(params);
      callStatisticsData.value[0].value = res.yesToday;
      callStatisticsData.value[1].value = res.today;
      callStatisticsData.value[1].rate = res.todayRate;
      callStatisticsData.value[2].value = res.yesWeek;
      callStatisticsData.value[3].value = res.week;
      callStatisticsData.value[3].rate = res.weekRate;
    };
    onMounted(() => {
      getCallStatistics();
    });

    return (): JSX.Element => (
      <>
        <SubPanelTemplate title="呼叫统计" class="call-statistics">
          <div class="list">
            {callStatisticsData.map((item, index) => (
              <div class="item">
                <div class="time"> {item.time}</div>
                <div class="datas">
                  <div class="value">
                    {" "}
                    <CountTo startVal={0} endVal={item.value} duration={2000} separator />
                  </div>
                  <span class="rate" style={{ color: item.rate > 0 ? "#F14545" : "#2AE8BD" }}>
                    <span class="text"> 环比</span>
                    <CaretRightOutlined
                      style={{ fontSize: "12px", color: item.rate > 0 ? "#FFCECE" : "#D2FFF3" }}
                      rotate={item.rate > 0 ? -90 : 90}
                    />
                    <count-to startVal={0} endVal={item.rate} duration={2000} separator decimals="2"></count-to>%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </SubPanelTemplate>
      </>
    );
  },
});

export default CallStatisticsPanel;
