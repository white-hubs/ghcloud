import { defineComponent, onMounted, ref, provide } from "vue";

import CardTitleIcon from "@/features/cards/_shared/card-title-icon/card-title-icon";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { rentalTrends } from "@/infrastructure/api/park";
import LineChart from "@/shared-ui/panel/lineChart";
import NoData from "@/shared-ui/panel/noData";
import { panelCardLoadedKey } from "@/shared-ui/panel/panel-card-loaded-context";
import PanelCardLoading from "@/shared-ui/panel/panel-card-loading";

import "@/features/cards/access-control/_shared/access-control-v2-shared.module.less";
import "./park-management-v2-shared.module.less";

export const ParkLeasingTrends = defineComponent({
  name: "ParkLeasingTrends",
  props: {
    title: { type: String, required: false, default: "园区租赁趋势" },
  },
  setup(props) {
    const loaded = ref(false);
    provide(panelCardLoadedKey, loaded);
    const xData = ref<string[]>([]);
    const yData = ref<{ name: string; data: number[] }[]>([{ name: "租赁数量", data: [] }]);

    const getRentalTrends = async (): Promise<void> => {
      try {
        const res = await rentalTrends();
        const titles = Array.isArray(res?.xtitle) ? res.xtitle : [];
        const trends = Array.isArray(res?.rentalTrends) ? res.rentalTrends : [];
        xData.value = titles.map((item) => `${item}月`);
        yData.value = [
          {
            name: "租赁数量",
            data: titles.map((xItem) => {
              const hit = trends.find((item) => item.timeFlag === xItem);
              return Number(hit?.num) || 0;
            }),
          },
        ];
      } catch {
        xData.value = [];
        yData.value = [{ name: "租赁数量", data: [] }];
      } finally {
        loaded.value = true;
      }
    };

    onMounted(() => {
      void getRentalTrends();
    });

    const renderBody = (isZoom: boolean): JSX.Element => (
      <div class={["park-manage-v2-body", isZoom ? "is-zoom" : ""]} data-no-zoom>
        <div class="park-manage-chart-surface" data-no-zoom>
          {!loaded.value ? (
            <PanelCardLoading zoom={isZoom} />
          ) : xData.value.length > 0 ? (
            <div class="park-manage-chart">
              <LineChart
                x-data={xData.value}
                series={yData.value}
                showLegend={false}
                showBackground={false}
                titles={[""]}
                gridTop="28"
                unit={{ x: "", y: "家" }}
                axisPointer={true}
              />
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
            titleIcon: () => <CardTitleIcon name="asset-management-outbound" />,
            default: () => renderBody(false),
            "zoom-content": () => renderBody(true),
          }}
        />
      </div>
    );
  },
});

export default ParkLeasingTrends;
