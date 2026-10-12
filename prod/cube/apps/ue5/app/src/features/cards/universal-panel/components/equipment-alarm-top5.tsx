import { defineComponent, onBeforeUnmount, onMounted, ref, watch, provide } from "vue";

import UniversalPanelCardIcon from "../_shared/universal-panel-card-icon";
import { UNIVERSAL_PANEL_V2_CLASS, universalPanelZoomClass } from "../_shared/universal-panel-v2";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { statisticsDeviceTop } from "@/infrastructure/api/alarm";
import { AlarmAreaTop } from "@/infrastructure/api/models/alarm";
import DateInlineForm, { ModelValueItf } from "@/shared-ui/panel/dateInlineForm";
import EventAlarmItem from "@/shared-ui/panel/eventAlarmItem";
import NoData from "@/shared-ui/panel/noData";
import { panelCardLoadedKey } from "@/shared-ui/panel/panel-card-loaded-context";
import PanelCardLoading from "@/shared-ui/panel/panel-card-loading";
import { useStateStore } from "@/visualization-core/stores/use-state-store";

import "../_shared/universal-panel-v2-shared.less";

import styles from "./equipment-alarm-top5.module.less";

export const EquipmentAlarmTop5 = defineComponent({
  name: "EquipmentAlarmTop5",
  setup() {
    const { globalState } = useStateStore();
    const handleTime = ref<ModelValueItf>({
      timeType: "THIS_YEAR",
      dateRange: [],
    });
    const areaAlarmRank = ref<AlarmAreaTop[]>([]);
    const loaded = ref(false);
    provide(panelCardLoadedKey, loaded);
    const timer = ref<ReturnType<typeof setInterval> | null>(null);
    let requestSeq = 0;

    const areaAlarmStatistic = async (): Promise<void> => {
      const seq = ++requestSeq;
      const params = {
        sceneType: globalState.business.currentMenu,
        areaId: globalState.business.currentAreaId,
        period: handleTime.value?.dateRange?.join(",") ?? "",
        type: handleTime.value?.timeType,
      };
      try {
        const res = await statisticsDeviceTop(params);
        if (seq !== requestSeq) return;
        areaAlarmRank.value = Array.isArray(res) ? res : [];
      } catch {
        if (seq !== requestSeq) return;
        areaAlarmRank.value = [];
      } finally {
        if (seq === requestSeq) loaded.value = true;
      }
    };

    const startLoop = (): void => {
      if (timer.value) clearInterval(timer.value);
      void areaAlarmStatistic();
      timer.value = setInterval(
        () => {
          void areaAlarmStatistic();
        },
        (window as Window & { config?: { pageLoopRequestTime?: number } }).config?.pageLoopRequestTime ?? 60000,
      );
    };

    watch(
      () => globalState.business.currentAreaId,
      () => {
        startLoop();
      },
    );

    onMounted(() => {
      startLoop();
    });

    onBeforeUnmount(() => {
      if (timer.value) clearInterval(timer.value);
    });

    const renderDateForm = (): JSX.Element => (
      <div class="header-toolbar" data-no-zoom>
        <DateInlineForm
          modelValue={handleTime.value}
          onUpdate:modelValue={(v) => {
            handleTime.value = v;
          }}
          onSearch={areaAlarmStatistic}
        />
      </div>
    );

    const renderBody = (isZoom: boolean): JSX.Element => (
      <div
        class={["up-card-body", styles.cardBody, isZoom ? styles.zoomBody : "", ...(isZoom ? universalPanelZoomClass : [])]}
        data-no-zoom
      >
        {!loaded.value ? (
          <PanelCardLoading zoom={isZoom} />
        ) : areaAlarmRank.value.length === 0 ? (
          <div class={[styles.emptySurface, "up-empty"]}>
            <NoData />
          </div>
        ) : (
          <div class={[styles.listSurface, "access-control-card-theme"]}>
            {areaAlarmRank.value.map((item, index) => (
              <div class={styles.rankItem} key={`${item.name}-${index}`}>
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
        )}
      </div>
    );

    return (): JSX.Element => (
      <div class="v2-panel-root">
        <SubPanelTemplate
          title="设备报警Top5"
          class={`${UNIVERSAL_PANEL_V2_CLASS} equipment-alarm-top5-v2-panel`}
          zoomable
          zoom-title="设备报警Top5详情"
          zoom-width={760}
          v-slots={{
            titleIcon: () => <UniversalPanelCardIcon name="alarm" />,
            extra: () => renderDateForm(),
            default: () => renderBody(false),
            "zoom-content": () => renderBody(true),
          }}
        />
      </div>
    );
  },
});

export default EquipmentAlarmTop5;
