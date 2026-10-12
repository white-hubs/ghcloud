import { defineComponent } from "vue";
import { ref, reactive, onMounted } from "vue";

import overviewPanel from "@/features/cards/court-panel/court-overview/components/overview-panel";
import Tabs from "@/features/cards/court-panel/judicial-space/components/tabs";
import overviewChartBar from "@/features/cards/hospital/overview-chartBar";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import elevatorAnalysisPie from "@/shared-ui/panel/charts/pie/elevator-analysis-pie";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";
import elevatorAnalysisList from "@/shared-ui/panel/elevator-analysis-list";
import LineChart from "@/shared-ui/panel/lineChart";
import { ModelValueItf } from "@/shared-ui/panel/types";

import styles from "./left.module.less";

export const Left = defineComponent({
  name: "Left",
  setup(_props, ctx) {
    const energyOverviewTime = ref<ModelValueItf>();
    const xData = ref<string[]>(["旧存", "新收", "结案", "未结"]);
    const titles = ref<string[]>(["民事", "刑事", "行政", "执行"]);
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
        name: "民事",
        data: [2700, 13000, 9000, 4000],
        showSymbol: false,
        smooth: true,
      },
      {
        name: "行政",
        data: [400, 3000, 3000, 2500],
        showSymbol: false,
        smooth: true,
      },
      {
        name: "刑事",
        data: [200, 300, 2700, 2000],
        showSymbol: false,
        smooth: true,
      },
      {
        name: "执行",
        data: [900, 8000, 7000, 3500],
      },
    ]);
    const barData = reactive({
      xData: ["1-2年未结案", "2-3年未结案", "3年及以上"],
      yData: [
        {
          data: [289, 143, 211],
          name: "案件预案数",
          color: ["rgba(41, 137, 255, 0.80)", "rgba(41, 137, 255, 0)"],
        },
      ],
    });
    const tabState = reactive({
      active: "court",
      tabList: [
        {
          label: "法院",
          value: "court",
        },
        {
          label: "调解室",
          value: "mediation",
        },
        {
          label: "诉服大厅",
          value: "litigation",
        },
        {
          label: "信访大厅",
          value: "petition",
        },
      ],
    });
    const overPanelData = reactive({
      tittle: "受理数",
      rate: -10,
      total: 35269,

      panelData1: 4768,
      panelName1: "旧存数",
      panelRatio1: 207,

      panelData2: 10501,
      panelRatio2: -29.9,
      panelName2: "新收数",

      panelData3: 22463,
      panelRatio3: -38,
      panelName3: "结案数",

      panelData4: 12805,
      panelRatio4: -45.68,
      panelName4: "未结数",
    });
    const detectionData = ref([
      {
        name: "立案",
        value: 189,
        color: "#29C2FF",
      },
      {
        name: "审理中",
        value: 299,
        color: "#FFAB10",
      },
      {
        name: "判决",
        value: 209,
        color: "#2989FF",
      },
      {
        name: "执行",
        value: 269,
        color: "#19F8F7",
      },
      {
        name: "上诉",
        value: 33,
        color: "#2AE8BD",
      },
    ]);
    const changeHandleEnergyOverviewTime = () => {};
    const handleTabChange = (value: string, tab) => {
      // spaceAreaData.value = spaceAreaDataList.find((e) => e.type === value)
    };

    return (): JSX.Element => (
      <>
        <SubPanelTemplate title="司法数据统计">
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
          <overviewPanel overPanelData={overPanelData}></overviewPanel>
          <div class="tab-container">
            {" "}
            <Tabs
              tabsList={tabState.tabList}
              active={tabState.active}
              onUpdate:active={(v) => {
                tabState.active = v;
              }}
              onChange={handleTabChange}
            />
          </div>
          <div class="line-chart">
            {" "}
            <LineChart
              x-data={xData.value}
              series={yData.value}
              showLegend={true}
              showBackground={true}
              titles={titles.value}
              gridTop="15"
              unit={{ x: "", y: "" }}
              axisPointer={true}
            />
          </div>
        </SubPanelTemplate>
        <SubPanelTemplate title="民事案件发布">
          <div class="elevator-analysis">
            <div class="chart">
              <elevator-analysis-pie pieData={detectionData.value}>
                <div style="color: #fff;text-align: center;font-size: 14px;"> 999</div>
                <div style="color: #fff;text-align: center;font-size: 10px;"> 案件数</div>
              </elevator-analysis-pie>
            </div>
            <elevatorAnalysisList showRatio={true} contentList={detectionData.value} class="pie_list"></elevatorAnalysisList>
          </div>
        </SubPanelTemplate>
        <SubPanelTemplate title="案件积压预警">
          {" "}
          <div class="bar-chart">
            {" "}
            <overviewChartBar xData={barData.xData} yData={barData.yData}></overviewChartBar>
          </div>
        </SubPanelTemplate>
      </>
    );
  },
});

export default Left;
