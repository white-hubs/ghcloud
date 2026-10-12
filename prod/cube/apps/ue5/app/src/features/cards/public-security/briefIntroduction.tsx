import { computed, defineComponent, nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from "vue";

import { CubeMfRootGlobalState } from "@ghcloud/cube-mf-root";

import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { TenantType } from "@/infrastructure/api/models/ouaa";
import { getTenantDetails } from "@/infrastructure/api/ouaa";
import { cubeMdataService } from "@/infrastructure/api/service";
import { getThemeImage } from "@/infrastructure/utils/getImage";
import CountTo from "@/shared-ui/panel/count-to/count-to";

import "./briefIntroduction.module.less";

const builtAreaIcon = getThemeImage("built-area.png");
const companyIntroIcon = getThemeImage("company-intro.png");
const landAreaIcon = getThemeImage("land-area.png");

const PROMOTION_VIDEO_EXTENSIONS = [".mp4", ".webm", ".mov", ".avi", ".mkv", ".m4v"];
const REMARK_SCROLL_SPEED = 24;

export const BriefIntroduction = defineComponent({
  name: "BriefIntroduction",
  setup() {
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

    const monitorPanelData = ref([
      { iconSrc: landAreaIcon, value: 0, unit: "亩", name: "占地" },
      { iconSrc: builtAreaIcon, value: 0, unit: "㎡", name: "建筑面积" },
    ]);

    const remarkBoxRef = ref<HTMLElement | null>(null);
    const remarkTextRef = ref<HTMLElement | null>(null);
    const remarkShouldScroll = ref(false);
    const remarkScrollDuration = ref(20);
    let remarkResizeObserver: ResizeObserver | null = null;
    let remarkMeasureTimer: ReturnType<typeof setTimeout> | null = null;

    const promotionFile = computed(() => tenantData.files[0] ?? null);

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

    const measureRemarkScroll = (): void => {
      const remark = tenantData.remark?.trim() ?? "";
      if (!remark) {
        remarkShouldScroll.value = false;
        return;
      }

      const boxHeight = remarkBoxRef.value?.clientHeight ?? 0;
      const textHeight = remarkTextRef.value?.scrollHeight ?? 0;
      const overflow = boxHeight > 0 && textHeight > boxHeight + 2;

      // 有介绍文案即滚动（与 legacy 观感一致）；溢出时按高度算时长
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

    watch(() => tenantData.remark, updateRemarkScroll);

    const getTenantInfo = async (): Promise<void> => {
      const [res, req] = await Promise.all([
        getTenantDetails(CubeMfRootGlobalState.getInstance().mfRootState.authInfo.tenant),
        cubeMdataService.getMarketOverviewStatistics(),
      ]);
      Object.assign(tenantData, res);
      monitorPanelData.value[0].value = Number(req.areaCovered) || 0;
      monitorPanelData.value[1].value = Number(req.floorArea) || 0;
      updateRemarkScroll();
    };

    onMounted(() => {
      void getTenantInfo();
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
      <div class={["hospitalInfo", isZoom ? "is-zoom" : "", !promotionFile.value?.path ? "is-text-only" : ""]}>
        {promotionFile.value?.path && isPromotionVideo.value ? (
          <video class="promotion-media" src={promotionFile.value.path} controls muted preload="auto" />
        ) : promotionFile.value?.path ? (
          <img class="promotion-media" src={promotionFile.value.path} alt="" />
        ) : null}
        <div class="hospitalInfo-text">
          <div class="hospitalInfo-title">{tenantData.name}</div>
          {isZoom ? (
            <div class="remark-box is-zoom">
              <div class="remark-text">{tenantData.remark}</div>
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
                    ? {
                        // 用全局 keyframes + 内联 animation，避免 module less 动画名失效
                        animation: `brief-intro-remark-marquee ${remarkScrollDuration.value}s linear infinite`,
                      }
                    : undefined
                }
              >
                <div
                  class="remark-text"
                  ref={(el) => {
                    remarkTextRef.value = (el as HTMLElement | null) ?? null;
                  }}
                >
                  {tenantData.remark}
                </div>
                {remarkShouldScroll.value ? <div class="remark-text remark-text-gap">{tenantData.remark}</div> : null}
              </div>
            </div>
          )}
        </div>
      </div>
    );

    const renderBody = (isZoom: boolean): JSX.Element => (
      <div class={["brief-introduction-v2", "brief-introduction-v2-panel", isZoom ? "is-zoom" : ""]} data-no-zoom>
        {renderMetrics(isZoom)}
        {renderInfo(isZoom)}
      </div>
    );

    return () => (
      <div class="v2-panel-root">
        <SubPanelTemplate
          class="visual-v2-sub-panel v2-panel-card brief-introduction-v2-panel"
          title="园区介绍"
          zoomable
          zoom-title="园区介绍详情"
          zoom-width={960}
          v-slots={{
            titleIcon: () => <img src={companyIntroIcon} alt="" class="title-card-icon" />,
            "zoom-content": () => renderBody(true),
          }}
        >
          {renderBody(false)}
        </SubPanelTemplate>
      </div>
    );
  },
});

export default BriefIntroduction;
