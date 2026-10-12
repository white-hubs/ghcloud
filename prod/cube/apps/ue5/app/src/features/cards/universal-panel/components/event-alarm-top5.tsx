import { defineComponent, onMounted, reactive, ref, provide } from "vue";

import UniversalPanelCardIcon from "../_shared/universal-panel-card-icon";
import { UNIVERSAL_PANEL_V2_CLASS, universalPanelZoomClass } from "../_shared/universal-panel-v2";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import DateInlineForm, { ModelValueItf } from "@/shared-ui/panel/dateInlineForm";
import EventAlarmItem from "@/shared-ui/panel/eventAlarmItem";
import NoData from "@/shared-ui/panel/noData";
import { panelCardLoadedKey } from "@/shared-ui/panel/panel-card-loaded-context";
import PanelCardLoading from "@/shared-ui/panel/panel-card-loading";
import useCommon from "@/visualization-core/hooks/useCommon";
import { useStateStore } from "@/visualization-core/stores/use-state-store";

import "../_shared/universal-panel-v2-shared.less";

import styles from "./event-alarm-top5.module.less";

export const EventAlarmTop5 = defineComponent({
  name: "EventAlarmTop5",
  props: {
    title: { type: String, required: false, default: "事件报警Top5" },
    panelName: { type: String, required: false },
  },
  setup(props) {
    const { globalState } = useStateStore();
    const eventInfo = ref<ModelValueItf>({
      timeType: "THIS_YEAR",
      dateRange: [],
    });
    const { getEventTop } = useCommon();
    const loaded = ref(false);
    provide(panelCardLoadedKey, loaded);
    const alarmTop = reactive<{ arr: any[] }>({ arr: [] });
    let requestSeq = 0;

    const alarmEventTop = async (): Promise<void> => {
      const seq = ++requestSeq;
      const param = {
        sceneType: globalState.business.currentMenu,
        areaId: globalState.business.currentAreaId,
        period: eventInfo.value?.dateRange?.join(",") ?? "",
        type: eventInfo.value?.timeType,
      };
      try {
        const res = await getEventTop(param);
        if (seq !== requestSeq) return;
        alarmTop.arr = Array.isArray(res) ? res : [];
      } catch {
        if (seq !== requestSeq) return;
        alarmTop.arr = [];
      } finally {
        if (seq === requestSeq) loaded.value = true;
      }
    };

    onMounted(() => {
      void alarmEventTop();
    });

    const renderDateForm = (): JSX.Element => (
      <div class="header-toolbar" data-no-zoom>
        <DateInlineForm
          modelValue={eventInfo.value}
          onUpdate:modelValue={(v) => {
            eventInfo.value = v;
          }}
          onSearch={alarmEventTop}
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
        ) : alarmTop.arr.length === 0 ? (
          <div class={[styles.emptySurface, "up-empty"]}>
            <NoData />
          </div>
        ) : (
          <div class={[styles.listSurface, "access-control-card-theme"]}>
            {alarmTop.arr.map((item, index) => (
              <div class={styles.rankItem} key={item.id ?? `${item.name}-${index}`}>
                <EventAlarmItem sort={index + 1} name={item.name} count={item.alarmNum} ratio={`${item.ratio ?? 0}%`} sn={false} />
              </div>
            ))}
          </div>
        )}
      </div>
    );

    return (): JSX.Element => (
      <div class="v2-panel-root">
        <SubPanelTemplate
          title={props.title}
          class={`${UNIVERSAL_PANEL_V2_CLASS} event-alarm-top5-v2-panel`}
          zoomable
          zoom-title={`${props.title}详情`}
          zoom-width={760}
          v-slots={{
            titleIcon: () => <UniversalPanelCardIcon name="alarm" />,
            extra: () => renderDateForm(),
            "zoom-content": () => renderBody(true),
            default: () => renderBody(false),
          }}
        />
      </div>
    );
  },
});

export default EventAlarmTop5;
