import { computed, defineComponent, ref, watch } from "vue";
import type { PropType } from "vue";

import { getEnergyUnitByTitle } from "../utils/energy-units";
import CountTo from "@/shared-ui/panel/count-to/count-to";
import NoData from "@/shared-ui/panel/noData";

import "./energy-analysis-body.module.less";

interface AnalysisItem {
  label: string;
  value: number;
  color: string;
}

interface AnalysisCategory {
  title: string;
  data: AnalysisItem[];
}

const TYPE_COLORS: Record<string, string> = {
  electric: "#26C2BC",
  water: "#2F8DFF",
  gas: "#FFAB10",
  other: "#7C61FF",
};

const getTypeClass = (title: string): string => {
  if (title.includes("电")) return "electric";
  if (title.includes("水")) return "water";
  if (title.includes("气") || title.includes("燃")) return "gas";
  return "other";
};

const getTypeShort = (title: string): string => title.slice(0, 1);

const getTypeColor = (title: string): string => TYPE_COLORS[getTypeClass(title)] ?? TYPE_COLORS.other;

export const EnergyAnalysisBody = defineComponent({
  name: "EnergyAnalysisBody",
  props: {
    categories: { type: Array as PropType<AnalysisCategory[]>, required: true },
    isZoom: { type: Boolean, default: false },
    expandAll: { type: Boolean, default: false },
  },
  setup(props) {
    const activeIndex = ref(0);

    watch(
      () => props.categories.length,
      () => {
        if (activeIndex.value >= props.categories.length) {
          activeIndex.value = 0;
        }
      },
    );

    const activeCategory = computed(() => props.categories[activeIndex.value]);

    const getCategoryTotal = (category: AnalysisCategory): number =>
      (category.data || []).reduce((sum, item) => sum + (item.value || 0), 0);

    const getCategoryMax = (category: AnalysisCategory): number => {
      const values = (category.data || []).map((item) => item.value || 0);
      return values.length ? Math.max(...values) : 0;
    };

    const getBarPercentForCategory = (category: AnalysisCategory | undefined, value?: number): number => {
      const max = getCategoryMax(category || { title: "", data: [] });
      if (!max) return 0;
      const percent = ((value || 0) / max) * 100;
      return Math.min(100, Math.max(4, percent));
    };

    const categoryTotal = computed(() => getCategoryTotal(activeCategory.value || { title: "", data: [] }));

    const getBarPercent = (value?: number): number => getBarPercentForCategory(activeCategory.value, value);

    const renderSummaryBanner = (category: AnalysisCategory, showGlow = false): JSX.Element => (
      <div class={["analysis-summary-banner", `is-${getTypeClass(category.title)}`]}>
        {showGlow ? <div class="analysis-summary-glow" aria-hidden="true"></div> : null}
        <div class="analysis-summary-inner">
          <div class="analysis-summary-icon" aria-hidden="true">
            <span>{getTypeShort(category.title)}</span>
          </div>
          <div class="analysis-summary-content">
            <div class="analysis-summary-label">{category.title}用能合计</div>
            <div class="analysis-summary-value-row">
              <CountTo class="analysis-summary-value" startVal={0} endVal={getCategoryTotal(category)} separator="" duration={2000} />
              {getEnergyUnitByTitle(category.title) ? (
                <span class="analysis-summary-unit">{getEnergyUnitByTitle(category.title)}</span>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    );

    const renderMetricRows = (category: AnalysisCategory): JSX.Element => {
      if (!category.data?.length) {
        return (
          <div class="analysis-empty">
            <NoData />
          </div>
        );
      }
      return (
        <>
          {category.data.map((item) => (
            <div class={["analysis-metric-row", `is-${getTypeClass(category.title)}`]} key={`${category.title}-${item.label}`}>
              <div class="analysis-row-body">
                <div class="analysis-row-head">
                  <span class="analysis-row-label" title={item.label}>
                    {item.label}
                  </span>
                  <span class="analysis-row-value">
                    <CountTo startVal={0} endVal={item.value} separator="" duration={2000} />
                    {getEnergyUnitByTitle(category.title) ? (
                      <span class="analysis-row-unit">{getEnergyUnitByTitle(category.title)}</span>
                    ) : null}
                  </span>
                </div>
                <div class="analysis-row-track">
                  <div
                    class="analysis-row-fill"
                    style={{
                      width: `${getBarPercentForCategory(category, item.value)}%`,
                      background: getTypeColor(category.title),
                    }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </>
      );
    };

    return (): JSX.Element => (
      <div class={["energy-analysis-body", props.isZoom ? "is-zoom" : "", props.expandAll ? "is-expand-all" : ""]}>
        {!props.expandAll ? (
          <div class="analysis-type-tabs" data-no-zoom>
            {props.categories.map((category, index) => (
              <button
                key={category.title}
                type="button"
                class={["analysis-type-tab", `is-${getTypeClass(category.title)}`, activeIndex.value === index ? "is-active" : ""]}
                onClick={() => {
                  activeIndex.value = index;
                }}
              >
                <span class="analysis-type-icon" aria-hidden="true">
                  {getTypeShort(category.title)}
                </span>
                <span class="analysis-type-label">{category.title}</span>
              </button>
            ))}
          </div>
        ) : null}

        {props.expandAll ? (
          props.categories.map((category) => (
            <div class={["analysis-expand-block", `is-${getTypeClass(category.title)}`]} key={`expand-${category.title}`}>
              {renderSummaryBanner(category)}
              <div class="analysis-metric-panel">{renderMetricRows(category)}</div>
            </div>
          ))
        ) : activeCategory.value ? (
          <>
            {renderSummaryBanner(activeCategory.value, true)}
            <div class="analysis-metric-panel">
              {!activeCategory.value.data?.length ? (
                <div class="analysis-empty">
                  <NoData />
                </div>
              ) : (
                activeCategory.value.data.map((item) => (
                  <div
                    class={["analysis-metric-row", `is-${getTypeClass(activeCategory.value!.title)}`]}
                    key={`${activeCategory.value!.title}-${item.label}`}
                  >
                    <div class="analysis-row-body">
                      <div class="analysis-row-head">
                        <span class="analysis-row-label" title={item.label}>
                          {item.label}
                        </span>
                        <span class="analysis-row-value">
                          <CountTo startVal={0} endVal={item.value} separator="" duration={2000} />
                          {getEnergyUnitByTitle(activeCategory.value!.title) ? (
                            <span class="analysis-row-unit">{getEnergyUnitByTitle(activeCategory.value!.title)}</span>
                          ) : null}
                        </span>
                      </div>
                      <div class="analysis-row-track">
                        <div
                          class="analysis-row-fill"
                          style={{
                            width: `${getBarPercent(item.value)}%`,
                            background: getTypeColor(activeCategory.value!.title),
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        ) : null}
      </div>
    );
  },
});

export default EnergyAnalysisBody;
