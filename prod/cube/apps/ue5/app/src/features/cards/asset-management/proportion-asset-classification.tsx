import { computed, defineComponent, onMounted, ref } from "vue";

import CardTitleIcon from "@/features/cards/_shared/card-title-icon/card-title-icon";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { getPropertyByType } from "@/infrastructure/api/property";
import RoundPie from "@/shared-ui/panel/charts/roundPie/roundPie";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";
import { ModelValueItf } from "@/shared-ui/panel/types";

import "./_shared/asset-management-v2-shared.module.less";

import styles from "./proportion-asset-classification.module.less";

const PANEL_CLASS = "visual-v2-sub-panel v2-panel-card asset-management-v2-panel asset-management-card-theme access-control-card-theme";
const COLORS = ["#328BF7", "#FFC700", "#19F8F7", "#EF424A", "#00F27B", "#FF6E23"];

type ClassItem = {
  name: string;
  value: number;
  color: string;
  percent: number;
};

export const ProportionAssetClassification = defineComponent({
  name: "ProportionAssetClassification",
  setup() {
    const trendTime = ref<ModelValueItf>({ timeType: "TODAY", dateRange: [] });
    const items = ref<ClassItem[]>([]);
    const classificationTotal = computed(() => items.value.reduce((sum, item) => sum + item.value, 0));
    const ringData = computed(() => items.value.map((item) => ({ label: item.name, value: item.value, color: item.color })));

    const getTemplateData = async (): Promise<void> => {
      try {
        const res = await getPropertyByType({ period: trendTime.value.dateRange.join(",") });
        const rows = Array.isArray(res) ? res : [];
        let sum = 0;
        const mapped = rows.map((e: { name?: string; value?: number }, i: number) => {
          const value = Number(e.value) || 0;
          sum += value;
          return {
            name: String(e.name || "--"),
            value,
            color: COLORS[i % COLORS.length],
            percent: 0,
          };
        });
        const base = sum || 1;
        items.value = mapped.map((item) => ({
          ...item,
          percent: Math.round((item.value / base) * 1000) / 10,
        }));
      } catch {
        items.value = [];
      }
    };

    onMounted(() => {
      void getTemplateData();
    });

    const renderBody = (isZoom: boolean): JSX.Element => (
      <div
        class={[
          styles.cardBody,
          isZoom ? styles.zoomBody : "",
          "asset-management-card-body",
          isZoom ? ["asset-management-v2-panel", "asset-management-card-theme", "access-control-card-theme", "is-zoom"] : "",
        ]}
        data-no-zoom
      >
        <div class={[styles.pieSurface, "asset-management-analysis-surface"]}>
          <div class={styles.chartWrap}>
            <RoundPie data={ringData.value} eventNum={0}>
              <div class={styles.pieCenter}>
                <strong>
                  {classificationTotal.value}
                  <small class={styles.pieUnit}>个</small>
                </strong>
                <small>资产总数</small>
              </div>
            </RoundPie>
          </div>
          <div class={styles.legendWrap}>
            {items.value.map((item, index) => (
              <div class={styles.legendItem} key={`${item.name}-${index}`}>
                <div class={styles.legendName} title={item.name}>
                  <i style={{ backgroundColor: item.color }} />
                  <span>{item.name}</span>
                </div>
                <div class={styles.legendMetrics}>
                  <span class={styles.legendValue}>
                    {item.value}
                    <small>个</small>
                  </span>
                  <span class={styles.legendRatio}>占比 {item.percent}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );

    return (): JSX.Element => (
      <div class="asset-management-v2-root v2-panel-root">
        <SubPanelTemplate
          title="资产分类占比"
          class={PANEL_CLASS}
          zoomable
          zoom-title="资产分类占比详情"
          zoom-width={820}
          v-slots={{
            titleIcon: () => <CardTitleIcon name="asset-management-classification" />,
            extra: () => (
              <div class="asset-management-header-toolbar" data-no-zoom>
                <DateInlineForm
                  modelValue={trendTime.value}
                  onUpdate:modelValue={(v) => {
                    trendTime.value = v;
                  }}
                  onSearch={getTemplateData}
                />
              </div>
            ),
            "zoom-content": () => renderBody(true),
            default: () => renderBody(false),
          }}
        />
      </div>
    );
  },
});

export default ProportionAssetClassification;
