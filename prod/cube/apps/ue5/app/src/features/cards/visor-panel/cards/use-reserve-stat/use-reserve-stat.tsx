import { computed, defineComponent, onMounted, ref, provide } from "vue";

import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { cubeVisitorManagementService } from "@/infrastructure/api/service";
import { getThemeImage } from "@/infrastructure/utils/getImage";
import ElevatorAnalysisPie from "@/shared-ui/panel/charts/pie/elevator-analysis-pie";
import NoData from "@/shared-ui/panel/noData";
import { panelCardLoadedKey } from "@/shared-ui/panel/panel-card-loaded-context";
import PanelCardLoading from "@/shared-ui/panel/panel-card-loading";
import { useVisualTheme } from "@/visualization-core/hooks/use-visual-theme";

import "./use-reserve-stat.module.less";

const titleIcon = getThemeImage("device-situation.png");

type PieItem = { name: string; value: number; color: string };

export const UseReserveStat = defineComponent({
  name: "UseReserveStat",
  setup() {
    const { currentTheme } = useVisualTheme();
    const isMinimalWhite = computed(() => currentTheme.value === "minimal-white");
    const pieRingVariant = computed(() => (isMinimalWhite.value ? "clean" : "default"));

    const pieData = ref<PieItem[]>([
      { name: "未使用", value: 0, color: "#F14545" },
      { name: "已使用", value: 0, color: "#2989FF" },
    ]);
    const total = ref(0);
    const loaded = ref(false);
    provide(panelCardLoadedKey, loaded);
    const hasData = computed(() => pieData.value.some((item) => item.value > 0));

    const getData = async (): Promise<void> => {
      try {
        const params = { pageSize: 999999, pageNumber: 1 };
        const resList = await Promise.all([
          cubeVisitorManagementService.getReservationRecordPage({ ...params, statusList: "0,1" }),
          cubeVisitorManagementService.getReservationRecordPage({ ...params, statusList: "3,4" }),
        ]);
        pieData.value = [
          { name: "未使用", value: Number(resList[0]?.total ?? 0), color: "#F14545" },
          { name: "已使用", value: Number(resList[1]?.total ?? 0), color: "#2989FF" },
        ];
        total.value = pieData.value.reduce((sum, item) => sum + item.value, 0);
      } catch {
        pieData.value = [
          { name: "未使用", value: 0, color: "#F14545" },
          { name: "已使用", value: 0, color: "#2989FF" },
        ];
        total.value = 0;
      } finally {
        loaded.value = true;
      }
    };

    onMounted(() => {
      void getData();
    });

    const renderBody = (isZoom: boolean): JSX.Element => (
      <div class={["visor-use-reserve-body", isZoom ? "is-zoom" : ""]} data-no-zoom>
        {!loaded.value ? (
          <PanelCardLoading zoom={isZoom} />
        ) : !hasData.value ? (
          <div class={["empty-panel", isZoom ? "is-zoom" : ""]}>
            <NoData />
          </div>
        ) : (
          <div class={["device-chart-row", isZoom ? "is-zoom" : "", isMinimalWhite.value ? "is-clean-ring" : ""]}>
            <div class={["chart-pie-wrap", isZoom ? "is-zoom" : ""]}>
              <ElevatorAnalysisPie
                class="elevator-analysis-left"
                radius={isMinimalWhite.value ? "78" : "75"}
                ringVariant={pieRingVariant.value}
                pieData={pieData.value}
              >
                <div class="pie-center-value">{total.value}</div>
                <div class="pie-center-label">预约总数</div>
              </ElevatorAnalysisPie>
            </div>
            <div class={["legend-list", isZoom ? "is-zoom" : ""]}>
              {pieData.value.map((item) => (
                <div class="legend-item" key={item.name}>
                  <div class="legend-left">
                    <span class="legend-color" style={{ background: item.color }} />
                    <span class="legend-name">{item.name}</span>
                  </div>
                  <span class="legend-value">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );

    return () => (
      <div class="v2-panel-root visor-use-reserve-v2-root">
        <SubPanelTemplate
          title="预约使用情况"
          class="visual-v2-sub-panel v2-panel-card visor-use-reserve-v2-panel"
          zoomable
          zoom-title="预约使用情况详情"
          zoom-width={640}
          v-slots={{
            titleIcon: () => <img src={titleIcon} alt="" class="title-icon-img" />,
            default: () => renderBody(false),
            "zoom-content": () => renderBody(true),
          }}
        />
      </div>
    );
  },
});

export default UseReserveStat;
