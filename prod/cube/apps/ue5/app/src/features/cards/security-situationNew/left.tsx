import { defineComponent } from "vue";
import { ref, reactive, onMounted } from "vue";

import stackedLine from "@/features/panel-shell/charts/stacked-line/stacked-line";
import OperateDays from "@/features/panel-shell/metrics/operate-days/operate-days";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { abnormalPassage, trafficAnalysis } from "@/infrastructure/utils/requestData/accessControl";
import { trafficFlowTrend } from "@/infrastructure/utils/requestData/parkingSpaceManage";
import planPie from "@/shared-ui/panel/charts/pie/planePie";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";
import LineChart from "@/shared-ui/panel/lineChart";
import noData from "@/shared-ui/panel/noData";
import pieList from "@/shared-ui/panel/pieList";
import traffic from "@/shared-ui/panel/traffic";

import styles from "./left.module.less";

export const Left = defineComponent({
  name: "Left",
  setup(_props, ctx) {
    let through = ref();
    let throughType = ref();
    const throughNum = ref(0);
    let timeType = ref();
    const ecahrtsData = reactive({
      xData: [],
      yData: [],
    });
    let numberPasses = ref(0);
    const roundPieData = reactive({
      arr: [],
    });
    const lineData = reactive({
      title: "辆",
      xData: [],
      yData: [
        {
          data: [],
          name: "驶入",
          colors: [
            {
              offset: 0,
              color: "rgba(41, 137, 255, 1)",
            },
            {
              offset: 1,
              color: "rgba(41, 137, 255, 0.20)",
            },
          ],
        },
        {
          data: [],
          name: "驶出",
          colors: [
            {
              offset: 0,
              color: "rgba(255, 110, 35, 1)",
            },
            {
              offset: 1,
              color: "rgba(255, 110, 35, 0.02)",
            },
          ],
        },
      ],
    });
    const trafficList = reactive([
      {
        color: "#2989FF",
        label: "驶入",
        value: 0,
      },
      {
        color: "#FF6E23",
        label: "驶出",
        value: 0,
      },
    ]);
    // 人流通行趋势
    const abnormalPassageInfo = async () => {
      let res = await abnormalPassage(through.value.timeType, "DO_PASS");
      ecahrtsData.xData = res.xdata;
      ecahrtsData.yData = res.series[0].value;
      numberPasses.value = 0;
      res.series[0].value.forEach((item) => {
        numberPasses.value += item;
      });
    };
    // 通行分析
    const trafficAnalysisInfo = async () => {
      let res = await trafficAnalysis(throughType.value.timeType);
      throughNum.value = res.total;
      roundPieData.arr = res.arr;
    };
    // 获取车流趋势信息
    const trafficFlowTrendData = async () => {
      let res = await trafficFlowTrend({ dimension: timeType.value.timeType });
      lineData.xData = res.xdata;
      trafficList[0].value = res.series[0].total;
      trafficList[1].value = res.series[1].total;
      lineData.yData[0].data = res.series[0].value;
      lineData.yData[1].data = res.series[1].value;
    };

    return (): JSX.Element => (
      <>
        <div>
          <SubPanelTemplate title="人流通行趋势">
            <template>
              {" "}
              <DateInlineForm
                modelValue={through.value}
                onUpdate:modelValue={(v) => {
                  through.value = v;
                }}
                onSearch={abnormalPassageInfo}
              ></DateInlineForm>
            </template>
            <OperateDays value={numberPasses.value} title="通行总次数"></OperateDays>
            <div class="chart">
              <LineChart
                x-data={ecahrtsData.xData}
                series={[
                  {
                    data: ecahrtsData.yData,
                    linearGradientColor: ["rgb(255, 162, 0.1)", "rgb(255, 222, 165,1)"],
                  },
                ]}
              />
            </div>
          </SubPanelTemplate>
          <SubPanelTemplate title="通行分析" class="alarm-event">
            <template>
              {" "}
              <DateInlineForm
                modelValue={throughType.value}
                onUpdate:modelValue={(v) => {
                  throughType.value = v;
                }}
                onSearch={trafficAnalysisInfo}
              ></DateInlineForm>
            </template>
            <div class="equipmentAlarm">
              <planPie pie-data={roundPieData.arr}>
                <div class="content">
                  <div class="pie-center"> {throughNum.value}</div>
                  <div> 通行总数</div>
                </div>
              </planPie>
              <pieList roundPieData={roundPieData.arr}></pieList>
            </div>
            <div class="equipmentAlarm">
              {" "}
              <noData></noData>
            </div>
          </SubPanelTemplate>
          <SubPanelTemplate title="车流趋势">
            <template>
              {" "}
              <DateInlineForm
                modelValue={timeType.value}
                onUpdate:modelValue={(v) => {
                  timeType.value = v;
                }}
                onSearch={trafficFlowTrendData}
              ></DateInlineForm>
            </template>
            <div class="trafficBox">
              {trafficList.map((item) => (
                <traffic key={item.color} trafficInfo={item}></traffic>
              ))}
            </div>
            <div class="chart">
              {" "}
              <stackedLine
                title={lineData.title}
                yData={lineData.yData}
                xData={lineData.xData}
                color={["#2989FF", "#FF6E23"]}
              ></stackedLine>
            </div>
          </SubPanelTemplate>
        </div>
      </>
    );
  },
});

export default Left;
