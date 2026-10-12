import { defineComponent, nextTick, onBeforeUnmount, onMounted, reactive, ref } from "vue";

import overviewPanel from "./components/overview-panel";
import CardTitleIcon from "@/features/cards/_shared/card-title-icon/card-title-icon";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { getAssetsImage, getThemeImage } from "@/infrastructure/utils/getImage";
import ElevatorAnalysisPie from "@/shared-ui/panel/charts/pie/elevator-analysis-pie";
import childLevelSubPanel from "@/shared-ui/panel/childLevelSubPanel";
import CountTo from "@/shared-ui/panel/count-to/count-to";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";
import elevatorAnalysisList from "@/shared-ui/panel/elevator-analysis-list";
import LineChart from "@/shared-ui/panel/lineChart";
import { ModelValueItf } from "@/shared-ui/panel/types";

import "@/features/cards/public-security/briefIntroduction.module.less";
import "@/features/cards/access-control/_shared/access-control-v2-shared.module.less";
import "./campus-introduction.module.less";

const builtAreaIcon = getThemeImage("built-area.png");
const landAreaIcon = getThemeImage("land-area.png");
const REMARK_SCROLL_SPEED = 24;

const COURT_NAME = "成都市人民中级法院";
const COURT_REMARK =
  "成都市中级人民法院（以下简称成都中院）成立于1950年10月，前身为成都市人民法院，全院共有政法专项编制541人；内设25个庭级部门，审判业务部门14个，审判综合部门5个，行政综合部门6个。成都市设有1个中级法院，在20个行政区和高新区、天府新区共设22个基层法院，82个人民法庭。成都中院现有抚琴西路办公区和第二办公区（东区）两个办公区，地址分别是成都市金牛区抚琴西路109号，成都市金牛区花牌坊街2号附16号。";
const COURT_IMAGE = getAssetsImage("overView110.png");

