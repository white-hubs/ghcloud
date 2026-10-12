import { defineComponent } from "vue";
import { ref, reactive, onMounted } from "vue";

import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { taskAbnormalRank, taskAttendedTrend, taskTodayCount } from "@/infrastructure/api/securitymanagement";
import { getAssetsImage } from "@/infrastructure/utils/getImage";
import barChart from "@/shared-ui/panel/charts/bar/barChart";
import LineChart from "@/shared-ui/panel/lineChart";

import styles from "./personnelCounting.module.less";

export const PersonnelCounting = defineComponent({
  name: "PersonnelCounting",
  setup(_props, ctx) {
    const reservationData = ref([
      {
        title: "未到人数",
        value: 100,
      },
      {
        title: "应到人数",
        value: 100,
      },
    ]);
    const alarmType = reactive({
      xData: [],
      yData: [],
    });
    const xData = ref<string[]>([]);
    const titles = [];
    const yData = ref<
      {
        name: string;
        data: number[];
        linearGradientColor?: string[];
        lineColor?: string;
        showSymbol?: boolean;
        smooth?: boolean;
        symbolSize?: number;
      }[]
    >([
      {
        name: "进入",
        data: [],
        smooth: true,
        symbolSize: 8,
        showSymbol: false,
        lineColor: "#2989FF",
        linearGradientColor: ["#2AE8BD", "#2989FF"],
      },
    ]);
    const getTaskTodayCount = async () => {
      const res = await taskTodayCount();
      reservationData.value[0].value = res.expectedCount;
      reservationData.value[1].value = res.unattendedCount;
    };
    const getTaskAbnormalRank = async () => {
      const res = await taskAbnormalRank({ type: "TODAY" });
      alarmType.xData = res.map((item) => item.locationName);
      alarmType.yData = res.map((item) => item.unattendedCount);
    };
    const getTaskAttendedTrend = async () => {
      const res = await taskAttendedTrend({ type: "THIS_YEAR" });
      xData.value = res.map((item) => item.date);
      yData.value[0].data = res.map((item) => item.attendedCount);
    };
    onMounted(() => {
      getTaskTodayCount();
      getTaskAbnormalRank();
      getTaskAttendedTrend();
    });

    return (): JSX.Element => (
      <>
        <div>
          <SubPanelTemplate title="今日人员清点">
            <div class="appointment-statistics">
              {reservationData.map((item) => (
                <div class="statistics-item" key={item.title}>
                  <div class="statistics-box">
                    <div class="monitorPanel-left">
                      <div class="bg">
                        <img src={getAssetsImage("overView4.png")} alt />
                        <img class="rotate aniamtion-electric-fan" src={getAssetsImage("overView13.png")} alt />
                      </div>
                    </div>
                    <div class="monitorPanel-right">
                      <div class="statistics-value"> {item.value}</div>
                      <div class="statistics-title"> {item.title}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </SubPanelTemplate>
          <SubPanelTemplate title="今日异常监区排行榜">
            {" "}
            <div class="chart">
              {" "}
              <barChart
                title={"人"}
                unit={"人"}
                x-data={alarmType.xData}
                data={[{ color: "#1890FF", name: "", data: alarmType.yData }]}
                class="columnBox"
              />
            </div>
          </SubPanelTemplate>
          <SubPanelTemplate title="实到人数趋势图">
            {" "}
            <div class="echart">
              {" "}
              <LineChart
                x-data={xData.value}
                series={yData.value}
                showLegend={true}
                showBackground={true}
                titles={titles}
                gridTop="15"
                unit={{ x: "", y: "人次" }}
                axisPointer={true}
              />
            </div>
          </SubPanelTemplate>
        </div>
      </>
    );
  },
});

export default PersonnelCounting;
