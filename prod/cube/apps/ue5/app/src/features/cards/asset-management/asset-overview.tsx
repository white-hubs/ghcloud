import { computed, defineComponent, onMounted, ref } from "vue";

import CardTitleIcon from "@/features/cards/_shared/card-title-icon/card-title-icon";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { overdue } from "@/infrastructure/api/property";
import CountTo from "@/shared-ui/panel/count-to/count-to";
import DateInlineForm, { ModelValueItf } from "@/shared-ui/panel/dateInlineForm";

import "./_shared/asset-management-v2-shared.module.less";

import styles from "./asset-overview.module.less";

const PANEL_CLASS = "visual-v2-sub-panel v2-panel-card asset-management-v2-panel asset-management-card-theme access-control-card-theme";

interface AssetOverviewMetric {
  title: string;
  value: number;
  marker: string;
  unit: string;
  tone: string;
}

export const AssetOverview = defineComponent({
  name: "AssetOverview",
  setup() {
    const trendTime = ref<ModelValueItf>({ timeType: "TODAY", dateRange: [] });
    const visitingData = ref<AssetOverviewMetric[]>([
      { title: "资产总数", value: 0, marker: "总", unit: "个", tone: "isTotal" },
      { title: "资产总金额", value: 0, marker: "额", unit: "元", tone: "isAmount" },
      { title: "报修资产数", value: 0, marker: "修", unit: "个", tone: "isRepair" },
      { title: "报废资产数", value: 0, marker: "废", unit: "个", tone: "isScrap" },
      { title: "逾龄资产数", value: 0, marker: "龄", unit: "个", tone: "isOverAge" },
      { title: "到期资产数", value: 0, marker: "期", unit: "个", tone: "isExpire" },
    ]);
    const coreMetrics = computed(() => visitingData.value.slice(0, 2));
    const statusMetrics = computed(() => visitingData.value.slice(2));

    const getTemplateData = async (): Promise<void> => {
      try {
        const res = await overdue({ period: trendTime.value.dateRange.join(",") });
        visitingData.value[0].value = Number(res?.propertyNumber) || 0;
        visitingData.value[1].value = Number(res?.repairReportNumber) || 0;
        visitingData.value[2].value = Number(res?.weedOutNumber) || 0;
        visitingData.value[3].value = Number(res?.usageNumber) || 0;
        visitingData.value[4].value = Number(res?.maintenanceNumber) || 0;
        // 到期资产：接口若后续补充字段再映射，保持与旧逻辑一致不臆造字段
        if ((res as any)?.expireNumber != null || (res as any)?.dueNumber != null) {
          visitingData.value[5].value = Number((res as any).expireNumber ?? (res as any).dueNumber) || 0;
        }
      } catch {
        visitingData.value.forEach((item) => {
          item.value = 0;
        });
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
        <div class={styles.statsSurface}>
          <div class={styles.summaryGrid}>
            {coreMetrics.value.map((item) => (
              <div class={[styles.summaryCard, styles[item.tone]]} key={item.title}>
                <span class={styles.summaryMarker} aria-hidden="true">
                  {item.marker}
                </span>
                <span class={styles.summaryContent}>
                  <span class={styles.summaryLabel}>{item.title}</span>
                  <span class={styles.summaryValueRow}>
                    <span class={styles.summaryValue}>
                      <CountTo startVal={0} endVal={item.value} duration={2000} separator="," />
                    </span>
                    <span class={styles.summaryUnit}>{item.unit}</span>
                  </span>
                </span>
              </div>
            ))}
          </div>

          <div class={styles.statusGrid}>
            {statusMetrics.value.map((item) => (
              <div class={[styles.statItem, styles[item.tone]]} key={item.title}>
                <span class={styles.statHeading}>
                  <span class={styles.statMarker} aria-hidden="true">
                    {item.marker}
                  </span>
                  <span class={styles.statLabel}>{item.title}</span>
                </span>
                <span class={styles.statValueRow}>
                  <span class={styles.statValue}>
                    <CountTo startVal={0} endVal={item.value} duration={2000} separator="," />
                  </span>
                  <span class={styles.statUnit}>{item.unit}</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );

    return (): JSX.Element => (
      <div class="asset-management-v2-root v2-panel-root">
        <SubPanelTemplate
          title="资产概览"
          class={PANEL_CLASS}
          zoomable
          zoom-title="资产概览详情"
          zoom-width={860}
          v-slots={{
            titleIcon: () => <CardTitleIcon name="asset-management-overview" />,
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

export default AssetOverview;