export const CampusIntroduction = defineComponent({
  name: "CampusIntroduction",
  props: {
    title: { type: String, required: false, default: "院区介绍" },
  },
  setup(props) {
    const energyOverviewTime = ref<ModelValueItf>({ timeType: "THIS_YEAR", dateRange: ["", ""] });
    const topTimeFrame = ref<ModelValueItf>({ timeType: "THIS_YEAR", dateRange: ["", ""] });
    const titles = ref<string[]>(["民事", "刑事", "行政", "执行"]);
    const xData = ref<string[]>(["旧存", "新收", "结案", "未结"]);
    const yData = ref([
      { name: "民事", data: [2700, 13000, 9000, 4000], showSymbol: false, smooth: true },
      { name: "行政", data: [400, 3000, 3000, 2500], showSymbol: false, smooth: true },
      { name: "刑事", data: [200, 300, 2700, 2000], showSymbol: false, smooth: true },
      { name: "执行", data: [900, 8000, 7000, 3500] },
    ]);

    const monitorPanelData = ref([
      { iconSrc: landAreaIcon, value: 20008, unit: "㎡", name: "占地面积" },
      { iconSrc: builtAreaIcon, value: 56442, unit: "㎡", name: "建筑面积" },
    ]);

    const detectionData = ref([
      { name: "法庭", value: 89, color: "#29C2FF" },
      { name: "调解室", value: 37, color: "#FFAB10" },
      { name: "诉服大厅（立案）", value: 1, color: "#2989FF" },
      { name: "信访大厅", value: 1, color: "#19F8F7" },
      { name: "其他", value: 6, color: "#2AE8BD" },
    ]);

    const overPanelData = reactive({
      tittle: "受理数",
      rate: 10,
      total: 51269,
      panelData1: 7768,
      panelName1: "旧存数",
      panelRatio1: 7.41,
      panelData2: -29.9,
      panelRatio2: 12805,
      panelName2: "新收数",
      panelData3: 22463,
      panelRatio3: -18.07,
      panelName3: "结案数",
      panelData4: 8233,
      panelRatio4: 15.68,
      panelName4: "未结数",
    });

    const spaceTotal = 334;
    const remarkBoxRef = ref<HTMLElement | null>(null);
    const remarkTextRef = ref<HTMLElement | null>(null);
    const remarkShouldScroll = ref(false);
    const remarkScrollDuration = ref(20);
    let remarkResizeObserver: ResizeObserver | null = null;
    let remarkMeasureTimer: ReturnType<typeof setTimeout> | null = null;

    const measureRemarkScroll = (): void => {
      const remark = COURT_REMARK.trim();
      if (!remark) {
        remarkShouldScroll.value = false;
        return;
      }
      const boxHeight = remarkBoxRef.value?.clientHeight ?? 0;
      const textHeight = remarkTextRef.value?.scrollHeight ?? 0;
      const overflow = boxHeight > 0 && textHeight > boxHeight + 2;
      remarkShouldScroll.value = true;
      const basis = overflow ? textHeight : Math.max(remark.length * 0.55, 140);
      remarkScrollDuration.value = Math.max(basis / REMARK_SCROLL_SPEED, 10);
    };

    const updateRemarkScroll = (): void => {
      nextTick(() => {
        measureRemarkScroll();
        requestAnimationFrame(() => {
          measureRemarkScroll();
          if (remarkMeasureTimer != null) clearTimeout(remarkMeasureTimer);
          remarkMeasureTimer = setTimeout(measureRemarkScroll, 160);
        });
      });
    };

    const bindRemarkObserver = (): void => {
      remarkResizeObserver?.disconnect();
      remarkResizeObserver = null;
      if (typeof ResizeObserver === "undefined") return;
      const box = remarkBoxRef.value;
      const text = remarkTextRef.value;
      if (!box) return;
      remarkResizeObserver = new ResizeObserver(() => measureRemarkScroll());
      remarkResizeObserver.observe(box);
      if (text) remarkResizeObserver.observe(text);
    };

    onMounted(() => {
      nextTick(() => {
        bindRemarkObserver();
        updateRemarkScroll();
      });
    });

    onBeforeUnmount(() => {
      remarkResizeObserver?.disconnect();
      remarkResizeObserver = null;
      if (remarkMeasureTimer != null) clearTimeout(remarkMeasureTimer);
    });

    const renderMetrics = (isZoom: boolean): JSX.Element => (
      <div class={["monitorPanelBox", isZoom ? "is-zoom" : ""]}>
        {monitorPanelData.value.map((item) => (
          <div class="metric-card" key={`${isZoom ? "zoom-" : ""}${item.name}`}>
            <div class="metric-icon metric-icon-image">
              <img src={item.iconSrc} alt="" class="metric-icon-img" />
            </div>
            <div class="metric-content">
              <div class="metric-name">{item.name}</div>
              <div class={["metric-value-row", item.value >= 10000 ? "is-large" : ""]}>
                <span class="metric-value">
                  <CountTo startVal={0} endVal={item.value} separator="" duration={2000} />
                </span>
                <span class="metric-unit">{item.unit}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    );

    const renderInfo = (isZoom: boolean): JSX.Element => (
      <div class={["hospitalInfo", isZoom ? "is-zoom" : ""]}>
        <img class="promotion-media" src={COURT_IMAGE} alt="" />
        <div class="hospitalInfo-text">
          <div class="hospitalInfo-title">{COURT_NAME}</div>
          {isZoom ? (
            <div class="remark-box is-zoom">
              <div class="remark-text">{COURT_REMARK}</div>
            </div>
          ) : (
            <div
              class="remark-box"
              ref={(el) => {
                remarkBoxRef.value = (el as HTMLElement | null) ?? null;
                if (el) {
                  nextTick(() => {
                    bindRemarkObserver();
                    measureRemarkScroll();
                  });
                }
              }}
            >
              <div
                class={["remark-scroll", remarkShouldScroll.value ? "is-scrolling" : ""]}
                style={
                  remarkShouldScroll.value
                    ? { animation: `brief-intro-remark-marquee ${remarkScrollDuration.value}s linear infinite` }
                    : undefined
                }
              >
                <div
                  class="remark-text"
                  ref={(el) => {
                    remarkTextRef.value = (el as HTMLElement | null) ?? null;
                  }}
                >
                  {COURT_REMARK}
                </div>
                {remarkShouldScroll.value ? <div class="remark-text remark-text-gap">{COURT_REMARK}</div> : null}
              </div>
            </div>
          )}
        </div>
      </div>
    );

    const renderIntro = (isZoom: boolean): JSX.Element => (
      <div class={["brief-introduction-v2", isZoom ? "is-zoom" : ""]} data-no-zoom>
        {renderMetrics(isZoom)}
        {renderInfo(isZoom)}
      </div>
    );

    const renderExtraSections = (): JSX.Element => (
      <div class="campus-intro-extra-sections" data-no-zoom>
        <childLevelSubPanel
          title="司法数据统计"
          class="campus-intro-child"
          v-slots={{
            extra: () => (
              <div class="access-control-header-toolbar" data-no-zoom>
                <DateInlineForm
                  modelValue={energyOverviewTime.value}
                  onUpdate:modelValue={(v) => {
                    energyOverviewTime.value = v;
                  }}
                />
              </div>
            ),
          }}
        >
          <overviewPanel overPanelData={overPanelData} />
        </childLevelSubPanel>

        <childLevelSubPanel
          title="分条线收结存趋势图"
          class="campus-intro-child"
          v-slots={{
            extra: () => (
              <div class="access-control-header-toolbar" data-no-zoom>
                <DateInlineForm
                  modelValue={topTimeFrame.value}
                  onUpdate:modelValue={(v) => {
                    topTimeFrame.value = v;
                  }}
                />
              </div>
            ),
          }}
        >
          <div class="campus-intro-line-chart">
            <LineChart
              x-data={xData.value}
              series={yData.value}
              showLegend={true}
              showBackground={true}
              titles={titles.value}
              gridTop="26"
              unit={{ x: "", y: "" }}
              axisPointer={true}
              height={180}
            />
          </div>
        </childLevelSubPanel>

        <childLevelSubPanel title="司法业务空间" class="campus-intro-child">
          <div class="campus-intro-space-row">
            <div class="campus-intro-pie-wrap">
              <ElevatorAnalysisPie class="campus-intro-pie" pie-class="campus-intro-pie-chart" pieData={detectionData.value}>
                <div class="campus-intro-pie-center">
                  <div class="campus-intro-pie-value">{spaceTotal}</div>
                  <div class="campus-intro-pie-label">司法空间</div>
                </div>
              </ElevatorAnalysisPie>
            </div>
            <elevatorAnalysisList showRatio={true} contentList={detectionData.value} class="campus-intro-pie-list" />
          </div>
        </childLevelSubPanel>
      </div>
    );

    const renderBody = (isZoom: boolean): JSX.Element => (
      <div class={["campus-introduction-v2-body", isZoom ? "is-zoom" : ""]} data-no-zoom>
        {renderIntro(isZoom)}
        {!isZoom ? renderExtraSections() : null}
      </div>
    );

    return (): JSX.Element => (
      <div class="v2-panel-root campus-introduction-v2-root">
        <SubPanelTemplate
          title={props.title}
          class="visual-v2-sub-panel v2-panel-card brief-introduction-v2-panel campus-introduction-v2-panel"
          zoomable
          zoom-title={`${props.title}详情`}
          zoom-width={960}
          v-slots={{
            titleIcon: () => <CardTitleIcon name="overview-management" />,
            default: () => renderBody(false),
            "zoom-content": () => renderBody(true),
          }}
        />
      </div>
    );
  },
});

export default CampusIntroduction;
