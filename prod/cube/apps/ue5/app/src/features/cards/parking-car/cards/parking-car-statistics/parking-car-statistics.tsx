import { computed, defineComponent, onMounted, ref } from "vue";

import { parkingStore } from "../../store/parking";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { cubeParkingLotService } from "@/infrastructure/api/service";
import { getAssetsImage } from "@/infrastructure/utils/getImage";
import CountTo from "@/shared-ui/panel/count-to/count-to";
import { useVisualTheme } from "@/visualization-core/hooks/use-visual-theme";

import "./parking-car-statistics.module.less";

const TitleIcon = (): JSX.Element => (
  <span class="v2-title-icon" aria-hidden="true">
    <svg viewBox="0 0 24 24" class="v2-title-icon-svg">
      <path d="M4 6h16v12H4V6Zm2 2v8h12V8H6Zm2 2h3v4H8v-4Zm5 0h3v4h-3v-4Z" fill="currentColor" />
    </svg>
  </span>
);

export const ParkingCarStatistics = defineComponent({
  name: "ParkingCarStatistics",
  setup() {
    const store = parkingStore();
    const { currentTheme } = useVisualTheme();
    const isMinimalWhite = computed(() => currentTheme.value === "minimal-white");
    const subStatColorMap = computed(() => ({
      used: isMinimalWhite.value ? "#1a6fe8" : "#2989FF",
      free: isMinimalWhite.value ? "#0d8a9a" : "#19F8F7",
    }));

    const stats = ref({
      title: "车位总数",
      total: 0,
      icon: "overView30.png",
      subStats: [
        { label: "使用车位", value: 0, colorKey: "used" as const },
        { label: "空闲车位", value: 0, colorKey: "free" as const },
      ],
    });

    const getData = async (): Promise<void> => {
      try {
        const result = await cubeParkingLotService.getParkingDetail(store.currentParking?.id);
        stats.value.total = result.totalNum ?? 0;
        stats.value.subStats[0].value = result.totalInNum ?? 0;
        stats.value.subStats[1].value = result.totalSpaceNum ?? 0;
      } catch {}
    };

    onMounted(() => {
      getData();
    });

    const renderStatsBody = (isZoom: boolean): JSX.Element => (
      <div class={["v2-panel-body", "stats-body", isZoom ? "parking-statistics-v2-panel is-zoom" : ""]} data-no-zoom>
        <div class={["stats-wrapper", "parking-v2-metric-hero", isZoom ? "is-zoom" : ""]}>
          <div class="icon-wrapper">
            <img src={getAssetsImage("overView4.png")} alt="" />
            <img class="inner-icon" src={getAssetsImage(stats.value.icon)} alt="" />
          </div>
          <div class="stats-info">
            <div class="main-stat">
              <div class="stat-title">{stats.value.title}</div>
              <div class="main-value-row">
                <CountTo class="v2-metric-value main-value" startVal={0} endVal={stats.value.total} duration={2000} separator="" />
                <span class="main-unit">个</span>
              </div>
            </div>
            <div class="sub-stats">
              {stats.value.subStats.map((item) => (
                <div class="sub-stat-item" key={`${isZoom ? "zoom-" : ""}${item.label}`}>
                  {item.label}:
                  <CountTo
                    class="v2-metric-value sub-value"
                    startVal={0}
                    endVal={item.value}
                    style={{ color: subStatColorMap.value[item.colorKey] }}
                    duration={2000}
                    separator=""
                  />
                  <span class="sub-unit">个</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );

    return () => (
      <div class="v2-panel-root parking-statistics-v2-root">
        <SubPanelTemplate
          title="车位数量统计"
          class="visual-v2-sub-panel v2-panel-card parking-statistics-v2-panel"
          zoomable
          zoom-title="车位数量统计详情"
          zoom-width={720}
          v-slots={{
            titleIcon: () => <TitleIcon />,
            "zoom-content": () => renderStatsBody(true),
            default: () => renderStatsBody(false),
          }}
        />
      </div>
    );
  },
});

export default ParkingCarStatistics;
