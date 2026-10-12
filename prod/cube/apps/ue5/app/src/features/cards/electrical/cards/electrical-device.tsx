import { computed, defineComponent, onBeforeUnmount, onMounted, reactive, ref, watch, provide } from "vue";

import ModalEquipmentAllTable from "@/features/equipment/modal-table/modal-equipmentAll-table";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { getDeviceNumber } from "@/infrastructure/api/device";
import { getThemeImage } from "@/infrastructure/utils/getImage";
import { buildVisualDeviceNumberParams, buildVisualMenuTagCodes } from "@/infrastructure/utils/visual-menu-tag";
import ElevatorAnalysisPie from "@/shared-ui/panel/charts/pie/elevator-analysis-pie";
import CountTo from "@/shared-ui/panel/count-to/count-to";
import NoData from "@/shared-ui/panel/noData";
import { panelCardLoadedKey } from "@/shared-ui/panel/panel-card-loaded-context";
import PanelCardLoading from "@/shared-ui/panel/panel-card-loading";
import useCommon from "@/visualization-core/hooks/useCommon";
import { useStateStore } from "@/visualization-core/stores/use-state-store";

import styles from "./electrical-device.module.less";

const deviceSituationIcon = getThemeImage("device-situation.png");
const deviceTotalIcon = getThemeImage("device-total.png");
const deviceOnlineIcon = getThemeImage("device-total-online.png");
const deviceOfflineIcon = getThemeImage("device-total-offline.png");

const GENRE_COLORS = ["#2B7FFF", "#4DA6FF", "#00C2E0", "#7EB8FF", "#F6C343", "#655DD1"];

type GenreItem = {
  name: string;
  value: number;
  color: string;
  percent: number;
};

type StatusFilter = "TOTAL" | "ONLINE" | "OFFLINE";

