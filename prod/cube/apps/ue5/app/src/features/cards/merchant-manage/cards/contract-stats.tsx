import { computed, defineComponent, onMounted, reactive, ref } from "vue";

import CardTitleIcon from "@/features/cards/_shared/card-title-icon/card-title-icon";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { visualizationContractCount } from "@/infrastructure/api/merchant";
import PlanPie from "@/shared-ui/panel/charts/pie/planePie";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";
import NoData from "@/shared-ui/panel/noData";
import { ModelValueItf } from "@/shared-ui/panel/types";

import "./merchant-v2-shared.module.less";

const PANEL_CLASS = "visual-v2-sub-panel v2-panel-card merchant-v2-panel";
const COLORS = ["#328BF7", "#FFC700", "#19F8F7", "#EF424A", "#7C5CFF"];

export const ContractStats = defineComponent({
  name: "ContractStats",
  setup() {
    const proportionTime = ref<ModelValueItf>({
      timeType: "TODAY",
      dateRange: [],
    });
    const roundPieData = reactive({
      arr: [] as any[],
      throughNum: 0,
    });
    const hasData = computed(() => roundPieData.arr.some((item) => Number(item.value || 0) > 0));

    const changeProportionTime = async () => {
      const res = await visualizationContractCount({ period: proportionTime.value.dateRange.join(",") });
      const list = Array.isArray(res) ? res : [];
      roundPieData.throughNum = 0;
      roundPieData.arr = list.map((item: any, index: number) => {
        const value = Number(item?.value || 0);
        roundPieData.throughNum += value;
        return {
          label: item?.name || "--",
          value,
          color: COLORS[index % COLORS.length],
        };
      });
    };

    onMounted(() => {
      changeProportionTime();
    });

    const renderExtra = (): JSX.Element => (
      <DateInlineForm
        modelValue={proportionTime.value}
        onUpdate:modelValue={(v) => {
          proportionTime.value = v;
        }}
        onSearch={changeProportionTime}
      />
    );

    const renderBody = (isZoom: boolean): JSX.Element => (
      <div class={["merchant-v2-body", isZoom ? "is-zoom" : ""]} data-no-zoom>
        {hasData.value ? (
          <div class={["merchant-v2-pie-layout", isZoom ? "is-zoom" : ""]}>
            <div class="merchant-v2-pie-wrap">
              <PlanPie pie-data={roundPieData.arr} showZeroAsEmptyRing>
                <div class="merchant-v2-pie-center">
                  <strong>
                    {roundPieData.throughNum}
                    <small>份</small>
                  </strong>
                  <span>合同总数</span>
                </div>
              </PlanPie>
            </div>
            <div class="merchant-v2-legend-list">
              {roundPieData.arr.map((item) => (
                <div class="merchant-v2-legend-row" key={item.label}>
                  <span class="merchant-v2-legend-name" title={item.label}>
                    <i style={{ background: item.color }} />
                    {item.label}
                  </span>
                  <span class="merchant-v2-legend-value">
                    {item.value}
                    <small>份</small>
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div class={["merchant-v2-empty", isZoom ? "is-zoom" : ""]}>
            <NoData />
          </div>
        )}
      </div>
    );

    return (): JSX.Element => (
      <div class="merchant-v2-root">
        <SubPanelTemplate
          title="商户合同统计"
          class={PANEL_CLASS}
          zoomable
          zoom-title="商户合同统计详情"
          zoom-width={760}
          v-slots={{
            titleIcon: () => <CardTitleIcon name="merchant-contract" />,
            extra: renderExtra,
            default: () => renderBody(false),
            "zoom-content": () => renderBody(true),
          }}
        />
      </div>
    );
  },
});

export default ContractStats;
