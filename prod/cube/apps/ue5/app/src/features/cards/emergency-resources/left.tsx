import { defineComponent } from "vue";
import { ref, reactive, onMounted } from "vue";

import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { emergencyRecordTrend, emergencySuppliesStock } from "@/infrastructure/api/emergency";
import RoundPie from "@/shared-ui/panel/charts/roundPie/roundPie";
import stackedColumn from "@/shared-ui/panel/charts/stacked-column/stackedColumn";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";
import LineChart from "@/shared-ui/panel/lineChart";
import pieList from "@/shared-ui/panel/pieList";
import { ModelValueItf } from "@/shared-ui/panel/types";

import styles from "./left.module.less";

export const Left = defineComponent({
  name: "Left",
  setup(_props, ctx) {
    const buildUtilization = reactive({
      xData: [],
      yData: [
        {
          name: "入库数量",
          data: [],
        },
        {
          name: "出库数量",
          data: [],
        },
      ],
    });
    let timeFrame = ref<ModelValueItf>();
    const colorList = ["#328BF7", "#19F8F7", "#FFC700", "#EF424A"];
    const roundPieData = ref([
      {
        value: 10,
        label: "生活物资",
        color: "#328BF7",
      },
      {
        value: 10,
        label: "医疗物资",
        color: "#19F8F7",
      },
      {
        value: 10,
        label: "救援物资",
        color: "#FFC700",
      },
      {
        value: 10,
        label: "能耗物资",
        color: "#EF424A",
      },
    ]);
    const roundPieData1 = ref([]);
    const xData = ref<string[]>(["1", "2", "3", "4", "5", "6"]);
    const yData = ref([
      {
        data: ["1", "2", "3", "4", "5", "6"],
        linearGradientColor: ["rgb(255, 162, 0.1)", "rgb(255, 222, 165,1)"],
        name: "支出",
      },
      {
        data: ["1", "2", "3", "4", "5", "6"],
        linearGradientColor: ["rgba(120, 252, 252, 1)", "rgba(120, 252, 252, 0.1)"],
        lineColor: "rgba(120, 252, 252, 1)",
        name: "进账",
      },
    ]);
    const devicesNum = ref(0);
    const getAlarmLevel = async () => {
      const res = await emergencyRecordTrend({ type: timeFrame.value.timeType, period: timeFrame.value.dateRange.join(",") });
      xData.value = res.map((item) => {
        if (timeFrame.value.timeType === "TODAY") {
          return (item.day += "时");
        } else if (timeFrame.value.timeType === "THIS_YEAR") {
          return (item.day += "月");
        } else {
          return item.day;
        }
      });
      yData.value[0].data = res.map((item) => item.outAmount);
      yData.value[1].data = res.map((item) => item.inAmount);
    };
    const getMaterialStatistics = async () => {
      const res = await emergencySuppliesStock();
      buildUtilization.xData = res.map((e) => e.name);
      buildUtilization.yData[0].data = res.map((e) => e.inValue);
      buildUtilization.yData[1].data = res.map((e) => e.outValue);
      roundPieData.value = res.map((item, index) => {
        return {
          value: item.percentage,
          label: item.name,
          color: colorList[index],
        };
      });
      roundPieData1.value = res.map((item, index) => {
        return {
          value: item.percentage + "%",
          label: item.name,
          color: colorList[index],
        };
      });
    };
    onMounted(() => {
      getMaterialStatistics();
    });

    return (): JSX.Element => (
      <>
        <div>
          <SubPanelTemplate title="当前应急物资情况统计">
            {" "}
            <div class="charts">
              {" "}
              <stackedColumn unit={"件"} xData={buildUtilization.xData} yData={buildUtilization.yData}></stackedColumn>
            </div>
          </SubPanelTemplate>
          <SubPanelTemplate title="应急物资在库统计">
            <div class="equipmentAlarm">
              <RoundPie data={roundPieData.value} eventNum={devicesNum.value}></RoundPie>
              <pieList roundPieData={roundPieData1.value}></pieList>
            </div>
          </SubPanelTemplate>
          <SubPanelTemplate title="应急资金趋势统计">
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
            <div class="charts">
              {" "}
              <LineChart
                x-data={xData.value}
                series={yData.value}
                showLegend={true}
                showBackground={true}
                titles={["支出", "进账"]}
                gridTop="15"
                unit={{ x: "", y: "元" }}
                axisPointer={true}
              />
            </div>
          </SubPanelTemplate>
        </div>
      </>
    );
  },
});

export default Left;
