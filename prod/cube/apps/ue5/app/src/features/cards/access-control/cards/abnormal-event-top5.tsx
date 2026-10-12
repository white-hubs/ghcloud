import { defineComponent, onBeforeUnmount, onMounted, reactive, ref, watch, provide } from "vue";

import CardTitleIcon from "@/features/cards/_shared/card-title-icon/card-title-icon";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { alarmEvent } from "@/infrastructure/utils/requestData/accessControl";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";
import EventAlarmItem from "@/shared-ui/panel/eventAlarmItem";
import NoData from "@/shared-ui/panel/noData";
import { panelCardLoadedKey } from "@/shared-ui/panel/panel-card-loaded-context";
import PanelCardLoading from "@/shared-ui/panel/panel-card-loading";
import { ModelValueItf } from "@/shared-ui/panel/types";
import { useStateStore } from "@/visualization-core/stores/use-state-store";

import styles from "./abnormal-event-top5.module.less";

const VISIBLE_ROWS = 5;

export const AbnormalEventTop5 = defineComponent({
  name: "AbnormalEventTop5",
  setup() {
    const { globalState } = useStateStore();
    const unusual = reactive<{ arr: Array<{ name?: string; ringRatio?: number; value?: number }> }>({
      arr: [],
    });
    const event = ref<ModelValueItf>({
      timeType: "THIS_YEAR",
      dateRange: [],
    });
    const loaded = ref(false);
    provide(panelCardLoadedKey, loaded);
    let timer: ReturnType<typeof setInterval> | null = null;

    const alarmEventTop = async (): Promise<void> => {
      try {
        const res = await alarmEvent(event.value.timeType);
        unusual.arr = Array.isArray(res) ? res.slice(0, VISIBLE_ROWS) : [];
      } catch {
        unusual.arr = [];
      } finally {
        loaded.value = true;
      }
    };

    const startLoop = (): void => {
      if (timer) clearInterval(timer);
      timer = setInterval(
        () => {
          void alarmEventTop();
        },
        (window as any).config.pageLoopRequestTime,
      );
    };

    watch(
      () => globalState.business.currentAreaId,
      () => {
        startLoop();
        void alarmEventTop();
      },
    );

    onMounted(() => {
      void alarmEventTop();
      startLoop();
    });

    onBeforeUnmount(() => {
      if (timer) clearInterval(timer);
    });

    const renderBody = (isZoom: boolean): JSX.Element => (
      <div class={[styles.cardBody, isZoom ? styles.isZoom : ""]} data-no-zoom>
        {!loaded.value ? (
          <PanelCardLoading zoom={isZoom} />
        ) : unusual.arr.length === 0 ? (
          <div class={styles.emptySurface}>
            <NoData />
          </div>
        ) : (
          <div class={styles.listSurface}>
            {unusual.arr.map((item, index) => (
              <div class={styles.rankItem} key={`${item.name}-${index}`}>
                <EventAlarmItem sort={index + 1} name={item.name} linkRatio={item.ringRatio} count={item.value} />
              </div>
            ))}
          </div>
        )}
      </div>
    );

    return (): JSX.Element => (
      <div class="v2-panel-root">
        <SubPanelTemplate
          title="异常事件top5"
          class="visual-v2-sub-panel v2-panel-card abnormal-event-top5-v2-panel"
          zoomable
          zoom-title="异常事件top5详情"
          zoom-width={760}
          v-slots={{
            titleIcon: () => <CardTitleIcon name="access-control-alarm" />,
            extra: () => (
              <div class={styles.headerToolbar} data-no-zoom>
                <DateInlineForm
                  modelValue={event.value}
                  onUpdate:modelValue={(v) => {
                    event.value = v;
                  }}
                  onSearch={alarmEventTop}
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

export default AbnormalEventTop5;
