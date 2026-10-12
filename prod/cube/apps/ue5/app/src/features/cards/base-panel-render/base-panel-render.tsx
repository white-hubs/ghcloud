import { computed, defineComponent, h, onBeforeUnmount, onMounted, provide, ref, toRef, watch } from "vue";

import { CardDescribe, panelDefinition } from "@ghcloud/cube-visual-sdk";

import { resolveCardLayoutProfile, resolvePanelLayoutPolicy, type PanelLayoutPolicy } from "./card-layout-profile";
import { estimateInitialCardSlotDensity } from "./card-slot-density";
import PanelCardSafeHost from "./panel-card-safe-host";
import PanelCardSlotHost from "./panel-card-slot-host";
import { resolvePanelSlotPacking, SLOT_GAP } from "./panel-slot-packing";
import { VIEWPORT_METRICS_CHANGE_EVENT } from "@/application/bootstrap/viewport-coordinator";
import type { ViewportMetrics } from "@/application/bootstrap/viewport-metrics";
import { ConfigLoader } from "@/application/config/config-loader";
import { CardCollective } from "@/features/cards/_register/card-register";
import { PEOPLE_FLOW_FILLABLE_CARD_CODES } from "@/features/cards/people-flow/cards";
import { AlarmPanel, BusinessPanel } from "@/features/panel-registry/legacy-panel-registry";
import { panelCardTitleKey } from "@/shared-ui/panel/panel-card-title-context";
import { useStateStore } from "@/visualization-core/stores/use-state-store";

import styles from "./base-panel-render.module.less";

/** 后端面板配置名与 SDK panelDefinition 的别名映射 */
const PANEL_NAME_ALIASES: Record<string, string> = {
  SecurityMonitoringSaftLeft: "SecurityMonitoringSafeLeft",
  SecurityMonitoringSaftRight: "SecurityMonitoringSafeRight",
  // 配置端历史命名 ElectricalNew* → SDK 电气安全2.0卡片面板
  ElectricalNewLeft: "ElectricalSafetyLeft",
  ElectricalNewRight: "ElectricalSafetyRight",
  // 配置端历史命名 TianJinMeatTrading* → SDK 猪肉滑轨天津卡片面板
  TianJinMeatTradingLeft: "PorkSlideTianJinLeft",
  TianJinMeatTradingRight: "PorkSlideTianJinRight",
  TianJinMeatTradingBuildLeft: "PorkSlideTianJinFloorLeft",
  TianJinMeatTradingBuildRight: "PorkSlideTianJinFloorRight",
  // 配置端/SDK 双命名：camelCase → PascalCase 拆分卡片面板
  commandDispatchLeft: "CommandDispatchNewLeft",
  commandDispatchRight: "CommandDispatchNewRight",
  // 配置端历史命名 EnvironmentalMonitorLeft/Right → SDK 动环监控园区卡片面板（勿走 legacy 整板）
  EnvironmentalMonitorLeft: "EnvironmentalMonitoringParkingLeft",
  EnvironmentalMonitorRight: "EnvironmentalMonitoringParkingRight",
  // 配置端历史命名 EnvironmentalMonitorNew* → SDK 动环监控2.0卡片面板（勿走 legacy 整板）
  EnvironmentalMonitorNewLeft: "EnvironmentalMonitoringPowerLeft",
  EnvironmentalMonitorNewRight: "EnvironmentalMonitoringPowerRight",
  // 配置端历史命名 SafetyManagement* → SDK SecurityManagement* 拆分卡片（勿走 legacy 整板）
  SafetyManagementLeft: "SecurityManagementLeft",
  SafetyManagementRight: "SecurityManagementRight",
  // 配置端历史命名 FireControlNew* → SDK 消防管理2.0拆分卡片（勿走 legacy 整板）
  FireControlNewLeft: "FireSafetyLeft",
  FireControlNewRight: "FireSafetyRight",
  // 配置端历史命名 ElectronicPatrolNew* → SDK 电子巡更2.0拆分卡片（勿走 legacy 整板）
  ElectronicPatrolNewLeft: "ElectronicPatrolManagement2Left",
  ElectronicPatrolNewRight: "ElectronicPatrolManagement2Right",
};

const PANEL_CONTEXT_CARD_CODES = new Set([
  "equipment-real-time-data",
  "equipment-trend",
  "equipment-rate",
  "public-device-distribution",
  "event-alarm-top5",
  "alarm-status-and-list",
  "alarm-status-and-trend",
  "public-offline-rate-equipment",
  "command-dispatch-alarm-area-top5",
]);

function resolvePanelName(panelName: string): string {
  return PANEL_NAME_ALIASES[panelName] ?? panelName;
}

const PanelCardTitleProvider = defineComponent({
  name: "PanelCardTitleProvider",
  props: {
    title: String,
  },
  setup(props, { slots }) {
    provide(panelCardTitleKey, toRef(props, "title"));
    return () => slots.default?.() ?? null;
  },
});

