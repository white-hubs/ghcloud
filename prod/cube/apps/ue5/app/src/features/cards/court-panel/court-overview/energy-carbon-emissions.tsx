import moment from "moment";
import { defineComponent, reactive, ref } from "vue";

import monitorPanel from "./components/monitor-panel";
import CardTitleIcon from "@/features/cards/_shared/card-title-icon/card-title-icon";
import overviewChartBar from "@/features/cards/hospital/overview-chartBar";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import ElevatorAnalysisPie from "@/shared-ui/panel/charts/pie/elevator-analysis-pie";
import childLevelSubPanel from "@/shared-ui/panel/childLevelSubPanel";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";
import elevatorAnalysisList from "@/shared-ui/panel/elevator-analysis-list";
import LineChart from "@/shared-ui/panel/lineChart";
import { ModelValueItf } from "@/shared-ui/panel/types";

import "@/features/cards/access-control/_shared/access-control-v2-shared.module.less";
import "./energy-carbon-emissions.module.less";

const buildYearRange = (): string[] => [
  moment().startOf("year").format("YYYY-MM-DD 00:00:00"),
  moment().endOf("year").format("YYYY-MM-DD HH:mm:ss"),
];

export const EnergyCarbonEmissions = defineComponent({
  name: "EnergyCarbonEmissions",
  props: {
    title: { type: String, required: false, default: "能源碳排放" },
  },
  setup(props) {
    const canCarbonTime = ref<ModelValueItf>({
      timeType: "THIS_YEAR",
      dateRange: buildYearRange(),
    });
    const receptionTrendsTime = ref<ModelValueItf>({
      timeType: "electricity",
      dateRange: [],
    });
    const receptionTrendsChartData = reactive({
      xData: ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"],
      yData: [
        {
          data: [10, 21, 43, 13, 54, 65, 76, 87, 98, 109, 120, 131],
          linearGradientColor: ["rgba(120, 252, 252, 1)", "rgba(120, 252, 252, 0.1)"],
          lineColor: "rgba(120, 252, 252, 1)",
        },
      ],
    });
    const barData = reactive({
      xData: ["门禁报警", "消防报警", "安防报警", "其他"],
      yData: [
        {
          data: [37, 19, 53, 6],
          name: "",
          color: ["rgba(41, 137, 255, 0.80)", "rgba(41, 137, 255, 0)"],
        },
      ],
    });
    const detectionData = ref([
      { name: "监控设备", value: 94, color: "#EC5F67" },
      { name: "消防设备", value: 105, color: "#FFAB10" },
      { name: "门禁设备", value: 26, color: "#2989FF" },
      { name: "其他", value: 6, color: "#19F8F7" },
    ]);
    const timeList = [
      { label: "电", value: "electricity" },
      { label: "水", value: "water" },
      { label: "气", value: "gas" },
      { label: "碳排放", value: "carbon" },
    ];
    const monitorPanelData = ref([
      { imgPath: "overView101.png", value: "23452", unit: "tce", name: "综合能耗", chainRatio: -10 },
      { imgPath: "overView35.png", value: "23421", unit: "kgco2e", name: "碳排量", chainRatio: -8 },
    ]);
    const courtData = ref([
      { imgPath: "overView103.png", value: "233", unit: "天", name: "安全运行天数", chainRatio: undefined as number | undefined },
      { imgPath: "overView102.png", value: "115", unit: "个", name: "报警总数", chainRatio: 5 },
    ]);

    const renderBody = (isZoom: boolean): JSX.Element => (
      <div class={["energy-carbon-v2-body", isZoom ? "is-zoom" : ""]} data-no-zoom>
        <div class="energy-carbon-metric-box">
          {monitorPanelData.value.map((item) => (
            <monitorPanel key={item.name} monitorPanelData={item} />
          ))}
        </div>

        <childLevelSubPanel
          title="院区用能趋势图"
          class="energy-carbon-child"
          v-slots={{
            extra: () => (
              <div class="access-control-header-toolbar" data-no-zoom>
                <DateInlineForm
                  timeList={timeList}
                  modelValue={receptionTrendsTime.value}
                  onUpdate:modelValue={(v) => {
                    receptionTrendsTime.value = v;
                  }}
                />
              </div>
            ),
          }}
        >
          <div class="energy-carbon-line-chart">
            <LineChart
              x-data={receptionTrendsChartData.xData}
              series={receptionTrendsChartData.yData}
              showLegend={false}
              gridTop="26"
              unit={{ x: "", y: "万" }}
              height={isZoom ? 280 : 170}
            />
          </div>
        </childLevelSubPanel>

        <childLevelSubPanel
          title="院区安全汇总"
          class="energy-carbon-child"
          v-slots={{
            extra: () => (
              <div class="access-control-header-toolbar" data-no-zoom>
                <DateInlineForm
                  modelValue={canCarbonTime.value}
                  onUpdate:modelValue={(v) => {
                    canCarbonTime.value = v;
                  }}
                />
              </div>
            ),
          }}
        >
          <div class="energy-carbon-metric-box">
            {courtData.value.map((item) => (
              <monitorPanel key={item.name} monitorPanelData={item} />
            ))}
          </div>
          <div class="energy-carbon-bar-chart">
            <div class="energy-carbon-child-title">安全报警统计</div>
            <overviewChartBar bottom="0%" gridTop={28} xData={barData.xData} yData={barData.yData} height={isZoom ? 240 : 150} />
          </div>
        </childLevelSubPanel>

        <childLevelSubPanel title="建筑设施设备" class="energy-carbon-child">
          <div class="energy-carbon-space-row">
            <div class="energy-carbon-pie-wrap">
              <ElevatorAnalysisPie class="energy-carbon-pie" pie-class="energy-carbon-pie-chart" pieData={detectionData.value}>
                <div class="energy-carbon-pie-center">
                  <div class="energy-carbon-pie-value">231</div>
                  <div class="energy-carbon-pie-label">设备总数</div>
                </div>
              </ElevatorAnalysisPie>
            </div>
            <elevatorAnalysisList showRatio={true} contentList={detectionData.value} class="energy-carbon-pie-list" />
          </div>
        </childLevelSubPanel>
      </div>
    );

    return (): JSX.Element => (
      <div class="v2-panel-root energy-carbon-v2-root">
        <SubPanelTemplate
          title={props.title}
          class="visual-v2-sub-panel v2-panel-card access-control-v2-panel access-control-card-theme energy-carbon-v2-panel"
          zoomable
          zoom-title={`${props.title}详情`}
          zoom-width={900}
          v-slots={{
            titleIcon: () => <CardTitleIcon name="overview-management" />,
            extra: () => (
              <div class="access-control-header-toolbar" data-no-zoom>
                <DateInlineForm
                  modelValue={canCarbonTime.value}
                  onUpdate:modelValue={(v) => {
                    canCarbonTime.value = v;
                  }}
                />
              </div>
            ),
            default: () => renderBody(false),
            "zoom-content": () => renderBody(true),
          }}
        />
      </div>
    );
  },
});

export default EnergyCarbonEmissions;
