import { defineComponent } from "vue";
import { ref, reactive, onMounted } from "vue";

import patrolStatistics from "./components/patrolStatistics";
import rankingPatrolPersonnel from "./components/rankingPatrolPersonnel";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { patrolTodayTimeFrame } from "@/infrastructure/api/door";
import LineChart from "@/shared-ui/panel/lineChart";

import styles from "./left_hk.module.less";

export const LeftHk = defineComponent({
  name: "LeftHk",
  setup(_props, ctx) {
    const xData = ref<string[]>([]);
    const yDataTrend = ref<number[]>([]);

    const getPatrolTodayTimeFrame = async () => {
      const res = await patrolTodayTimeFrame({ type: "TODAY" });
      xData.value = [];
      yDataTrend.value = [];
      res.forEach((e) => {
        xData.value.push(e.key);
        yDataTrend.value.push(e.value);
      });
    };

    onMounted(() => {
      getPatrolTodayTimeFrame();
    });

    return (): JSX.Element => (
      <>
        <div>
          <patrolStatistics></patrolStatistics>
          <SubPanelTemplate title="今日巡更时段分布">
            <div class="chart">
              <LineChart
                unit={{ x: "", y: "" }}
                gridTop={"5"}
                x-data={xData.value}
                series={[
                  {
                    data: yDataTrend,
                    linearGradientColor: ["rgb(86, 142, 255)", "rgb(86, 142, 255,0)"],
                  },
                ]}
              />
            </div>
          </SubPanelTemplate>
          <rankingPatrolPersonnel></rankingPatrolPersonnel>
        </div>
      </>
    );
  },
});

export default LeftHk;
