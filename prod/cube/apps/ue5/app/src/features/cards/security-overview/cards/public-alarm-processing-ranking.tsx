import { defineComponent, onMounted, reactive, ref, provide } from "vue";

import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { alarmHandleTop } from "@/infrastructure/api/alarm";
import { AlarmAreaTop } from "@/infrastructure/api/models/alarm";
import { getThemeImage } from "@/infrastructure/utils/getImage";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";
import EventAlarmItem from "@/shared-ui/panel/eventAlarmItem";
import NoData from "@/shared-ui/panel/noData";
import { panelCardLoadedKey } from "@/shared-ui/panel/panel-card-loaded-context";
import PanelCardLoading from "@/shared-ui/panel/panel-card-loading";
import { ModelValueItf } from "@/shared-ui/panel/types";
import { useStateStore } from "@/visualization-core/stores/use-state-store";

import "@/features/cards/air-conditioning/_shared/air-conditioning-v2-shared.module.less";

import styles from "./public-alarm-processing-ranking.module.less";

const titleIcon = getThemeImage("alarm-record.png");

export const PublicAlarmProcessingRanking = defineComponent({
  name: "PublicAlarmProcessingRanking",
  setup() {
    const { globalState } = useStateStore();

    interface AlarmHandlType {
      list: AlarmAreaTop[];
    }

    const loaded = ref(false);
    provide(panelCardLoadedKey, loaded);
    let requestSeq = 0;

    const handleTime = ref<ModelValueItf>({
      timeType: "THIS_YEAR",
      dateRange: [],
    });

    const alarmRank = reactive<AlarmHandlType>({
      list: [],
    });

    async function changeHandleTime() {
      const seq = ++requestSeq;
      const params = {
        sceneType: globalState.business.currentMenu,
        areaId: globalState.business.currentAreaId,
        period: handleTime.value.dateRange.join(","),
        type: handleTime.value.timeType,
      };
      try {
        const res = await alarmHandleTop(params);
        if (seq !== requestSeq) return;
        alarmRank.list = Array.isArray(res) ? res : [];
      } catch {
        if (seq !== requestSeq) return;
        alarmRank.list = [];
      } finally {
        if (seq === requestSeq) loaded.value = true;
      }
    }

    onMounted(() => {
      void changeHandleTime();
    });

    const renderBody = (isZoom: boolean): JSX.Element => (
      <div
        class={["public-alarm-processing-ranking-v2-panel", styles.cardBody, isZoom ? styles.zoomBody : "", "air-conditioning-card-body"]}
        data-no-zoom
      >
        {!loaded.value ? (
          <PanelCardLoading zoom={isZoom} />
        ) : alarmRank.list.length > 0 ? (
          <div class={[styles.listSurface, "access-control-card-theme"]}>
            {alarmRank.list.map((item, index) => (
              <div class={styles.rankItem} key={item.id ?? `${item.name}-${index}`}>
                <EventAlarmItem
                  sort={index + 1}
                  name={item.name}
                  linkRatio={item.chainRatio}
                  count={item.alarmNum}
                  ratio={`${item.ratio ?? 0}%`}
                />
              </div>
            ))}
          </div>
        ) : (
          <div class={[styles.emptySurface, "up-empty"]}>
            <NoData />
          </div>
        )}
      </div>
    );

    return (): JSX.Element => (
      <div class="v2-panel-root">
        <SubPanelTemplate
          title="报警处理排名"
          class="visual-v2-sub-panel v2-panel-card air-conditioning-v2-panel public-alarm-processing-ranking-v2-panel"
          zoomable
          zoom-title="报警处理排名详情"
          zoom-width={780}
          v-slots={{
            titleIcon: () => <img src={titleIcon} alt="" class="energy-v2-title-icon" />,
            extra: () => (
              <div class="air-conditioning-header-toolbar" data-no-zoom>
                <DateInlineForm
                  modelValue={handleTime.value}
                  onUpdate:modelValue={(v) => {
                    handleTime.value = v;
                  }}
                  onSearch={changeHandleTime}
                />
              </div>
            ),
            default: () => renderBody(false),
            "zoom-content": () => renderBody(true),
          }}
        />
      </div>
    );
  },
});

export default PublicAlarmProcessingRanking;
