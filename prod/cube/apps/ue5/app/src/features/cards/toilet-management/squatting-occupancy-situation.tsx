import { computed, defineComponent, onMounted, ref, provide } from "vue";

import CardTitleIcon from "@/features/cards/_shared/card-title-icon/card-title-icon";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { getThemeImage } from "@/infrastructure/utils/getImage";
import ElevatorAnalysisPie from "@/shared-ui/panel/charts/pie/elevator-analysis-pie";
import CountTo from "@/shared-ui/panel/count-to/count-to";
import NoData from "@/shared-ui/panel/noData";
import { panelCardLoadedKey } from "@/shared-ui/panel/panel-card-loaded-context";
import PanelCardLoading from "@/shared-ui/panel/panel-card-loading";
import { useVisualTheme } from "@/visualization-core/hooks/use-visual-theme";

import styles from "./squatting-occupancy-situation.module.less";

const squatTotalIcon = getThemeImage("device-total.png");
const squatFreeIcon = getThemeImage("device-total-online.png");
const squatOccupiedIcon = getThemeImage("device-total-offline.png");

type OccupancyKey = "FREE" | "OCCUPIED";

type OccupancyItem = {
  key: OccupancyKey;
  name: string;
  value: number;
  color: string;
  percent: number;
  cardClass: string;
  valueClass: string;
  iconSrc: string;
};

const OCCUPANCY_META: Record<OccupancyKey, { label: string; color: string; cardClass: string; valueClass: string; iconSrc: string }> = {
  FREE: {
    label: "空闲",
    color: "#00F27B",
    cardClass: "isFree",
    valueClass: "isFreeValue",
    iconSrc: squatFreeIcon,
  },
  OCCUPIED: {
    label: "占用",
    color: "#FFAB10",
    cardClass: "isOccupied",
    valueClass: "isOccupiedValue",
    iconSrc: squatOccupiedIcon,
  },
};

const OCCUPANCY_ORDER: OccupancyKey[] = ["FREE", "OCCUPIED"];

export const SquattingOccupancySituation = defineComponent({
  name: "SquattingOccupancySituation",
  props: {
    title: { type: String, required: false, default: "蹲位占用情况" },
  },
  setup(props) {
    const { currentTheme } = useVisualTheme();
    const isMinimalWhite = computed(() => currentTheme.value === "minimal-white");

    const loaded = ref(false);
    provide(panelCardLoadedKey, loaded);
    const squatTotal = ref(0);
    const occupancyList = ref<OccupancyItem[]>([]);

    const hasData = computed(() => occupancyList.value.length > 0);

    const createEmptyList = (): OccupancyItem[] =>
      OCCUPANCY_ORDER.map((key) => {
        const meta = OCCUPANCY_META[key];
        return {
          key,
          name: meta.label,
          value: 0,
          color: meta.color,
          percent: 0,
          cardClass: styles[meta.cardClass],
          valueClass: styles[meta.valueClass],
          iconSrc: meta.iconSrc,
        };
      });

    /**
     * 蹲位占用暂无独立接口；保留固定结构（空闲/占用），全 0 仍展示。
     * 后续接入接口时在此映射即可。
     */
    const loadData = async (): Promise<void> => {
      try {
        const rows = createEmptyList();
        const sum = rows.reduce((acc, item) => acc + item.value, 0);
        squatTotal.value = sum;
        const percentBase = sum || 1;
        occupancyList.value = rows.map((item) => ({
          ...item,
          percent: Math.round((item.value / percentBase) * 1000) / 10,
        }));
      } catch {
        squatTotal.value = 0;
        occupancyList.value = createEmptyList();
      } finally {
        loaded.value = true;
      }
    };

    onMounted(() => {
      void loadData();
    });

    const renderBody = (isZoom: boolean): JSX.Element => (
      <div class={[styles.cardBody, isZoom ? styles.isZoom : ""]} data-no-zoom>
        {!loaded.value ? (
          <PanelCardLoading zoom={isZoom} />
        ) : !hasData.value ? (
          <div class={styles.emptySurface}>
            <NoData />
          </div>
        ) : (
          <>
            <div class={styles.statsRow}>
              <div class={[styles.statCard, styles.isTotal]}>
                <span class={styles.statIcon} aria-hidden="true">
                  <img src={squatTotalIcon} alt="" />
                </span>
                <span class={styles.statContent}>
                  <span class={styles.statLabel}>蹲位总数</span>
                  <span class={styles.statValue}>
                    <CountTo startVal={0} endVal={squatTotal.value} separator="" duration={1600} />
                  </span>
                </span>
              </div>
              {occupancyList.value.map((item) => (
                <div class={[styles.statCard, item.cardClass]} key={`${isZoom ? "zoom-stat-" : "stat-"}${item.key}`}>
                  <span class={styles.statIcon} aria-hidden="true">
                    <img src={item.iconSrc} alt="" />
                  </span>
                  <span class={styles.statContent}>
                    <span class={styles.statLabel}>{item.name}</span>
                    <span class={[styles.statValue, item.valueClass]}>
                      <CountTo startVal={0} endVal={item.value} separator="" duration={1600} />
                    </span>
                  </span>
                </div>
              ))}
            </div>

            <div class={styles.analysisSurface}>
              <div class={styles.chartWrap}>
                <ElevatorAnalysisPie
                  pieData={occupancyList.value}
                  radius={isMinimalWhite.value ? "78" : "75"}
                  ringVariant={isMinimalWhite.value ? "clean" : "default"}
                >
                  <div class={styles.pieCenterValue}>
                    <CountTo startVal={0} endVal={squatTotal.value} separator="" duration={1600} />
                  </div>
                  <div class={styles.pieCenterLabel}>蹲位总数</div>
                </ElevatorAnalysisPie>
              </div>
              <div class={styles.levelList}>
                {occupancyList.value.map((item) => (
                  <div class={styles.levelItem} key={`${isZoom ? "zoom-" : ""}${item.key}`}>
                    <span class={styles.levelTop}>
                      <span class={styles.levelName}>{item.name}</span>
                      <span class={styles.levelCount}>{item.value}</span>
                    </span>
                    <span class={styles.levelBarRow}>
                      <span class={styles.levelColor} style={{ background: item.color, boxShadow: `0 0 8px ${item.color}` }} />
                      <span class={styles.levelBarTrack}>
                        <span
                          class={styles.levelBarFill}
                          style={{
                            width: `${Math.max(item.percent, item.value > 0 ? 4 : 0)}%`,
                            background: `linear-gradient(90deg, ${item.color}, ${item.color}88)`,
                          }}
                        />
                      </span>
                    </span>
                    <span class={styles.levelBottom}>
                      <span class={styles.levelShare}>占比 {item.percent}%</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    );

    return (): JSX.Element => (
      <div class="v2-panel-root">
        <SubPanelTemplate
          title={props.title}
          class="visual-v2-sub-panel v2-panel-card squatting-occupancy-v2-panel"
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
    );
  },
});

export default SquattingOccupancySituation;
