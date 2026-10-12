import { defineComponent, onMounted, ref, provide } from "vue";

import CardTitleIcon from "@/features/cards/_shared/card-title-icon/card-title-icon";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { playRecordTop, recordTotal } from "@/infrastructure/api/broadcast";
import { getThemeImage } from "@/infrastructure/utils/getImage";
import CountTo from "@/shared-ui/panel/count-to/count-to";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";
import NoData from "@/shared-ui/panel/noData";
import { panelCardLoadedKey } from "@/shared-ui/panel/panel-card-loaded-context";
import PanelCardLoading from "@/shared-ui/panel/panel-card-loading";
import { ModelValueItf } from "@/shared-ui/panel/types";
import { useStateStore } from "@/visualization-core/stores/use-state-store";

import styles from "./record-ranking.module.less";

const playIcon = getThemeImage("alarm-count.png");
const VISIBLE_ROWS = 5;

type RankItem = {
  name?: string;
  ratio?: number;
  num?: number;
};

export const RecordRanking = defineComponent({
  name: "RecordRanking",
  setup() {
    const { globalState } = useStateStore();
    const alarmTime = ref<ModelValueItf>({
      timeType: "TODAY",
      dateRange: [],
    });
    const playNum = ref(0);
    const playRatio = ref(0);
    const areaAlarmRank = ref<RankItem[]>([]);
    const loaded = ref(false);
    provide(panelCardLoadedKey, loaded);

    const changeAlarmTime = async (): Promise<void> => {
      const params = {
        type: alarmTime.value.timeType,
        period: alarmTime.value.dateRange.join(","),
        sceneType: globalState.business.currentMenu,
        areaId: globalState.business.currentAreaId,
      };
      try {
        const [rankRes, totalRes] = await Promise.all([playRecordTop(params), recordTotal(params)]);
        areaAlarmRank.value = (Array.isArray(rankRes) ? rankRes : []).slice(0, VISIBLE_ROWS);
        playNum.value = Number((totalRes as any)?.num) || 0;
        playRatio.value = Number((totalRes as any)?.ratio) || 0;
      } catch {
        areaAlarmRank.value = [];
        playNum.value = 0;
        playRatio.value = 0;
      } finally {
        loaded.value = true;
      }
    };

    onMounted(() => {
      void changeAlarmTime();
    });

    const renderRatio = (): JSX.Element => {
      const ratio = Number(playRatio.value || 0);
      const isUp = ratio > 0;
      return (
        <div class={[styles.ratio, isUp ? styles.ratioUp : styles.ratioDown]}>
          <span>环比</span>
          <i />
          <strong>
            {isUp ? "+" : ""}
            {ratio}%
          </strong>
        </div>
      );
    };

    const renderBody = (isZoom: boolean): JSX.Element => (
      <div class={[styles.cardBody, isZoom ? styles.isZoom : ""]} data-no-zoom>
        <div class={styles.statCard}>
          <span class={styles.statIcon} aria-hidden="true">
            <img src={playIcon} alt="" />
          </span>
          <span class={styles.statContent}>
            <span class={styles.statLabel}>播放数</span>
            <span class={styles.statValue}>
              <CountTo startVal={0} endVal={playNum.value} separator="" duration={1600} />
            </span>
          </span>
          {renderRatio()}
        </div>

        {!loaded.value ? (
          <PanelCardLoading zoom={isZoom} />
        ) : areaAlarmRank.value.length === 0 ? (
          <div class={styles.emptySurface}>
            <NoData />
          </div>
        ) : (
          <div class={styles.listSurface}>
            {areaAlarmRank.value.map((item, index) => (
              <div class={styles.rankingItem} key={`${item.name}-${index}`}>
                <span class={[styles.rankBadge, index < 3 ? styles.topRank : ""]}>{index + 1}</span>
                <div class={styles.rankInfo}>
                  <span class={styles.rankName} title={item.name}>
                    {item.name || "--"}
                  </span>
                  <span class={styles.rankRatio}>占比 {item.ratio || 0}%</span>
                </div>
                <strong class={styles.rankValue}>{item.num || 0}</strong>
              </div>
            ))}
          </div>
        )}
      </div>
    );

    return (): JSX.Element => (
      <div class="v2-panel-root">
        <SubPanelTemplate
          title="广播记录排名"
          class="visual-v2-sub-panel v2-panel-card broadcast-record-ranking-v2-panel"
          zoomable
          zoom-title="广播记录排名详情"
          zoom-width={760}
          v-slots={{
            titleIcon: () => <CardTitleIcon name="broadcast-ranking" />,
            extra: () => (
              <div class={styles.headerToolbar} data-no-zoom>
                <DateInlineForm
                  modelValue={alarmTime.value}
                  onUpdate:modelValue={(v) => {
                    alarmTime.value = v;
                  }}
                  onSearch={changeAlarmTime}
                />
              </div>
            ),
            "zoom-content": () => renderBody(true),
            default: () => renderBody(false),
          }}
        />
      </div>
    );
  },
});

export default RecordRanking;
