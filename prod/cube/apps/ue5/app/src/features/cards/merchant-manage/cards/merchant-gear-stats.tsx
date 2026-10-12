import { defineComponent, onMounted, ref } from "vue";

import CardTitleIcon from "@/features/cards/_shared/card-title-icon/card-title-icon";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { visualizationCount } from "@/infrastructure/api/merchant";
import CountTo from "@/shared-ui/panel/count-to/count-to";

import "./merchant-v2-shared.module.less";

import styles from "./merchant-gear-stats.module.less";

const PANEL_CLASS = "visual-v2-sub-panel v2-panel-card merchant-v2-panel";

export const MerchantGearStats = defineComponent({
  name: "MerchantGearStats",
  setup() {
    const merchant = ref([
      {
        name: "商户总数",
        value: 0,
        unit: "个",
        tone: "isMerchant",
      },
      {
        name: "档位总数",
        value: 0,
        unit: "个",
        tone: "isGear",
      },
    ]);

    const getMerchantData = async (): Promise<void> => {
      try {
        const res = await visualizationCount();
        merchant.value[0].value = Number(res?.merchantTotal) || 0;
        merchant.value[1].value = Number(res?.gearTotal) || 0;
      } catch {
        merchant.value[0].value = 0;
        merchant.value[1].value = 0;
      }
    };

    onMounted(() => {
      void getMerchantData();
    });

    const renderBody = (isZoom: boolean): JSX.Element => (
      <div class={["merchant-v2-body", styles.cardBody, isZoom ? styles.isZoom : ""]} data-no-zoom>
        <div class={styles.statGrid}>
          {merchant.value.map((item) => (
            <div class={[styles.statCard, styles[item.tone]]} key={item.name}>
              <span class={styles.statLabel}>{item.name}</span>
              <span class={styles.statValueRow}>
                <span class={styles.statValue}>
                  <CountTo startVal={0} endVal={item.value} duration={1200} separator="," />
                </span>
                <span class={styles.statUnit}>{item.unit}</span>
              </span>
            </div>
          ))}
        </div>
      </div>
    );

    return (): JSX.Element => (
      <div class="merchant-v2-root">
        <SubPanelTemplate
          title="商户/档位统计"
          class={PANEL_CLASS}
          zoomable
          zoom-title="商户/档位统计详情"
          zoom-width={680}
          v-slots={{
            titleIcon: () => <CardTitleIcon name="merchant-stat" />,
            default: () => renderBody(false),
            "zoom-content": () => renderBody(true),
          }}
        />
      </div>
    );
  },
});

export default MerchantGearStats;
