import { Skeleton } from "ant-design-vue";
import { computed, defineComponent, onMounted, ref } from "vue";

import { parkingStore } from "../../store/parking";
import { useParkArea } from "@/features/cards/parking-car/hooks/use-park-area";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { cubeParkingLotService } from "@/infrastructure/api/service";
import { getAssetsImage, getThemeImage } from "@/infrastructure/utils/getImage";
import CountTo from "@/shared-ui/panel/count-to/count-to";
import NoData from "@/shared-ui/panel/noData";
import { ProgressBar } from "@/shared-ui/panel/progress-bar/progress-bar";
import { useVisualTheme } from "@/visualization-core/hooks/use-visual-theme";

import "./parking-car-statistics-detail.module.less";

interface ParkingAreaItem {
  label: string;
  value: number;
  totalNum: number;
  [key: string]: unknown;
}

const parkingSpaceOverviewIcon = getThemeImage("parking-space-overview.png");

export const ParkingCarStatisticsDetail = defineComponent({
  name: "ParkingCarStatisticsDetail",
  setup() {
    const store = parkingStore();
    const { showParkArea } = useParkArea();
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

    const list = ref<ParkingAreaItem[]>([]);
    const loading = ref(true);

    const getData = async (): Promise<void> => {
      loading.value = true;
      try {
        const params = { source: "SELF_BUILT" };
        const result = await Promise.all([cubeParkingLotService.getParkingInfo(params), cubeParkingLotService.getParkingLotList(params)]);
        stats.value.total = result[0]?.totalNum ?? 0;
        stats.value.subStats[0].value = result[0]?.totalInNum ?? 0;
        stats.value.subStats[1].value = result[0]?.totalSpaceNum ?? 0;

        list.value = (result[1] ?? [])
          .map((item: any) => ({
            ...item,
            label: item?.name ?? item?.areaName ?? "",
            value: item?.totalSpaceNum ?? 0,
            totalNum: item?.totalNum ?? 0,
          }))
          ?.sort((a: ParkingAreaItem, b: ParkingAreaItem) => {
            if (b.value === a.value) {
              return b.totalNum - a.totalNum;
            }
            return b.value - a.value;
          });
      } catch {
        // ignore
      } finally {
        loading.value = false;
      }
    };

    const handleCurrent = (item: ParkingAreaItem): void => {
      store.updateCurrentParking(item);
      showParkArea();
    };

    onMounted(() => {
      getData();
    });

    const renderBody = (isZoom: boolean): JSX.Element => (
      <div class={["statistics-detail-v2", "parking-car-statistics-detail-v2-panel", isZoom ? "is-zoom" : ""]}>
        <div class={["stats-hero", isZoom ? "is-zoom" : ""]} data-no-zoom>
          <div class={["stats-hero-icon", isZoom ? "is-zoom" : ""]} aria-hidden="true">
            <img src={getAssetsImage("overView4.png")} alt="" />
            <img class="stats-hero-glyph" src={getAssetsImage(stats.value.icon)} alt="" />
          </div>
          <div class="stats-hero-content">
            <div class={["stats-hero-main", isZoom ? "is-zoom" : ""]}>
              <div class="stats-hero-label">{stats.value.title}</div>
              <div class="stats-hero-value-row">
                <CountTo class="stats-hero-value v2-metric-value" startVal={0} endVal={stats.value.total} separator="" duration={2000} />
                <span class="stats-hero-unit">个</span>
              </div>
            </div>
            <div class={["stats-hero-sub", isZoom ? "is-zoom" : ""]}>
              {stats.value.subStats.map((item) => (
                <div class="stats-hero-sub-item" key={`${isZoom ? "zoom-" : ""}${item.label}`}>
                  <span class="sub-label">{item.label}:</span>
                  <CountTo
                    class="sub-value"
                    style={{ color: subStatColorMap.value[item.colorKey] }}
                    startVal={0}
                    endVal={item.value}
                    separator=""
                    duration={2000}
                  />
                  <span class="sub-unit">个</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div class={["progress-list", isZoom ? "is-zoom" : ""]} data-no-zoom>
          {!loading.value && list.value.length === 0 && <NoData />}
          {loading.value && <Skeleton active paragraph={{ rows: isZoom ? 4 : 3 }} />}
          {list.value.map((item) => (
            <div class="progress-item" key={`${isZoom ? "zoom-" : ""}${item.label}`}>
              <ProgressBar
                detailMode="usage"
                valueLabel="空闲"
                remainLabel="占用"
                totalLabel="总车位"
                total={item.totalNum}
                label={item.label}
                value={item.value}
                unit="个"
                onClick={() => handleCurrent(item)}
              />
            </div>
          ))}
        </div>
      </div>
    );

    return () => (
      <div class="parking-car-statistics-detail-v2-root v2-panel-root">
        <SubPanelTemplate
          title="车位总览"
          class="visual-v2-sub-panel v2-panel-card parking-car-statistics-detail-v2-panel"
          zoomable
          zoom-title="车位总览详情"
          zoom-width={600}
          v-slots={{
            titleIcon: () => <img src={parkingSpaceOverviewIcon} alt="" class="title-card-icon" />,
            "zoom-content": () => renderBody(true),
            default: () => renderBody(false),
          }}
        />
      </div>
    );
  },
});

export default ParkingCarStatisticsDetail;
