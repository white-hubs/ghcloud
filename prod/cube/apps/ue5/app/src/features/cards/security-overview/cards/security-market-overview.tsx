import dayjs from "dayjs";
import { computed, defineComponent, nextTick, onBeforeUnmount, onMounted, reactive, ref, Teleport, watch } from "vue";

import { CubeMfRootGlobalState } from "@ghcloud/cube-mf-root";

import TipModal from "./tip-modal";
import CardTitleIcon from "@/features/cards/_shared/card-title-icon/card-title-icon";
import ModalRiskTable from "@/features/cards/security-overview/components/modal-risk-table";
import { RiskDetail } from "@/features/cards/security-overview/components/risk-types";
import SecurityDays from "@/features/cards/security-overview/components/security-days";
import ModalTable from "@/features/equipment/modal-table/modal";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { TenantType } from "@/infrastructure/api/models/ouaa";
import { getTenantDetails } from "@/infrastructure/api/ouaa";
import { riskIndex } from "@/infrastructure/api/saftsecurity/overview";
import { cubeMdataService } from "@/infrastructure/api/service";
import { getThemeImage } from "@/infrastructure/utils/getImage";
import Dashboard from "@/shared-ui/panel/charts/dashboard/dashboard";
import CountTo from "@/shared-ui/panel/count-to/count-to";
import { useVisualTheme } from "@/visualization-core/hooks/use-visual-theme";

import "@/features/cards/access-control/_shared/access-control-v2-shared.module.less";
import "@/features/cards/overview/cards/overview-v2-shared.module.less";
import "@/features/equipment/modal-table/modal-equipmentAll-table.module.less";
import "./security-market-overview.module.less";

const landAreaIcon = getThemeImage("land-area.png");
const builtAreaIcon = getThemeImage("built-area.png");
const companyIntroIcon = getThemeImage("company-intro.png");
const deviceSituationIcon = getThemeImage("device-situation.png");

const PROMOTION_VIDEO_EXTENSIONS = [".mp4", ".webm", ".mov", ".avi", ".mkv", ".m4v"];
const REMARK_SCROLL_SPEED = 24;

type MetricItem = {
  name: string;
  value: number;
  unit: string;
  iconSrc: string;
  className: string;
};