interface Props {
  panelName: string;
  equipmentId: string;
  universalPanelVo: {
    items: string;
  };
  showPanel: boolean;
  position: "left" | "right";
}

/** 面板渲染组件 */
export const BasePanelRender = defineComponent({
  props: ["panelName", "equipmentId", "universalPanelVo", "showPanel", "position"],
  setup(props: Props) {
    const { globalState } = useStateStore();
    const panelKey = ref(0);
    const viewportHeight = ref(document.documentElement.clientHeight || window.innerHeight);
    const viewportScale = ref(1);
    // Prefer store for left/right so content tracks switchBusinessPanel even if parent slot props lag.
    const livePanelName = computed(() => {
      if (props.position === "left") {
        return globalState.panel.leftPanelName || "";
      }
      if (props.position === "right") {
        return globalState.panel.rightPanelName || "";
      }
      return props.panelName || "";
    });
    const liveUniversalPanelVo = computed(() => {
      if (props.position === "left") {
        return globalState.panel.universalPanelVo.left ?? props.universalPanelVo;
      }
      if (props.position === "right") {
        return globalState.panel.universalPanelVo.right ?? props.universalPanelVo;
      }
      return props.universalPanelVo;
    });
    const resolvedPanelName = computed(() => resolvePanelName(livePanelName.value || ""));
    /** Prefer split-card panelDefinition over legacy monolith when either name has cards. */
    const useLegacyPanel = computed(() => {
      const live = livePanelName.value || "";
      const resolved = resolvedPanelName.value;
      if (!resolved && !live) {
        return false;
      }
      if ((resolved && panelDefinition[resolved]?.cards?.length) || (live && panelDefinition[live]?.cards?.length)) {
        return false;
      }
      return Boolean(BusinessPanel[live] ?? AlarmPanel[live]);
    });

    const panelProps = computed(() => {
      return {
        equipmentId: props.equipmentId,
        universalPanelVo: liveUniversalPanelVo.value,
      };
    });

    const cards = computed<CardDescribe[]>(() => {
      if (useLegacyPanel.value || !resolvedPanelName.value) {
        return [];
      }
      if (liveUniversalPanelVo.value?.items) {
        try {
          const parsed = JSON.parse(liveUniversalPanelVo.value.items);
          if (!Array.isArray(parsed)) {
            return [];
          }
          return parsed
            .filter((e) => e?.cardComponents?.length)
            .map((e) => ({
              title: e.cardProps?.title,
              code: e.cardComponents[e.cardComponents.length - 1],
            }))
            .filter((e) => typeof e.code === "string" && e.code.length > 0 && !!CardCollective[e.code]);
        } catch (error) {
          console.warn(`[BasePanelRender] invalid universalPanelVo.items for ${resolvedPanelName.value}`, error);
          return [];
        }
      }
      const def = panelDefinition[resolvedPanelName.value] ?? (livePanelName.value ? panelDefinition[livePanelName.value] : undefined);
      return (def?.cards ?? []).filter((card) => typeof card?.code === "string" && !!CardCollective[card.code]);
    });
    const panelLayoutPolicy = computed<PanelLayoutPolicy>(() =>
      useLegacyPanel.value ? {} : resolvePanelLayoutPolicy(cards.value[0]?.code),
    );

    const shouldFillTwoPeopleFlowCards = computed(() => {
      const cardCodes = cards.value.map((card) => card.code);
      return cardCodes.length === 2 && cardCodes.every((cardCode) => PEOPLE_FLOW_FILLABLE_CARD_CODES.has(cardCode));
    });
    const cardLayoutProfiles = computed(() => cards.value.map((card) => resolveCardLayoutProfile(card.code)));
    const panelLayout = computed(() => {
      if (useLegacyPanel.value) {
        return {
          mode: "legacy" as const,
          cardCount: 0,
          visibleCount: 0,
          slotHeights: [] as number[],
          gap: SLOT_GAP,
          paddingTop: 0,
          paddingBottom: 0,
        };
      }
      const scale = viewportScale.value;
      const panelTop = (ConfigLoader.config?.entry === "views-gis" ? 100 : 64) * scale;
      const panelBottom = (globalState.menuVisible ? (panelLayoutPolicy.value.bottomInset ?? 76) : 0) * scale;
      return resolvePanelSlotPacking({
        cardCount: cards.value.length,
        availableHeight: Math.max(0, viewportHeight.value - panelTop - panelBottom),
        uiScale: scale,
        ...panelLayoutPolicy.value,
        profiles: cardLayoutProfiles.value.map((profile) => ({
          weight: profile.weight,
          slotMin: profile.slotMin,
          slotMax: profile.slotMax,
        })),
      });
    });
    const initialSlotDensity = computed(() => {
      if (useLegacyPanel.value || cards.value.length === 0) {
        return "comfortable" as const;
      }
      const scale = viewportScale.value;
      const panelTop = (ConfigLoader.config?.entry === "views-gis" ? 100 : 64) * scale;
      const panelBottom = (globalState.menuVisible ? (panelLayoutPolicy.value.bottomInset ?? 76) : 0) * scale;
      return estimateInitialCardSlotDensity(
        Math.max(0, viewportHeight.value - panelTop - panelBottom),
        panelLayout.value.visibleCount || cards.value.length,
        panelLayout.value.gap,
        scale,
      );
    });

    const panel = computed(() => {
      if (!livePanelName.value) {
        return null;
      }

      if (useLegacyPanel.value) {
        const LegacyComp = BusinessPanel[livePanelName.value] ?? AlarmPanel[livePanelName.value];
        if (!LegacyComp) {
          console.warn(`[BasePanelRender] missing legacy panel: ${livePanelName.value}`);
          return null;
        }
        return h(LegacyComp, { ...panelProps.value });
      }

      const nodes = cards.value
        .map((e) => {
          const CardComp = CardCollective[e.code];
          if (!CardComp) {
            return null;
          }
          const profile = resolveCardLayoutProfile(e.code);
          return h(
            PanelCardSlotHost,
            {
              key: e.code,
              code: e.code,
              fillMode: profile.fillMode,
              initialDensity: initialSlotDensity.value,
            },
            {
              default: () =>
                h(
                  PanelCardSafeHost,
                  { code: e.code, title: e.title || e.code },
                  {
                    default: () =>
                      h(
                        PanelCardTitleProvider,
                        { title: e.title },
                        {
                          default: () =>
                            h(CardComp, {
                              ...panelProps.value,
                              ...e,
                              ...(PANEL_CONTEXT_CARD_CODES.has(e.code) ? { panelName: resolvedPanelName.value } : {}),
                              ...(e.code === "people-flow-today-statistics"
                                ? { fillPanel: props.position === "left" && shouldFillTwoPeopleFlowCards.value }
                                : {}),
                            }),
                        },
                      ),
                  },
                ),
            },
          );
        })
        .filter(Boolean);

      return nodes.length ? nodes : null;
    });

    watch(
      () => livePanelName.value,
      () => {
        panelKey.value++;
      },
    );

    let timer: ReturnType<typeof setInterval> | null = null;
    const updateViewportMetrics = (event?: Event): void => {
      const metrics = (event as CustomEvent<ViewportMetrics> | undefined)?.detail;
      viewportHeight.value = metrics?.viewportHeight ?? document.documentElement.clientHeight ?? window.innerHeight;
      const rawScale = metrics?.uiScale ?? Number(getComputedStyle(document.documentElement).getPropertyValue("--ue5-ui-scale").trim());
      viewportScale.value = Number.isFinite(rawScale) && rawScale > 0 ? rawScale : 1;
    };
    onMounted(() => {
      updateViewportMetrics();
      window.addEventListener(VIEWPORT_METRICS_CHANGE_EVENT, updateViewportMetrics);
      timer = setInterval(
        () => {
          panelKey.value++;
        },
        1000 * 60 * 60,
      );
    });

    onBeforeUnmount(() => {
      window.removeEventListener(VIEWPORT_METRICS_CHANGE_EVENT, updateViewportMetrics);
      timer !== null && window.clearInterval(timer);
    });

    const panelStyle = computed(() => {
      let offset = "0px";
      if (!globalState.menuVisible) {
        offset = "-110%";
      }
      if (!globalState.panel.visible) {
        offset = "-110%";
      }
      if (!livePanelName.value) {
        offset = "-110%";
      }
      const style: Record<string, string> = {};
      style[props.position] = offset;
      if (panelLayoutPolicy.value.bottomInset !== undefined) {
        style["--ue5-panel-bottom"] = `${(globalState.menuVisible ? panelLayoutPolicy.value.bottomInset : 0) * viewportScale.value}px`;
      }
      return style;
    });

    return () => (
      <div
        id={`${props.position}-panel`}
        class={[
          styles[props.position + "-panel"],
          styles[ConfigLoader.config?.entry] ?? "",
          !globalState.menuVisible ? styles["panel-menu-hidden"] : "",
        ]}
        style={panelStyle.value}
      >
        <div
          key={`${resolvedPanelName.value || "empty"}-${panelKey.value}`}
          data-panel-layout={panelLayout.value.mode}
          data-card-count={panelLayout.value.cardCount}
          style={
            {
              "--panel-slot-rows": panelLayout.value.slotHeights.map((height) => `${height}px`).join(" "),
              "--panel-slot-gap": `${panelLayout.value.gap}px`,
              "--panel-pack-padding-top": `${panelLayout.value.paddingTop}px`,
              "--panel-pack-padding-bottom": `${panelLayout.value.paddingBottom}px`,
            } as Record<string, string>
          }
          class={[
            props.position + `-panel-box`,
            styles["panel-layout-box"],
            panelLayout.value.mode !== "legacy" ? styles["panel-pack-box"] : "",
          ]}
        >
          {panel.value}
        </div>
      </div>
    );
  },
});
