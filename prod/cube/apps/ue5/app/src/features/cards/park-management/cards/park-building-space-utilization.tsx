import { computed, defineComponent, onMounted, reactive, ref, provide } from "vue";

import CardTitleIcon from "@/features/cards/_shared/card-title-icon/card-title-icon";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { buildingUtilizationRate } from "@/infrastructure/api/park";
import StackedColumn from "@/shared-ui/panel/charts/stacked-column/stackedColumn";
import NoData from "@/shared-ui/panel/noData";
import { panelCardLoadedKey } from "@/shared-ui/panel/panel-card-loaded-context";
import PanelCardLoading from "@/shared-ui/panel/panel-card-loading";

import "@/features/cards/access-control/_shared/access-control-v2-shared.module.less";
import "./park-management-v2-shared.module.less";

export const ParkBuildingSpaceUtilization = defineComponent({
  name: "ParkBuildingSpaceUtilization",
  props: {
    title: { type: String, required: false, default: "楼栋空间利用率" },
  },
  setup(props) {
    const loaded = ref(false);
    provide(panelCardLoadedKey, loaded);
    const buildUtilization = reactive({
      xData: [] as string[],
      yData: [
        { name: "使用面积", data: [] as number[] },
        { name: "停用面积", data: [] as number[] },
      ],
    });

    const hasChartData = computed(() => buildUtilization.xData.length > 0);

    const getBuildingUtilizationRate = async (): Promise<void> => {
      try {
        const res = await buildingUtilizationRate();
        const list = Array.isArray(res) ? res : [];
        buildUtilization.xData = list.map((item: { areaName?: string }) => item.areaName || "--");
        buildUtilization.yData[0].data = list.map((item: { useArea?: number }) => Number(item.useArea) || 0);
        buildUtilization.yData[1].data = list.map((item: { disabledArea?: number }) => Number(item.disabledArea) || 0);
      } catch {
        buildUtilization.xData = [];
        buildUtilization.yData[0].data = [];
        buildUtilization.yData[1].data = [];
      } finally {
        loaded.value = true;
      }
    };

    onMounted(() => {
      void getBuildingUtilizationRate();
    });

    const renderBody = (isZoom: boolean): JSX.Element => (
      <div class={["park-manage-v2-body", isZoom ? "is-zoom" : ""]} data-no-zoom>
        <div class="park-manage-chart-surface" data-no-zoom>
          {!loaded.value ? (
            <PanelCardLoading zoom={isZoom} />
          ) : hasChartData.value ? (
            <div class="park-manage-chart">
              <StackedColumn unit="㎡" xData={buildUtilization.xData} yData={buildUtilization.yData} />
            </div>
          ) : (
            <div class={["park-manage-empty", isZoom ? "is-zoom" : ""]}>
              <NoData />
            </div>
          )}
        </div>
      </div>
    );

    return (): JSX.Element => (
      <div class="v2-panel-root park-manage-v2-root">
        <SubPanelTemplate
          title={props.title}
          class="visual-v2-sub-panel v2-panel-card access-control-v2-panel access-control-card-theme park-manage-v2-panel"
          zoomable
          zoom-title={`${props.title}详情`}
          zoom-width={900}
          v-slots={{
            titleIcon: () => <CardTitleIcon name="asset-management-department" />,
            default: () => renderBody(false),
            "zoom-content": () => renderBody(true),
          }}
        />
      </div>
    );
  },
});

export default ParkBuildingSpaceUtilization;