export const ElectricalDevice = defineComponent({
  name: "ElectricalDevice",
  setup() {
    const { globalState } = useStateStore();
    const { getEquipmentNumber } = useCommon();

    const loaded = ref(false);
    provide(panelCardLoadedKey, loaded);
    const deviceNum = ref(0);
    const onlineNum = ref(0);
    const offlineNum = ref(0);
    const genreList = ref<GenreItem[]>([]);
    const deviceModalShow = ref(false);
    const deviceParameter = reactive({
      anyAreaId: undefined as string | undefined,
      deviceState: undefined as boolean | undefined,
      filterAreaIds: [] as string[],
      tagCodes: buildVisualMenuTagCodes(globalState.business.currentMenu),
    });

    let timer: ReturnType<typeof setInterval> | null = null;

    const hasGenreData = computed(() => genreList.value.length > 0);

    const openDeviceList = (filter: StatusFilter = "TOTAL"): void => {
      deviceParameter.tagCodes = buildVisualMenuTagCodes(globalState.business.currentMenu);
      deviceParameter.filterAreaIds = [];
      deviceParameter.anyAreaId = globalState.business.currentAreaId;
      if (filter === "ONLINE") {
        deviceParameter.deviceState = true;
      } else if (filter === "OFFLINE") {
        deviceParameter.deviceState = false;
      } else {
        deviceParameter.deviceState = undefined;
      }
      deviceModalShow.value = true;
    };

    const loadData = async (): Promise<void> => {
      try {
        const menuId = globalState.business.currentMenu;
        const areaId = globalState.business.currentAreaId;
        const [countRes, genreRes] = await Promise.all([
          getDeviceNumber({ ...buildVisualDeviceNumberParams(menuId), areaId }).catch(() => undefined),
          getEquipmentNumber().catch(() => undefined),
        ]);

        if (countRes) {
          deviceNum.value = Number(countRes.totalNumber) || 0;
          onlineNum.value = Number(countRes.normalNumber) || 0;
          offlineNum.value = Number(countRes.offlineNumber) || 0;
        } else {
          deviceNum.value = Number(genreRes?.deviceNum) || 0;
          const statusNums = Array.isArray(genreRes?.deviceStatusNums) ? genreRes.deviceStatusNums : [];
          onlineNum.value = Number(statusNums.find((item: { name?: string }) => item.name === "NORMAL")?.num) || 0;
          offlineNum.value = Number(statusNums.find((item: { name?: string }) => item.name === "OFFLINE")?.num) || 0;
        }

        const genres = Array.isArray(genreRes?.deviceGenreNums) ? genreRes.deviceGenreNums : [];
        const sum = genres.reduce((acc, item) => acc + (Number(item.num) || 0), 0) || deviceNum.value || 1;
        genreList.value = genres.map((item, index) => {
          const value = Number(item.num) || 0;
          return {
            name: item.genreName || "--",
            value,
            color: GENRE_COLORS[index % GENRE_COLORS.length],
            percent: Math.round((value / sum) * 1000) / 10,
          };
        });
      } catch {
        deviceNum.value = 0;
        onlineNum.value = 0;
        offlineNum.value = 0;
        genreList.value = [];
      } finally {
        loaded.value = true;
      }
    };

    const startLoop = (): void => {
      if (timer) clearInterval(timer);
      const loopMs = (window as any).config?.pageLoopRequestTime;
      if (typeof loopMs === "number" && loopMs > 0) {
        timer = setInterval(() => {
          void loadData();
        }, loopMs);
      }
    };

    watch(
      () => globalState.business.currentAreaId,
      () => {
        void loadData();
        startLoop();
      },
    );

    onMounted(() => {
      void loadData();
      startLoop();
    });

    onBeforeUnmount(() => {
      if (timer) clearInterval(timer);
    });

    const renderBody = (isZoom: boolean): JSX.Element => (
      <div class={[styles.cardBody, isZoom ? styles.isZoom : ""]} data-no-zoom>
        <div class={styles.statsRow}>
          <button type="button" class={[styles.statCard, styles.isTotal, styles.isClickable]} onClick={() => openDeviceList("TOTAL")}>
            <span class={styles.statIcon} aria-hidden="true">
              <img src={deviceTotalIcon} alt="" />
            </span>
            <span class={styles.statContent}>
              <span class={styles.statLabel}>设备总数</span>
              <span class={styles.statValue}>
                <CountTo startVal={0} endVal={deviceNum.value} separator="" duration={1600} />
              </span>
            </span>
          </button>
          <button type="button" class={[styles.statCard, styles.isOnline, styles.isClickable]} onClick={() => openDeviceList("ONLINE")}>
            <span class={styles.statIcon} aria-hidden="true">
              <img src={deviceOnlineIcon} alt="" />
            </span>
            <span class={styles.statContent}>
              <span class={styles.statLabel}>在线设备</span>
              <span class={[styles.statValue, styles.isOnlineValue]}>
                <CountTo startVal={0} endVal={onlineNum.value} separator="" duration={1600} />
              </span>
            </span>
          </button>
          <button type="button" class={[styles.statCard, styles.isOffline, styles.isClickable]} onClick={() => openDeviceList("OFFLINE")}>
            <span class={styles.statIcon} aria-hidden="true">
              <img src={deviceOfflineIcon} alt="" />
            </span>
            <span class={styles.statContent}>
              <span class={styles.statLabel}>离线设备</span>
              <span class={[styles.statValue, styles.isOfflineValue]}>
                <CountTo startVal={0} endVal={offlineNum.value} separator="" duration={1600} />
              </span>
            </span>
          </button>
        </div>

        <div class={[styles.analysisSurface, loaded.value && !hasGenreData.value ? styles.isEmpty : ""]}>
          {!loaded.value ? (
            <PanelCardLoading zoom={isZoom} />
          ) : !hasGenreData.value ? (
            <NoData />
          ) : (
            <>
              <div class={styles.chartWrap}>
                <ElevatorAnalysisPie pieData={genreList.value}>
                  <div class={[styles.pieCenter, styles.isClickable]} onClick={() => openDeviceList("TOTAL")}>
                    <div class={styles.pieCenterValue}>
                      <CountTo startVal={0} endVal={deviceNum.value} separator="" duration={1600} />
                    </div>
                    <div class={styles.pieCenterLabel}>设备总数</div>
                  </div>
                </ElevatorAnalysisPie>
              </div>
              <div class={[styles.genreList, genreList.value.length > 0 && genreList.value.length <= 4 ? styles.genreListCentered : ""]}>
                {genreList.value.map((item) => (
                  <div class={styles.genreItem} key={`${isZoom ? "zoom-" : ""}${item.name}`}>
                    <span class={styles.genreName}>
                      <i class={styles.genreColor} style={{ background: item.color }} />
                      <span class={styles.genreNameText} title={item.name}>
                        {item.name}
                      </span>
                    </span>
                    <span class={styles.genreCount}>
                      {item.value}
                      <em class={styles.genreUnit}>个</em>
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    );

    return (): JSX.Element => (
      <>
        <div class="v2-panel-root">
          <SubPanelTemplate
            title="电气设备"
            class="visual-v2-sub-panel v2-panel-card electrical-device-v2-panel"
            zoomable
            zoom-title="电气设备详情"
            zoom-width={900}
            v-slots={{
              titleIcon: () => <img src={deviceSituationIcon} alt="" class="title-icon-img" />,
              default: () => renderBody(false),
              "zoom-content": () => renderBody(true),
            }}
          />
        </div>
        <ModalEquipmentAllTable
          showModal={deviceModalShow.value}
          onClose={() => {
            deviceModalShow.value = false;
          }}
          parameter={deviceParameter}
        />
      </>
    );
  },
});

export default ElectricalDevice;