export const SecurityMarketOverview = defineComponent({
  name: "SecurityMarketOverview",
  props: {
    title: { type: String, required: false, default: "市场总览" },
  },
  setup(props) {
    const hideGears = Boolean(window.config?.feature?.hideGears);
    const { currentTheme } = useVisualTheme();
    const tipModalWrapClassName = computed(
      () => `modal-table-alarm modal-table-device equipment-data-list-modal risk-tip-list-modal device-records-theme-${currentTheme.value}`,
    );
    const riskDetail = reactive<RiskDetail>({
      riskIndex: 0,
      //@ts-ignore
      alarmSituationRiskIndex: { alarmLevelIndexDetails: [] },
      //@ts-ignore
      alarmUnConfirmedRiskIndex: { alarmLevelIndexDetails: [] },
      //@ts-ignore
      propertyFilingRiskIndex: { propertyCategoryDetails: [] },
    });
    const showTipModal = ref(false);
    const riskModalShow = ref(false);
    const riskData = reactive({ total: 0 });

    const metrics = ref<MetricItem[]>(
      hideGears
        ? [
            { name: "占地", value: 0, unit: "亩", iconSrc: landAreaIcon, className: "is-land" },
            { name: "建筑面积", value: 0, unit: "㎡", iconSrc: builtAreaIcon, className: "is-built" },
          ]
        : [
            { name: "占地", value: 0, unit: "亩", iconSrc: landAreaIcon, className: "is-land" },
            { name: "建筑面积", value: 0, unit: "㎡", iconSrc: builtAreaIcon, className: "is-built" },
            { name: "档位数", value: 0, unit: "个", iconSrc: deviceSituationIcon, className: "is-stall" },
            { name: "商户数", value: 0, unit: "个", iconSrc: companyIntroIcon, className: "is-merchant" },
          ],
    );

    const tenantData = reactive<TenantType>({
      address: "",
      areaCovered: 0,
      building: 0,
      code: "",
      files: [],
      location: "",
      logo: { id: "", name: "", path: "", size: "", suffix: "" },
      id: "",
      name: "",
      remark: "",
    });

    const promotionFile = computed(() => tenantData.files?.[0] ?? null);
    const isPromotionVideo = computed(() => {
      const file = promotionFile.value;
      if (!file?.path) return false;
      const lowerPath = file.path.toLowerCase();
      const lowerSuffix = (file.suffix || "").toLowerCase().replace(/^\./, "");
      return PROMOTION_VIDEO_EXTENSIONS.some((ext) => {
        const extName = ext.slice(1);
        return lowerPath.includes(ext) || lowerSuffix === extName;
      });
    });

    const remarkBoxRef = ref<HTMLElement | null>(null);
    const remarkTextRef = ref<HTMLElement | null>(null);
    const remarkShouldScroll = ref(false);
    const remarkScrollDuration = ref(20);
    let remarkResizeObserver: ResizeObserver | null = null;
    let remarkMeasureTimer: ReturnType<typeof setTimeout> | null = null;

    const measureRemarkScroll = (): void => {
      const remark = tenantData.remark?.trim() ?? "";
      if (!remark) {
        remarkShouldScroll.value = false;
        return;
      }
      const boxHeight = remarkBoxRef.value?.clientHeight ?? 0;
      const textHeight = remarkTextRef.value?.scrollHeight ?? 0;
      const overflow = boxHeight > 0 && textHeight > boxHeight + 2;
      remarkShouldScroll.value = overflow;
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

    watch(() => tenantData.remark, updateRemarkScroll);

    const ensureRiskDetailDefaults = (): void => {
      if (!riskDetail.alarmSituationRiskIndex || riskDetail.alarmSituationRiskIndex?.alarmLevelIndexDetails.length === 0) {
        Object.assign(riskDetail, {
          alarmSituationRiskIndex: {
            alarmLevelIndexDetails: [
              { alarmLevel: "ONE_LEVEL", totalNum: 0, riskIndex: 0 },
              { alarmLevel: "TWO_LEVEL", totalNum: 0, riskIndex: 0 },
              { alarmLevel: "THREE_LEVEL_AND_FOUR_LEVEL", totalNum: 0, riskIndex: 0 },
            ],
          },
        });
      }
      if (!riskDetail.alarmUnConfirmedRiskIndex || riskDetail.alarmUnConfirmedRiskIndex?.alarmLevelIndexDetails.length === 0) {
        Object.assign(riskDetail, {
          alarmUnConfirmedRiskIndex: {
            alarmLevelIndexDetails: [
              { alarmLevel: "ONE_LEVEL", totalNum: 0, riskIndex: 0 },
              { alarmLevel: "TWO_LEVEL", totalNum: 0, riskIndex: 0 },
              { alarmLevel: "THREE_LEVEL_AND_FOUR_LEVEL", totalNum: 0, riskIndex: 0 },
            ],
          },
        });
      }
      if (!riskDetail.propertyFilingRiskIndex || riskDetail.propertyFilingRiskIndex?.propertyCategoryDetails.length === 0) {
        Object.assign(riskDetail, {
          propertyFilingRiskIndex: {
            propertyCategoryDetails: [
              { propertyCategory: "FLAMMABLE_EQUIPMENT", riskIndex: 0 },
              { propertyCategory: "FIRE_FIGHTING_EQUIPMENT", riskIndex: 0 },
              { propertyCategory: "TRANSPORT_DEVICES", riskIndex: 0 },
            ],
          },
        });
      }
    };

    const getRiskIndex = async (): Promise<void> => {
      try {
        const period =
          dayjs().subtract(1, "week").startOf("week").format("YYYY-MM-DD") +
          "," +
          dayjs().subtract(1, "week").endOf("week").format("YYYY-MM-DD");
        const data = await riskIndex({ period });
        riskData.total = 100 - data.riskIndex;
        Object.assign(riskDetail, data);
        ensureRiskDetailDefaults();
      } catch {
        riskData.total = 0;
        ensureRiskDetailDefaults();
      }
    };

    const getTenantInfo = async (): Promise<void> => {
      try {
        const [res, req] = await Promise.all([
          getTenantDetails(CubeMfRootGlobalState.getInstance().mfRootState.authInfo.tenant),
          cubeMdataService.getMarketOverviewStatistics(),
        ]);
        Object.assign(tenantData, res);
        metrics.value[0].value = Number(req.areaCovered) || 0;
        metrics.value[1].value = Number(req.floorArea) || 0;
        if (!hideGears && metrics.value.length >= 4) {
          metrics.value[2].value = Number(req.stallNum) || 0;
          metrics.value[3].value = Number(req.supplierNum) || 0;
        }
        updateRemarkScroll();
      } catch {
        // keep zeros / empty intro
      }
    };

    onMounted(() => {
      void getRiskIndex();
      void getTenantInfo();
      nextTick(() => {
        bindRemarkObserver();
        updateRemarkScroll();
      });
    });

    onBeforeUnmount(() => {
      remarkResizeObserver?.disconnect();
      if (remarkMeasureTimer != null) clearTimeout(remarkMeasureTimer);
    });

    const getRiskLevelClass = (): string => {
      if (riskData.total >= 81) return "is-good";
      if (riskData.total >= 61) return "is-warn";
      return "is-danger";
    };

    const getPointerColor = (): string => {
      const white = currentTheme.value === "minimal-white";
      if (riskData.total >= 81) return white ? "#0f9f5a" : "#39DA99";
      if (riskData.total >= 61) return white ? "#d48806" : "#FFEF4B";
      return white ? "#d4380d" : "#FA6A36";
    };

    const getRiskTextLines = (): [string, string] => {
      if (riskData.total >= 81) return ["安全标杆！", "继续保持哦！"];
      if (riskData.total >= 61) return ["情况稳定！", "但也别松懈哦！"];
      return ["保持警惕！", "别掉以轻心哦！"];
    };

    const openTipModal = (event: Event): void => {
      event.stopPropagation();
      showTipModal.value = true;
    };

    const renderRisk = (): JSX.Element => {
      const [lineOne, lineTwo] = getRiskTextLines();
      // 仪表盘刻度 0=安全(绿) → 100=风险(橙)，指针取「风险值」= 100 - 安全分
      const gaugeValue = Math.min(100, Math.max(0, 100 - (Number(riskData.total) || 0)));
      return (
        <button type="button" class={["safe-market-risk", getRiskLevelClass()]} data-no-zoom onClick={() => (riskModalShow.value = true)}>
          <div class="safe-market-risk-title">
            <span>周安全指数</span>
            <span
              class="safe-market-risk-help"
              role="button"
              tabindex={0}
              onClick={openTipModal}
              onKeydown={(event: KeyboardEvent) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  openTipModal(event);
                }
              }}
            >
              ?
            </span>
          </div>
          <div class="safe-market-risk-content">
            <div class="safe-market-risk-gauge" aria-hidden="true">
              <Dashboard data={gaugeValue} pointerColor={getPointerColor()} />
            </div>
            <div class="safe-market-risk-main">
              <div class="safe-market-risk-score">
                <CountTo startVal={0} endVal={riskData.total} duration={1600} separator="" />
                <span class="safe-market-risk-unit">分</span>
              </div>
              <div class="safe-market-risk-desc">
                <div>{lineOne}</div>
                <div>{lineTwo}</div>
              </div>
            </div>
          </div>
        </button>
      );
    };

    const renderMetrics = (isZoom: boolean): JSX.Element => (
      <div class={["safe-market-metrics", metrics.value.length === 2 ? "is-two" : "", isZoom ? "is-zoom" : ""]} data-no-zoom>
        {metrics.value.map((item) => (
          <div class={["safe-market-metric", item.className]} key={item.name}>
            <div class="safe-market-metric-icon">
              <img src={item.iconSrc} alt="" />
            </div>
            <div class="safe-market-metric-content">
              <div class="safe-market-metric-label">{item.name}</div>
              <div class="safe-market-metric-value">
                <CountTo startVal={0} endVal={item.value} duration={1600} separator="" />
                <span class="safe-market-metric-unit">{item.unit}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    );

    const renderIntro = (isZoom: boolean): JSX.Element => (
      <div class={["safe-market-intro", isZoom ? "is-zoom" : "", !promotionFile.value?.path ? "is-text-only" : ""]} data-no-zoom>
        {promotionFile.value?.path && isPromotionVideo.value ? (
          <video class="safe-market-media" src={promotionFile.value.path} controls muted preload="auto" />
        ) : promotionFile.value?.path ? (
          <img class="safe-market-media" src={promotionFile.value.path} alt="" />
        ) : null}
        <div class="safe-market-intro-text">
          <div class="safe-market-intro-title">{tenantData.name || "园区信息"}</div>
          <div
            class={["safe-market-remark", isZoom ? "is-zoom" : ""]}
            ref={(el) => {
              if (isZoom) return;
              remarkBoxRef.value = (el as HTMLElement | null) ?? null;
              if (el) {
                nextTick(() => {
                  bindRemarkObserver();
                  measureRemarkScroll();
                });
              }
            }}
          >
            {isZoom ? (
              <div class="safe-market-remark-text">{tenantData.remark || "暂无园区介绍"}</div>
            ) : (
              <div
                class={["safe-market-remark-scroll", remarkShouldScroll.value ? "is-scrolling" : ""]}
                style={
                  remarkShouldScroll.value
                    ? { animation: `safe-market-remark-marquee ${remarkScrollDuration.value}s linear infinite` }
                    : undefined
                }
              >
                <div
                  class="safe-market-remark-text"
                  ref={(el) => {
                    remarkTextRef.value = (el as HTMLElement | null) ?? null;
                  }}
                >
                  {tenantData.remark || "暂无园区介绍"}
                </div>
                {remarkShouldScroll.value ? <div class="safe-market-remark-text safe-market-remark-gap">{tenantData.remark}</div> : null}
              </div>
            )}
          </div>
        </div>
      </div>
    );

    const renderBody = (isZoom: boolean): JSX.Element => (
      <div class={["safe-market-body", isZoom ? "is-zoom" : ""]} data-no-zoom>
        {renderRisk()}
        {renderMetrics(isZoom)}
        {renderIntro(isZoom)}
      </div>
    );

    return (): JSX.Element => (
      <>
        <div class="v2-panel-root overview-v2-root">
          <SubPanelTemplate
            title={props.title}
            class="visual-v2-sub-panel v2-panel-card access-control-v2-panel access-control-card-theme overview-v2-panel safe-overview-panel safe-market-panel"
            zoomable
            zoom-title={`${props.title}详情`}
            zoom-width={900}
            v-slots={{
              titleIcon: () => <CardTitleIcon name="overview-management" />,
              default: () => renderBody(false),
              "zoom-content": () => renderBody(true),
            }}
          />
        </div>
        <ModalRiskTable showModal={riskModalShow.value} onClose={() => (riskModalShow.value = false)} riskDetail={riskDetail} />
        <ModalTable
          show={showTipModal.value}
          title="风险指数说明"
          onClose={() => (showTipModal.value = false)}
          width="980px"
          wrapClassName={tipModalWrapClassName.value}
        >
          {showTipModal.value && <TipModal />}
        </ModalTable>
        <Teleport to="body">
          <SecurityDays />
        </Teleport>
      </>
    );
  },
});

export default SecurityMarketOverview;
