import dayjs from "dayjs";
import { defineComponent } from "vue";
import { ref, reactive, onMounted } from "vue";

import RollTable from "@/features/panel-shell/tables/roll-table/roll-table";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { bottomMonitorRecordPage, statisticsReasonTread, statisticsReasonType } from "@/infrastructure/api/park-management";
import elevatorAnalysisPie from "@/shared-ui/panel/charts/pie/elevator-analysis-pie";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";
import elevatorAnalysisList from "@/shared-ui/panel/elevator-analysis-list";
import LineChart from "@/shared-ui/panel/lineChart";
import { ModelValueItf } from "@/shared-ui/panel/types";

import styles from "./vehicleMonitoring.module.less";

export const VehicleMonitoring = defineComponent({
  name: "VehicleMonitoring",
  setup(_props, ctx) {
    const energyOverviewTime = ref<ModelValueItf>();
    const overviewTime = ref<ModelValueItf>();
    const columns = ref([
      {
        title: "车牌号",
        dataIndex: "vehicleNo",
      },
      {
        title: "来访事由名称",
        dataIndex: "reason",
      },
      {
        title: "出入时间",
        dataIndex: "accessTime",
      },
    ]);
    const data = ref<any>([]);
    const pieData = ref([]);
    const alarmTotal = ref(0);
    const xData = ref<string[]>([]);
    const titles = ["进", "出"];
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
        name: "进",
        data: [],
        smooth: true,
        symbolSize: 8,
        showSymbol: false,
        lineColor: "#2989FF",
        linearGradientColor: ["#2989FF"],
      },
      {
        name: "出",
        data: [],
        smooth: true,
        symbolSize: 8,
        showSymbol: false,
        lineColor: "#FFC700",
        linearGradientColor: ["#FFC700"],
      },
    ]);
    const changeHandleEnergyOverviewTime = async () => {
      const accessIn = await statisticsReasonTread({
        type: energyOverviewTime.value.timeType,
        period: energyOverviewTime.value.dateRange.join(","),
        accessType: "ACCESS_IN",
      });
      const accessOut = await statisticsReasonTread({
        type: energyOverviewTime.value.timeType,
        period: energyOverviewTime.value.dateRange.join(","),
        accessType: "ACCESS_OUT",
      });
      xData.value = accessIn.map((e) => e.period);
      yData.value[0].data = accessIn.map((e) => e.num);
      yData.value[1].data = accessOut.map((e) => e.num);
    };
    const changeOverviewTime = async () => {
      const res = await statisticsReasonType({
        type: overviewTime.value.timeType,
        period: overviewTime.value.dateRange.join(","),
      });
      const colors = ["#328BF7", "#FFC700", "#19F8F7", "#EF424A"];
      alarmTotal.value = 0;
      pieData.value = res.map((e, i) => {
        alarmTotal.value += e.num;
        return {
          name: e.reasonName,
          value: e.num,
          color: colors[i],
        };
      });
    };
    const getBottomMonitorRecordPage = async () => {
      const res = await bottomMonitorRecordPage({
        pageSize: 50,
        pageNumber: 1,
      });
      data.value = res.records.map((e) => {
        return {
          ...e,
          accessTime: dayjs(e.accessTime).format("YYYY-MM-DD HH:mm:ss"),
        };
      });
    };
    onMounted(() => {
      getBottomMonitorRecordPage();
    });

    return (): JSX.Element => (
      <>
        <div>
          <SubPanelTemplate title="来访趋势">
            <template>
              {" "}
              <DateInlineForm
                modelValue={energyOverviewTime.value}
                onUpdate:modelValue={(v) => {
                  energyOverviewTime.value = v;
                }}
                onSearch={changeHandleEnergyOverviewTime}
              ></DateInlineForm>
            </template>
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
          <SubPanelTemplate title="事由分类">
            <template>
              {" "}
              <DateInlineForm
                modelValue={overviewTime.value}
                onUpdate:modelValue={(v) => {
                  overviewTime.value = v;
                }}
                onSearch={changeOverviewTime}
              ></DateInlineForm>
            </template>
            <div class="elevator-analysis">
              <div class="chart">
                <elevator-analysis-pie pieData={pieData.value}>
                  <div style="color: #fff;text-align: center;font-size: 14px;"> {alarmTotal.value}</div>
                  <div style="color: #fff;text-align: center;font-size: 14px;"> 总数</div>
                </elevator-analysis-pie>
              </div>
              <elevatorAnalysisList contentList={pieData.value} style="margin-left: 10px;"></elevatorAnalysisList>
            </div>
          </SubPanelTemplate>
          <SubPanelTemplate title="检测记录">
            {" "}
            <RollTable column={columns.value} data={data.value} showLength={8}></RollTable>
          </SubPanelTemplate>
        </div>
      </>
    );
  },
});

export default VehicleMonitoring;
