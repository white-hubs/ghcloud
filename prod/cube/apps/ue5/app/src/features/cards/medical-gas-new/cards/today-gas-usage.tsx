import moment from "moment";
import { computed, defineComponent, onMounted, ref } from "vue";

import CardTitleIcon from "@/features/cards/_shared/card-title-icon/card-title-icon";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { todayGasUsage } from "@/infrastructure/api/device";
import { getAssetsImage } from "@/infrastructure/utils/getImage";
import CountTo from "@/shared-ui/panel/count-to/count-to";
import NoData from "@/shared-ui/panel/noData";
import { useStateStore } from "@/visualization-core/stores/use-state-store";

import "./medical-gas-v2-shared.module.less";

const PANEL_CLASS = "visual-v2-sub-panel v2-panel-card medical-gas-v2-panel";
const GAS_ICON_LIST = ["gas0.png", "gas1.png", "gas2.png", "gas3.png", "gas4.png", "gas5.png"];

type GasUsageItem = {
  label: string;
  value: number;
  ratio: number;
  img: string;
};

export const TodayGasUsage = defineComponent({
  name: "TodayGasUsage",
  setup() {
    const { globalState } = useStateStore();
    const yData = ref<GasUsageItem[]>([]);
    const hasData = computed(() => yData.value.length > 0);

    const getGasUsage = async () => {
      const params = {
        sceneType: globalState.business.currentMenu,
        areaId: globalState.business.currentAreaId,
        period: [moment().format("YYYY-MM-DD 00:00:00"), moment().format("YYYY-MM-DD HH:mm:ss")].join(","),
      };
      const res = await todayGasUsage(params);
      const list = Array.isArray(res) ? res : [];
      yData.value = list.map((item: any, index: number) => ({
        label: item?.name || "--",
        value: Number(item?.num || 0),
        ratio: Number(item?.ratio || 0),
        img: getAssetsImage(GAS_ICON_LIST[index] || GAS_ICON_LIST[0]),
      }));
    };

    onMounted(() => {
      getGasUsage();
    });

    const renderRatio = (ratio: number): JSX.Element => (
      <div class={["medical-gas-ratio", ratio > 0 ? "is-up" : ""]}>
        <span>环比</span>
        <i />
        <strong>{ratio.toFixed(2)}%</strong>
      </div>
    );

    const renderBody = (isZoom: boolean): JSX.Element => (
      <div class={["medical-gas-v2-body", isZoom ? "is-zoom" : ""]} data-no-zoom>
        {hasData.value ? (
          <div class={["medical-gas-overview-grid", isZoom ? "is-zoom" : ""]}>
            {yData.value.map((item) => (
              <div class={["medical-gas-usage-card", "medical-gas-v2-surface"]} key={item.label}>
                <div class="medical-gas-usage-icon">
                  <img src={item.img} alt="" />
                </div>
                <div class="medical-gas-usage-info">
                  <span class="medical-gas-label" title={item.label}>
                    {item.label}
                  </span>
                  <div class="medical-gas-value-line">
                    <span class="medical-gas-value">
                      <CountTo startVal={0} endVal={item.value} duration={1600} separator="," />
                    </span>
                    <span class="medical-gas-unit">m³</span>
                  </div>
                  {renderRatio(item.ratio)}
                </div>
              </div>
            ))}
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
          title="今日气体使用概览"
          class={PANEL_CLASS}
          zoomable
          zoom-title="今日气体使用概览详情"
          zoom-width={860}
          v-slots={{
            titleIcon: () => <CardTitleIcon name="medical-gas-overview" />,
            default: () => renderBody(false),
            "zoom-content": () => renderBody(true),
          }}
        />
      </div>
    );
  },
});

export default TodayGasUsage;
