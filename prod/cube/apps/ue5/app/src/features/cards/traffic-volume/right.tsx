import moment from "moment";
import { defineComponent } from "vue";
import { ref, reactive, onMounted } from "vue";

import RollTable from "@/features/panel-shell/tables/roll-table/roll-table";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { equipmentTotal } from "@/infrastructure/api/equipment";
import { differentTunnels, speedAnalysis } from "@/infrastructure/api/securitymanagement";
import PlanPie from "@/shared-ui/panel/charts/pie/planePie";
import stackedColumn from "@/shared-ui/panel/charts/stacked-column/stackedColumn";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";
import LineChart from "@/shared-ui/panel/lineChart";
import PieList from "@/shared-ui/panel/pieList";
import { ModelValueItf } from "@/shared-ui/panel/types";
import { useStateStore } from "@/visualization-core/stores/use-state-store";

import styles from "./right.module.less";

export const Right = defineComponent({
  name: "Right",
  setup(_props, ctx) {
    const { globalState } = useStateStore();
    const equipmentAlarmTime = ref<ModelValueItf>();
    const buildUtilization = reactive({
      xData: [],
      yData: [
        {
          name: "驶入",
          data: [],
        },
        {
          name: "驶出",
          data: [],
        },
      ],
    });
    let listData = reactive([]);
    const column = reactive([
      {
        title: "车道",
        dataIndex: "lane",
        width: 120,
      },
      {
        title: "驶入数量",
        dataIndex: "inNum",
      },
      {
        title: "驶出数量",
        dataIndex: "outNum",
      },
    ]);
    const alarmTotal = ref(0);
    const pieData = ref([]);
    const xData = ref<string[]>([]);
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
        data: [0],
        linearGradientColor: ["rgb(255, 162, 0.1)", "rgb(255, 222, 165,1)"],
        name: "进入",
      },
      {
        data: [0],
        linearGradientColor: ["rgba(120, 252, 252, 1)", "rgba(120, 252, 252, 0.1)"],
        lineColor: "rgba(120, 252, 252, 1)",
        name: "离开",
      },
    ]);
    const titles = ref<string[]>([]);
    const deviceStatusType = {
      ALARM: "报警",
      TROUBLE: "故障",
      OFFLINE: "离线",
      NORMAL: "正常",
    };
    const colorList = ["#2F8DFF", "#D0DEEE", "#FFAB10", "#F14545"];
    const changeHandleEquipmentAlarmTime = async () => {
      const params = {
        type: equipmentAlarmTime.value.timeType,
        period: equipmentAlarmTime.value.dateRange.join(","),
      };
      const res = await differentTunnels(params);
      buildUtilization.xData = res.map((e) => e.lane);
      buildUtilization.yData[0].data = res.map((e) => e.inNum);
      buildUtilization.yData[1].data = res.map((e) => e.outNum);
      Object.assign(listData, res);
    };
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
      pieData.value.length = 0;
      alarmTotal.value = 0;
      res.deviceStatusNums.forEach((item, index) => {
        alarmTotal.value += item.num;
        let obj = {
          label: deviceStatusType[item.name],
          color: colorList[index],
          value: item.num,
        };
        pieData.value.push(obj);
      });
    };
    const getSpeedAnalysis = async () => {
      const res = await speedAnalysis({
        period: [moment().format("YYYY-MM-DD 00:00:00"), moment().format("YYYY-MM-DD HH:mm:ss")].join(","),
      });
      xData.value = res.xtitle.map((item) => {
        return item + "时";
      });
      yData.value[0].data = res.xtitle.map((xItem) => {
        return res.realAverageSpeedAnalysisIn.find((item) => item.timeFlag === xItem)
          ? res.realAverageSpeedAnalysisIn.find((item) => item.timeFlag === xItem).speed
          : 0;
      });
      yData.value[1].data = res.xtitle.map((xItem) => {
        return res.realAverageSpeedAnalysisOut.find((item) => item.timeFlag === xItem)
          ? res.realAverageSpeedAnalysisOut.find((item) => item.timeFlag === xItem).speed
          : 0;
      });
    };
    onMounted(() => {
      deviceDataInfo();
      getSpeedAnalysis();
    });

    return (): JSX.Element => (
      <>
        <div>
          <SubPanelTemplate title="隧道不同车道车流量分析">
            <template>
              {" "}
              <DateInlineForm
                modelValue={equipmentAlarmTime.value}
                onUpdate:modelValue={(v) => {
                  equipmentAlarmTime.value = v;
                }}
                onSearch={changeHandleEquipmentAlarmTime}
              ></DateInlineForm>
            </template>
            <div class="charts">
              {" "}
              <stackedColumn unit={"辆"} xData={buildUtilization.xData} yData={buildUtilization.yData}></stackedColumn>
            </div>
            <div class="footer">
              {" "}
              <RollTable column={column} data={listData}></RollTable>
            </div>
          </SubPanelTemplate>
          <SubPanelTemplate title="断面实时平均车速分析">
            {" "}
            <div class="charts">
              {" "}
              <LineChart
                x-data={xData.value}
                series={yData.value}
                showLegend={true}
                showBackground={true}
                titles={titles.value}
                gridTop="15"
                unit={{ x: "", y: "人次" }}
                axisPointer={true}
              />
            </div>
          </SubPanelTemplate>
          <SubPanelTemplate title="设备状态分布">
            <div class="flex-between">
              <PlanPie pieData={pieData.value}>
                <div class="content">
                  <div class="total-num"> {alarmTotal.value}</div>
                  <div> 设备总数</div>
                </div>
              </PlanPie>
              <PieList roundPieData={pieData.value}></PieList>
            </div>
          </SubPanelTemplate>
        </div>
      </>
    );
  },
});

export default Right;
