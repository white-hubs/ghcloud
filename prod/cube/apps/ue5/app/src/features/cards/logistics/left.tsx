import { defineComponent } from "vue";
import { ref, reactive, onMounted } from "vue";

import stackedBarChart from "@/features/cards/Information-release/stacked-bar-chart";
import GridContainer from "@/features/panel-shell/metrics/grid-container/grid-container";
import OperateDays from "@/features/panel-shell/metrics/operate-days/operate-days";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { equipmentTotal } from "@/infrastructure/api/equipment";
import { statusNum } from "@/infrastructure/api/securitymanagement";
import { alarmTrend, equipmentNumber } from "@/infrastructure/utils/requestData/alarm";
import PlanPie from "@/shared-ui/panel/charts/pie/planePie";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";
import LineChart from "@/shared-ui/panel/lineChart";
import PieList from "@/shared-ui/panel/pieList";
import { ModelValueItf } from "@/shared-ui/panel/types";
import { useStateStore } from "@/visualization-core/stores/use-state-store";

import styles from "./left.module.less";

export const Left = defineComponent({
  name: "Left",
  setup(_props, ctx) {
    const deviceStatusType = {
      ALARM: "报警",
      TROUBLE: "故障",
      OFFLINE: "离线",
      NORMAL: "正常",
    };
    const colorList = ["#2F8DFF", "#D0DEEE", "#FFAB10", "#F14545"];
    const { globalState } = useStateStore();
    const barXData = ref<string[]>(["1号楼", "2号楼", "3号楼"]);
    const barYData = ref<{ name: string; data: number[]; color: string }[]>([
      {
        name: "正常",
        data: [1, 2, 3, 4],
        color: "#2AE8BD",
      },
      {
        name: "离线",
        data: [1, 2, 3, 4],
        color: "#2989FF",
      },
    ]);
    const trend = ref<ModelValueItf>();
    const roundPieData = ref([]);
    const alarmTotal = ref(0);
    let alarmStatusData = reactive([]);
    const alarmNum = ref<number>(0);
    const chainRatio = ref<number>(0);
    const xData = reactive({
      arr: ["1时", "2时", "3时", "4时", "5时"],
    });
    const series = reactive([
      {
        data: [0],
        linearGradientColor: ["rgb(86, 142, 255)", "rgb(86, 142, 255,0)"],
      },
    ]);
    // 设备实时数据
    const deviceDataInfo = async () => {
      let params = {
        sceneType: globalState.business.currentMenu,
        areaId: globalState.business.currentAreaId,
      };
      let res: any = await equipmentTotal(params);
      if (!res.deviceNum) {
        return;
      }
      roundPieData.value.length = 0;
      alarmTotal.value = 0;
      res.deviceStatusNums.forEach((item, index) => {
        alarmTotal.value += item.num;
        let obj = {
          label: deviceStatusType[item.name],
          color: colorList[index],
          value: item.num,
        };
        roundPieData.value.push(obj);
      });
    };
    // 设备报警趋势
    const alarmTrendInfo = async () => {
      let param = {
        sceneType: globalState.business.currentMenu,
        areaId: globalState.business.currentAreaId,
        period: trend.value.dateRange.join(","),
        type: trend.value.timeType,
      };
      let res: any = await alarmTrend(param);
      let data: any = await equipmentNumber(param);
      alarmStatusData = data.alarmStatusStatistics;
      alarmNum.value = data.alarmNum;
      chainRatio.value = data.chainRatio;
      xData.arr = res.xdata;
      series[0].data = res.ydata;
    };
    const getStatusNum = async () => {
      const res = await statusNum({ applicationCode: "LOGISTICS" });
      barXData.value = res.areaStatusNum.map((item) => {
        return item.areaName;
      });
      barYData.value[0].data = res.areaStatusNum.map((item) => {
        return item.onNum;
      });
      barYData.value[1].data = res.areaStatusNum.map((item) => {
        return item.offlineNum;
      });
    };
    onMounted(() => {
      deviceDataInfo();
      getStatusNum();
    });

    return (): JSX.Element => (
      <>
        <div>
          <SubPanelTemplate title="物流系统设备状态分布">
            <div class="flex-between">
              <PlanPie pieData={roundPieData.value}>
                <div class="content">
                  <div class="total-num"> {alarmTotal.value}</div>
                  <div> 设备总数</div>
                </div>
              </PlanPie>
              <PieList roundPieData={roundPieData.value}></PieList>
            </div>
          </SubPanelTemplate>
          <SubPanelTemplate title="设备报警趋势">
            <template>
              {" "}
              <DateInlineForm
                modelValue={trend.value}
                onUpdate:modelValue={(v) => {
                  trend.value = v;
                }}
                onSearch={alarmTrendInfo}
              ></DateInlineForm>
            </template>
            <OperateDays value={alarmNum.value} title="报警总数">
              <div class="ringRatio">
                <span> 环比</span>
                <div class={["downtriangle", chainRatio > 0 && "uptriangle"]}></div>
                <div class={[chainRatio > 0 ? "up" : "down"]}> {chainRatio + "%"}</div>
              </div>
            </OperateDays>
            <GridContainer style="margin-top: 12px" data={alarmStatusData}></GridContainer>
            <div class="charts">
              {" "}
              <LineChart x-data={xData.arr} series={series} title={"次"}></LineChart>
            </div>
          </SubPanelTemplate>
          <SubPanelTemplate title="设备在线情况">
            {" "}
            <div class="charts">
              {" "}
              <stackedBarChart x-data={barXData.value} y-data={barYData.value}></stackedBarChart>
            </div>
          </SubPanelTemplate>
        </div>
      </>
    );
  },
});

export default Left;
