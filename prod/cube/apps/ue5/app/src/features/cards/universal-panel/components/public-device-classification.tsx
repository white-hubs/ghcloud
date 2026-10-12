import { computed, defineComponent, onMounted, ref, provide } from "vue";

import UniversalPanelCardIcon from "../_shared/universal-panel-card-icon";
import { UNIVERSAL_PANEL_V2_CLASS, universalPanelZoomClass } from "../_shared/universal-panel-v2";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { getThemeImage } from "@/infrastructure/utils/getImage";
import ElevatorAnalysisPie from "@/shared-ui/panel/charts/pie/elevator-analysis-pie";
import CountTo from "@/shared-ui/panel/count-to/count-to";
import NoData from "@/shared-ui/panel/noData";
import { panelCardLoadedKey } from "@/shared-ui/panel/panel-card-loaded-context";
import PanelCardLoading from "@/shared-ui/panel/panel-card-loading";
import useCommon from "@/visualization-core/hooks/useCommon";

import "../_shared/universal-panel-v2-shared.less";

import styles from "./public-device-classification.module.less";

const deviceTotalIcon = getThemeImage("device-total.png");
const deviceOnlineIcon = getThemeImage("device-total-online.png");
const deviceOfflineIcon = getThemeImage("device-total-offline.png");

const colorList = ["#f14545", "#ffab10", "#2f8dff", "#19f8f7", "#655dd1", "#00f27b"];

type GenreItem = {
  name: string;
  value: number;
  color: string;
  percent: number;
};

export const PublicDeviceClassification = defineComponent({
  name: "PublicDeviceClassification",
  setup() {
    const { getEquipmentNumber } = useCommon();
    const genreList = ref<GenreItem[]>([]);
    const total = ref(0);
    const online = ref(0);
    const offline = ref(0);
    const loaded = ref(false);
    provide(panelCardLoadedKey, loaded);

    const hasData = computed(() => genreList.value.some((item) => item.value > 0));

    const getEquipmentInfo = async (): Promise<void> => {
      try {
        const res: any = await getEquipmentNumber();
        const deviceNum = Number(res?.deviceNum ?? 0);
        total.value = deviceNum;

        let onlineNum = 0;
        let offlineNum = 0;
        (res?.deviceStatusNums ?? []).forEach((item: { name?: string; num?: number }) => {
          if (item.name === "NORMAL") onlineNum = Number(item.num ?? 0);
          if (item.name === "OFFLINE") offlineNum = Number(item.num ?? 0);
        });
        online.value = onlineNum;
        offline.value = offlineNum;

        const genres = Array.isArray(res?.deviceGenreNums) ? res.deviceGenreNums : [];
        const sum = genres.reduce((acc: number, item: { num?: number }) => acc + (Number(item.num) || 0), 0) || deviceNum || 1;
        genreList.value = genres.map((item: { genreName?: string; num?: number }, index: number) => {
          const value = Number(item.num) || 0;
          return {
            name: item.genreName || "未分类",
            value,
            color: colorList[index % colorList.length],
            percent: Math.round((value / sum) * 1000) / 10,
          };
        });
      } catch {
        total.value = 0;
        online.value = 0;
        offline.value = 0;
        genreList.value = [];
      } finally {
        loaded.value = true;
      }
    };

    onMounted(() => {
      void getEquipmentInfo();
    });

    const renderBody = (isZoom: boolean): JSX.Element => (
      <div
        class={[
          "public-device-classification-v2-panel",
          "up-card-body",
          styles.cardBody,
          isZoom ? styles.zoomBody : "",
          ...(isZoom ? universalPanelZoomClass : []),
        ]}
        data-no-zoom
      >
        <div class={styles.statsRow}>
          <div class={[styles.statCard, styles.isTotal]}>
            <span class={styles.statIcon} aria-hidden="true">
              <img src={deviceTotalIcon} alt="" />
            </span>
            <span class={styles.statContent}>
              <span class={styles.statLabel}>设备总数</span>
              <span class={styles.statValueRow}>
                <span class={styles.statValue}>
                  <CountTo startVal={0} endVal={total.value} separator="" duration={2000} />
                </span>
                <span class={styles.statUnit}>台</span>
              </span>
            </span>
          </div>
          <div class={[styles.statCard, styles.isOnline]}>
            <span class={styles.statIcon} aria-hidden="true">
              <img src={deviceOnlineIcon} alt="" />
            </span>
            <span class={styles.statContent}>
              <span class={styles.statLabel}>在线设备</span>
              <span class={styles.statValueRow}>
                <span class={[styles.statValue, styles.isOnlineValue]}>
                  <CountTo startVal={0} endVal={online.value} separator="" duration={2000} />
                </span>
                <span class={styles.statUnit}>台</span>
              </span>
            </span>
          </div>
          <div class={[styles.statCard, styles.isOffline]}>
            <span class={styles.statIcon} aria-hidden="true">
              <img src={deviceOfflineIcon} alt="" />
            </span>
            <span class={styles.statContent}>
              <span class={styles.statLabel}>离线设备</span>
              <span class={styles.statValueRow}>
                <span class={[styles.statValue, styles.isOfflineValue]}>
                  <CountTo startVal={0} endVal={offline.value} separator="" duration={2000} />
                </span>
                <span class={styles.statUnit}>台</span>
              </span>
            </span>
          </div>
        </div>

        <div class={[styles.analysisSurface, hasData.value ? "" : styles.isEmpty]}>
          {!loaded.value ? (
            <PanelCardLoading zoom={isZoom} />
          ) : !hasData.value ? (
            <NoData />
          ) : (
            <>
              <div class={styles.chartWrap}>
                <ElevatorAnalysisPie pieData={genreList.value}>
                  <div class={styles.pieCenterValue}>
                    <CountTo startVal={0} endVal={total.value} separator="" duration={2000} />
                  </div>
                  <div class={styles.pieCenterLabel}>设备总数</div>
                </ElevatorAnalysisPie>
              </div>
              <div class={styles.genreList}>
                {genreList.value.map((item) => (
                  <div class={styles.genreItem} key={item.name}>
                    <div class={styles.genreTop}>
                      <span class={styles.genreName} title={item.name}>
                        {item.name}
                      </span>
                      <span class={styles.genreCount}>
                        {item.value}
                        <em class={styles.genreCountUnit}>台</em>
                      </span>
                    </div>
                    <div class={styles.genreBarRow}>
                      <span class={styles.genreColor} style={{ background: item.color, boxShadow: `0 0 8px ${item.color}` }} />
                      <span class={styles.genreBarTrack}>
                        <span
                          class={styles.genreBarFill}
                          style={{
                            width: `${Math.max(item.percent, item.value > 0 ? 4 : 0)}%`,
                            background: `linear-gradient(90deg, ${item.color}, ${item.color}88)`,
                          }}
                        />
                      </span>
                    </div>
                    <div class={styles.genreBottom}>
                      <span class={styles.genreShare}>占比 {item.percent}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    );

    return (): JSX.Element => (
      <div class="v2-panel-root">
        <SubPanelTemplate
          title="设备分类统计"
          class={`${UNIVERSAL_PANEL_V2_CLASS} public-device-classification-v2-panel`}
          zoomable
          zoom-title="设备分类统计详情"
          zoom-width={860}
          v-slots={{
            titleIcon: () => <UniversalPanelCardIcon name="device" />,
            default: () => renderBody(false),
            "zoom-content": () => renderBody(true),
          }}
        />
      </div>
    );
  },
});

export default PublicDeviceClassification;
