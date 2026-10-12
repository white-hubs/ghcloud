import { computed, defineComponent, h, onBeforeUnmount, onMounted, ref } from "vue";

import { CardDescribe, panelDefinition } from "@ghcloud/cube-visual-sdk";

import { CardCollective } from "./card-register";
import { AlarmPanel, BusinessPanel } from "@/components";
import { ConfigLoader } from "@/pages/config-loader";
import { useStateStore } from "@/pages/state/use-state-store";

import styles from "./base-panel-render.module.less";
/** 后端历史面板名 → SDK panelDefinition 正式名（如 Saft 拼写错误） */
const PANEL_NAME_ALIASES: Record<string, string> = {
  SecurityMonitoringSaftLeft: "SecurityMonitoringSafeLeft",
  SecurityMonitoringSaftRight: "SecurityMonitoringSafeRight",
};

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
    /** 兼容后端历史面板定义名 */
    const resolvedPanelName = computed(() => PANEL_NAME_ALIASES[props.panelName] ?? props.panelName);
    const useLegacyPanel = computed(() => {
      return !Object.keys(panelDefinition).includes(resolvedPanelName.value);
    });

    const panelProps = computed(() => {
      return {
        equipmentId: props.equipmentId,
        universalPanelVo: props.universalPanelVo,
      };
    });

    const cards = computed<CardDescribe[]>(() => {
      if (useLegacyPanel.value) {
        return [];
      }
      // 配置了自定义卡片
      if (props.universalPanelVo?.items) {
        const customCards = JSON.parse(props.universalPanelVo.items)
          .filter((e) => e.cardComponents)
          .map((e) => {
            return {
              title: e.cardProps.title,
              code: e.cardComponents[e.cardComponents.length - 1],
            };
          });
        return customCards;
      }
      return panelDefinition[resolvedPanelName.value].cards;
    });

    const panel = computed(() => {
      const res = BusinessPanel[resolvedPanelName.value] ?? AlarmPanel[resolvedPanelName.value];
      return useLegacyPanel.value
        ? h(res, { ...panelProps.value })
        : cards.value.map((e) => {
            return h(CardCollective[e.code], {
              key: e.code,
              ...panelProps.value,
              ...e,
            });
          });
    });

    const shouldFillTwoPeopleFlowCards = computed(() => {
      const cardCodes = cards.value.map((card) => card.code);
      return (
        props.position === "left" &&
        cardCodes.length === 2 &&
        cardCodes.includes("people-flow-today-statistics") &&
        cardCodes.includes("people-flow-distribution")
      );
    });

    let timer = null;
    onMounted(() => {
      // 动态刷新面板数据
      timer = setInterval(
        () => {
          panelKey.value++;
        },
        1000 * 60 * 60,
      );
    });

    onBeforeUnmount(() => {
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
      if (!props.panelName) {
        offset = "-110%";
      }
      const style = {};
      style[props.position] = offset;
      style["width"] = "calc(400px / var(--scale))";
      return style;
    });

    return () => (
      <div
        id={`${props.position}-panel`}
        class={`${styles[props.position + "-panel"]} ${styles[ConfigLoader.config.entry] ?? ""} ${Array.isArray(panel.value) && panel.value.length > 4 ? styles["scroll-y-auto"] : ""}`}
        style={panelStyle.value}
      >
        <div class={[props.position + `-panel-box`, shouldFillTwoPeopleFlowCards.value ? styles["fill-two-people-flow-cards"] : ""]}>
          {panel.value}
        </div>
      </div>
    );
  },
});
