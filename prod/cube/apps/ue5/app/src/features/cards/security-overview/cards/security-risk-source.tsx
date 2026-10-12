import { computed, defineComponent, onMounted, ref, provide } from "vue";

import CardTitleIcon from "@/features/cards/_shared/card-title-icon/card-title-icon";
import ModalAssetTable from "@/features/cards/security-overview/components/modal-asset-table";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { sourceArchiveStatistics } from "@/infrastructure/api/property";
import { getThemeImage } from "@/infrastructure/utils/getImage";
import ElevatorAnalysisPie from "@/shared-ui/panel/charts/pie/elevator-analysis-pie";
import CountTo from "@/shared-ui/panel/count-to/count-to";
import NoData from "@/shared-ui/panel/noData";
import { panelCardLoadedKey } from "@/shared-ui/panel/panel-card-loaded-context";
import PanelCardLoading from "@/shared-ui/panel/panel-card-loading";

import "@/features/cards/access-control/_shared/access-control-v2-shared.module.less";
import "@/features/cards/overview/cards/overview-v2-shared.module.less";
import "./security-risk-source.module.less";

const riskTotalIcon = getThemeImage("device-total.png");
const riskExpireIcon = getThemeImage("alarm-count-unhandled.png");

interface RiskSourceStat {
  value: number;
  name: string;
  type: string;
  className: string;
  iconSrc: string;
}

interface RiskSourcePieItem {
  name: string;
  value: number;
  color: string;
  typeCode?: string;
  rate?: number;
}

