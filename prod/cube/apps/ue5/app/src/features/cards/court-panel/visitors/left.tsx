import { defineComponent } from "vue";
import { ref, reactive, onMounted } from "vue";

import monitorPanel from "@/features/cards/court-panel/court-overview/components/monitor-panel";
import Tabs from "@/features/cards/court-panel/judicial-space/components/tabs";
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
    // 司法空间数据
    const monitorPanelData = ref([
      {
        imgPath: "overView109.png",
        value: "1399",
        name: "来访人员总数",
      },
      {
        imgPath: "overView106.png",
        value: "234",
        name: "律师来访统计",
      },
      {
        imgPath: "overView107.png",
        value: "1",
        name: "敏感人员来访",
      },
      {
        imgPath: "overView108.png",
        value: "9",
        name: "来访滞留人员",
      },
    ]);
    const energyOverviewTime = ref<ModelValueItf>({
      timeType: "THIS_WEEK",
      dateRange: [],
    });
    const tabState = reactive({
      active: "age",
      tabList: [
        {
          label: "年龄分布",
          value: "age",
        },
        {
          label: "性别分布",
          value: "sex",
        },
      ],
    });
    // 司法空间区域数据
    const spaceAreaData = ref({
      value: 1399,
      data: [
        {
          name: "20岁以下",
          value: 62,
          color: "#29C2FF",
        },
        {
          name: "21-30",
          value: 237,
          color: "#FFAB10",
        },
        {
          name: "31-40",
          value: 451,
          color: "#2989FF",
        },
        {
          name: "40-50",
          value: 371,
          color: "#19F8F7",
        },
        {
          name: "50以上",
          value: 278,
          color: "#EC5F67",
        },
      ],
    });
    const receptionTrendsChartData = reactive({
      xData: ["周一", "周二", "周三", "周四", "周五", "周六"],
      yData: [
        {
          data: [1023, 1411, 1099, 1132, 1122, 1399],
          linearGradientColor: ["rgba(41,137,255,0.60)", "rgba(41,137,255,0.00)"],
          lineColor: "rgba(41,137,255,0.60)",
        },
      ],
    });
    const handleTabChange = () => {
      if (tabState.active === "age") {
        spaceAreaData.value.data = [
          {
            name: "20岁以下",
            value: 62,
            color: "#29C2FF",
          },
          {
            name: "21-30",
            value: 237,
            color: "#FFAB10",
          },
          {
            name: "31-40",
            value: 451,
            color: "#2989FF",
          },
          {
            name: "40-50",
            value: 371,
            color: "#19F8F7",
          },
          {
            name: "50以上",
            value: 278,
            color: "#EC5F67",
          },
        ];
      } else {
        spaceAreaData.value.data = [
          {
            name: "男",
            value: 1078,
            color: "#29C2FF",
          },
          {
            name: "女",
            value: 321,
            color: "#FFAB10",
          },
        ];
      }
    };
    const changeEnergyOverviewTime = () => {};

    return (): JSX.Element => (
      <>
        <div>
          <SubPanelTemplate title="今日来访人员统计">
            <div class="monitorPanelBox">
              {monitorPanelData.map((item, index) => (
                <monitorPanel key={item.name} monitorPanelData={item}></monitorPanel>
              ))}
            </div>
          </SubPanelTemplate>
          <SubPanelTemplate title="人员来访趋势">
            <template>
              {" "}
              <DateInlineForm
                modelValue={energyOverviewTime.value}
                onUpdate:modelValue={(v) => {
                  energyOverviewTime.value = v;
                }}
                onChange={changeEnergyOverviewTime}
              ></DateInlineForm>
            </template>
            <div class="line-chart">
              {" "}
              <LineChart
                x-data={receptionTrendsChartData.xData}
                series={receptionTrendsChartData.yData}
                showLegend={false}
                gridTop="5"
                unit={{ x: "", y: "人" }}
              />
            </div>
          </SubPanelTemplate>
          <SubPanelTemplate title="来访人员分布">
            <template>
              {" "}
              <DateInlineForm
                modelValue={energyOverviewTime.value}
                onUpdate:modelValue={(v) => {
                  energyOverviewTime.value = v;
                }}
                onChange={changeEnergyOverviewTime}
              ></DateInlineForm>
            </template>
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
            <div class="elevator-analysis">
              <div class="chart">
                <elevatorAnalysisPie pieData={spaceAreaData.data}>
                  <div style="color: #fff;text-align: center;font-size: 14px;"> {spaceAreaData.value}</div>
                  <div style="color: #fff;text-align: center;font-size: 10px;"> {spaceAreaData.name}</div>
                </elevatorAnalysisPie>
              </div>
              <elevatorAnalysisList showRatio={true} contentList={spaceAreaData.data} class="pie_list"></elevatorAnalysisList>
            </div>
          </SubPanelTemplate>
        </div>
      </>
    );
  },
});

export default Left;
