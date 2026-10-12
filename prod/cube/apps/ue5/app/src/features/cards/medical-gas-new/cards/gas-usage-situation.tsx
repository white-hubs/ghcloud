import { computed, defineComponent, onMounted, ref } from "vue";

import CardTitleIcon from "@/features/cards/_shared/card-title-icon/card-title-icon";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { todayGasUsageTop } from "@/infrastructure/api/device";
import CountTo from "@/shared-ui/panel/count-to/count-to";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";
import NoData from "@/shared-ui/panel/noData";
import { ModelValueItf } from "@/shared-ui/panel/types";
import { useStateStore } from "@/visualization-core/stores/use-state-store";

import "./medical-gas-v2-shared.module.less";

const PANEL_CLASS = "visual-v2-sub-panel v2-panel-card medical-gas-v2-panel";

type GasUsageRankItem = {
  name: string;
  num: number;
  ratio: number;
};

export const GasUsageSituation = defineComponent({
  name: "GasUsageSituation",
  setup() {
    const { globalState } = useStateStore();
    const trendTime = ref<ModelValueItf>({ timeType: "TODAY", dateRange: [] });
    const listData = ref<GasUsageRankItem[]>([]);
    const hasData = computed(() => listData.value.length > 0);

    const getTemplateData = async () => {
      const params = {
        sceneType: globalState.business.currentMenu,
        areaId: globalState.business.currentAreaId,
        period: trendTime.value.dateRange.join(","),
        type: trendTime.value.timeType,
      };
      const res = await todayGasUsageTop(params);
      listData.value = Array.isArray(res)
        ? res.map((item: any) => ({
            name: item?.name || "--",
            num: Number(item?.num || 0),
            ratio: Number(item?.ratio || 0),
          }))
        : [];
    };

    onMounted(() => {
      getTemplateData();
    });

    const renderToolbar = (): JSX.Element => (
      <div class="medical-gas-v2-toolbar" data-no-zoom>
        <DateInlineForm
          modelValue={trendTime.value}
          onUpdate:modelValue={(v) => {
            trendTime.value = v;
          }}
          onSearch={getTemplateData}
        />
      </div>
    );

    const renderRow = (item: GasUsageRankItem, index: number): JSX.Element => (
      <div class="medical-gas-rank-row" key={`${item.name}-${index}`}>
        <span class="medical-gas-rank-index">{index + 1}</span>
        <div class="medical-gas-rank-main">
          <span class="medical-gas-rank-name" title={item.name}>
            {item.name}
          </span>
          <span class="medical-gas-rank-meta">占比 {item.ratio.toFixed(2)}%</span>
        </div>
        <span class="medical-gas-rank-value">
          <CountTo startVal={0} endVal={item.num} duration={1400} separator="," />
          <small class="medical-gas-unit">m³</small>
        </span>
      </div>
    );

    const renderBody = (isZoom: boolean): JSX.Element => (
      <div class={["medical-gas-v2-body", isZoom ? "is-zoom" : ""]} data-no-zoom>
        {hasData.value ? (
          <div class={["medical-gas-list", "medical-gas-v2-surface", isZoom ? "is-zoom" : ""]}>
            <div class="medical-gas-list-scroll">{listData.value.map(renderRow)}</div>
          </div>
        ) : (
          <div class={["medical-gas-v2-empty", "medical-gas-v2-surface", isZoom ? "is-zoom" : ""]}>
            <NoData />
          </div>
        )}
      </div>
    );

    return (): JSX.Element => (
      <div class="medical-gas-v2-root">
        <SubPanelTemplate
          title="气体用量情况"
          class={PANEL_CLASS}
          zoomable
          zoom-title="气体用量情况详情"
          zoom-width={760}
          v-slots={{
            titleIcon: () => <CardTitleIcon name="medical-gas-ranking" />,
            extra: renderToolbar,
            default: () => renderBody(false),
            "zoom-content": () => renderBody(true),
          }}
        />
      </div>
    );
  },
});

export default GasUsageSituation;