export const SecurityRiskSource = defineComponent({
  name: "SecurityRiskSource",
  props: {
    title: { type: String, required: false, default: "风险源分析" },
  },
  setup(props) {
    const titleName = ref("风险源");
    const obj: Record<string, string> = {
      13587423: "可巡检项",
    };
    const currentEnvironment = JSON.parse(sessionStorage.getItem("GH-NowEnterprise") ?? "null")?.code;
    titleName.value = obj[currentEnvironment] || "风险源";
    const assetModalShow = ref(false);
    const monitorPanelData = ref<RiskSourceStat[]>([
      {
        value: 0,
        name: `${titleName.value}总数`,
        type: "all",
        className: "is-total",
        iconSrc: riskTotalIcon,
      },
      {
        value: 0,
        name: `已到期${titleName.value}`,
        type: "risk",
        className: "is-expire",
        iconSrc: riskExpireIcon,
      },
    ]);
    const colors = ["#94BAF9", "#67B9C1", "#3F7CDF", "#D1AE8A", "#EDBA55"];
    const pieData = ref<RiskSourcePieItem[]>([]);
    const loaded = ref(false);
    provide(panelCardLoadedKey, loaded);
    const hasStructure = computed(() => pieData.value.length > 0);
    const assetParameter = ref<Record<string, any>>({});

    async function changeHandleRiskTime(): Promise<void> {
      try {
        const res = await sourceArchiveStatistics();
        monitorPanelData.value[0].value = res.totalNum;
        monitorPanelData.value[1].value = res.expirationNum;
        const list = Array.isArray(res.typeVOList) ? res.typeVOList : [];
        const sum = list.reduce((acc: number, e: { totalNum?: number }) => acc + (Number(e.totalNum) || 0), 0) || 1;
        pieData.value = list.map((e, i) => {
          const value = Number(e.totalNum) || 0;
          return {
            ...e,
            color: colors[i % colors.length],
            value,
            name: e.typeName.split("/").length > 1 ? e.typeName.split("/")[1] : e.typeName,
            rate: Math.round((value / sum) * 1000) / 10,
          };
        });
      } catch {
        pieData.value = [];
      } finally {
        loaded.value = true;
      }
    }

    const clearPanelGhost = (): void => {
      document.querySelectorAll(".sub-panel-drag-ghost").forEach((node) => node.remove());
    };

    const openAssetModal = (parameter: Record<string, any> = {}): void => {
      clearPanelGhost();
      assetParameter.value = parameter;
      assetModalShow.value = true;
    };

    const stopPanelZoomEvent = (event?: Event): void => {
      event?.stopPropagation();
    };

    const handelClickAssets = (item?: any): void => {
      if (item?.data?.originData) {
        item = item.data.originData;
      }
      if (item?.type === "all") {
        openAssetModal();
        return;
      }
      if (item?.type === "risk") {
        openAssetModal({ status: "EXPIRE" });
        return;
      }
      const typeCode = item?.typeCode ?? item?.typeId ?? item?.id;
      openAssetModal(typeCode ? { typeCode } : {});
    };

    const assetClickAssets = (item: any): void => {
      if (!item) return;
      if (item?.data?.originData) {
        item = item.data.originData;
      }
      const typeCode = item.typeCode ?? item.typeId ?? item.id;
      openAssetModal(typeCode ? { typeCode } : {});
    };

    const closeModal = (): void => {
      assetModalShow.value = false;
    };

    onMounted(() => {
      void changeHandleRiskTime();
    });

    const renderStatCards = (): JSX.Element => (
      <div class="safe-risk-source-stats">
        {monitorPanelData.value.map((item) => (
          <button
            type="button"
            class={["safe-risk-source-stat", item.className]}
            key={item.type}
            onPointerdown={stopPanelZoomEvent}
            onClick={(event) => {
              stopPanelZoomEvent(event);
              handelClickAssets(item);
            }}
          >
            <span class="risk-source-stat-icon">
              <img src={item.iconSrc} alt="" />
            </span>
            <span class="risk-source-stat-main">
              <span class="risk-source-stat-label">{item.name}</span>
              <span class="risk-source-stat-value">
                <CountTo startVal={0} endVal={item.value} separator="" duration={1600} />
              </span>
            </span>
          </button>
        ))}
      </div>
    );

    const renderLegend = (isZoom: boolean): JSX.Element => (
      <div class={["safe-risk-legend", isZoom ? "is-zoom" : ""]}>
        {pieData.value.map((item) => (
          <button
            type="button"
            class="safe-risk-legend-item"
            key={item.typeCode || item.name}
            onPointerdown={stopPanelZoomEvent}
            onClick={(event) => {
              stopPanelZoomEvent(event);
              assetClickAssets(item);
            }}
          >
            <span class="safe-risk-legend-name">
              <i class="safe-risk-legend-dot" style={{ backgroundColor: item.color }} />
              <span class="safe-risk-legend-name-text" title={item.name}>
                {item.name}
              </span>
            </span>
            <span class="safe-risk-legend-value">
              {item.value}
              <em class="safe-risk-legend-unit">个</em>
            </span>
          </button>
        ))}
      </div>
    );

    const renderBody = (isZoom: boolean): JSX.Element => (
      <div class={["overview-v2-body safe-risk-source-body", isZoom ? "is-zoom" : ""]} data-no-zoom>
        {renderStatCards()}
        <div class={["overview-v2-pie-row", isZoom ? "is-zoom" : ""]} data-no-zoom>
          {!loaded.value ? (
            <PanelCardLoading zoom={isZoom} />
          ) : hasStructure.value ? (
            <>
              <div class={["safe-risk-pie-wrap", isZoom ? "is-zoom" : ""]}>
                <ElevatorAnalysisPie class="overview-v2-pie" pie-class="overview-v2-pie-chart" pieData={pieData.value}>
                  <div
                    class="overview-v2-pie-center is-clickable"
                    onPointerdown={stopPanelZoomEvent}
                    onClick={(event) => {
                      stopPanelZoomEvent(event);
                      handelClickAssets(monitorPanelData.value[0]);
                    }}
                  >
                    <div class="total-num">
                      <CountTo startVal={0} endVal={monitorPanelData.value[0]?.value ?? 0} separator="" duration={1600} />
                    </div>
                    <div>{titleName.value}总数</div>
                  </div>
                </ElevatorAnalysisPie>
              </div>
              {renderLegend(isZoom)}
            </>
          ) : (
            <div
              class={["overview-v2-empty safe-risk-source-empty", isZoom ? "is-zoom" : ""]}
              onPointerdown={stopPanelZoomEvent}
              onClick={(event) => {
                stopPanelZoomEvent(event);
                handelClickAssets(monitorPanelData.value[0]);
              }}
            >
              <NoData />
            </div>
          )}
        </div>
      </div>
    );

    return (): JSX.Element => (
      <>
        <div class="v2-panel-root overview-v2-root">
          <SubPanelTemplate
            title={props.title}
            class="visual-v2-sub-panel v2-panel-card access-control-v2-panel access-control-card-theme overview-v2-panel safe-overview-panel safe-risk-source-panel"
            zoomable
            zoom-title={`${props.title}详情`}
            zoom-width={720}
            v-slots={{
              titleIcon: () => <CardTitleIcon name="overview-management" />,
              default: () => renderBody(false),
              "zoom-content": () => renderBody(true),
            }}
          />
        </div>
        {assetModalShow.value && <ModalAssetTable showModal={assetModalShow.value} onClose={closeModal} parameter={assetParameter.value} />}
      </>
    );
  },
});

export default SecurityRiskSource;
