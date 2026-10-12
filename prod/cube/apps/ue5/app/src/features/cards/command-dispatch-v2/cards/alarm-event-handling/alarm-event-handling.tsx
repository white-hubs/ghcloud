import { computed, defineComponent, onMounted, reactive, ref, watch, provide } from "vue";

import ModalAlarmTableNew from "@/features/equipment/modal-table/modal-alarm-tableNew";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { eventTypeHandlerSearch } from "@/infrastructure/api/alarm";
import { getThemeImage } from "@/infrastructure/utils/getImage";
import CountTo from "@/shared-ui/panel/count-to/count-to";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";
import NoData from "@/shared-ui/panel/noData";
import { panelCardLoadedKey } from "@/shared-ui/panel/panel-card-loaded-context";
import PanelCardLoading from "@/shared-ui/panel/panel-card-loading";
import { useStateStore } from "@/visualization-core/stores/use-state-store";

import "@/features/cards/air-conditioning/_shared/air-conditioning-v2-shared.module.less";

import styles from "./alarm-event-handling.module.less";

const titleIcon = getThemeImage("alarm-event.png");

const DEVICE_TAGS = [
  "builtin.app::SECURITY_MONITORING",
  "builtin.app::ELECTRICMANAGE",
  "builtin.app::FIRECONTROL",
  "builtin.app::GAS_MANAGEMENT",
  "builtin.app::ROTATINGMANAGE",
];

const ROW_COLORS = ["#2B7FFF", "#4DA6FF", "#00C2E0", "#7EB8FF", "#B5D4FF", "#655DD1"];

type EventRow = {
  id: string;
  name: string;
  totalNum: number;
  processingHours: number;
  processingText: string;
  color: string;
  percent: number;
};

export const AlarmEventHandling = defineComponent({
  name: "AlarmEventHandling",
  setup() {
    const { globalState } = useStateStore();
    const alarmEventTime = ref({
      timeType: "THIS_YEAR",
      dateRange: [] as string[],
    });
    const alarmEventData = ref<EventRow[]>([]);
    const loaded = ref(false);
    provide(panelCardLoadedKey, loaded);
    const alarmModalShow = ref(false);
    const parameter = reactive({
      alarmEventTypeId: "",
      dateRange: [] as string[],
      deviceTags: DEVICE_TAGS.toString(),
    });

    const maxAlarmNum = computed(() => Math.max(...alarmEventData.value.map((item) => item.totalNum), 1));

    const alarmEventTimetTop = async (): Promise<void> => {
      try {
        const res = await eventTypeHandlerSearch({
          areaId: globalState.business.currentAreaId,
          period: alarmEventTime.value.dateRange.join(","),
          deviceTags: DEVICE_TAGS,
        });
        const rows = Array.isArray(res) ? res : [];
        const sum = rows.reduce((acc: number, item: any) => acc + (Number(item.totalNum) || 0), 0) || 1;
        alarmEventData.value = rows.map((item: any, index: number) => {
          const totalNum = Number(item.totalNum) || 0;
          const seconds = Number(item.processingTime) || 0;
          const hours = seconds / 3600;
          return {
            id: String(item.id ?? index),
            name: String(item.name || "--"),
            totalNum,
            processingHours: hours,
            processingText: `${hours.toFixed(2)}时`,
            color: ROW_COLORS[index % ROW_COLORS.length],
            percent: Math.round((totalNum / sum) * 1000) / 10,
          };
        });
      } catch {
        alarmEventData.value = [];
      } finally {
        loaded.value = true;
      }
    };

    const clickRow = (row: EventRow): void => {
      parameter.alarmEventTypeId = row.id;
      parameter.dateRange = [...alarmEventTime.value.dateRange];
      alarmModalShow.value = true;
    };

    watch(
      () => globalState.business.currentAreaId,
      () => {
        void alarmEventTimetTop();
      },
    );

    onMounted(() => {
      void alarmEventTimetTop();
    });

    const renderBody = (isZoom: boolean): JSX.Element => (
      <div class={[styles.cardBody, isZoom ? styles.isZoom : "", "air-conditioning-card-body"]} data-no-zoom>
        {!loaded.value ? (
          <PanelCardLoading zoom={isZoom} />
        ) : alarmEventData.value.length === 0 ? (
          <div class={styles.emptySurface}>
            <NoData />
          </div>
        ) : (
          <div class={styles.listSurface}>
            {alarmEventData.value.map((item) => {
              const barWidth = Math.max((item.totalNum / maxAlarmNum.value) * 100, item.totalNum > 0 ? 4 : 0);
              return (
                <button type="button" class={styles.eventCard} key={`${isZoom ? "zoom-" : ""}${item.id}`} onClick={() => clickRow(item)}>
                  <span class={styles.eventTop}>
                    <span class={styles.eventLeft}>
                      <span class={styles.eventDot} style={{ background: item.color, boxShadow: `0 0 8px ${item.color}` }} />
                      <span class={styles.eventName} title={item.name}>
                        {item.name}
                      </span>
                    </span>
                    <span class={styles.eventRight}>
                      <span class={styles.eventCount}>
                        <CountTo startVal={0} endVal={item.totalNum} separator="" duration={1200} />
                      </span>
                      <span class={styles.eventUnit}>件</span>
                    </span>
                  </span>
                  <span class={styles.eventBarTrack}>
                    <span
                      class={styles.eventBarFill}
                      style={{
                        width: `${barWidth}%`,
                        background: `linear-gradient(90deg, ${item.color}, ${item.color}88)`,
                      }}
                    />
                  </span>
                  <span class={styles.eventBottom}>
                    <span class={styles.eventShare}>{item.percent}%</span>
                    <span class={styles.eventDuration}>
                      <span class={styles.durationLabel}>平均处理</span>
                      <span class={styles.durationValue}>{item.processingText}</span>
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    );

    return (): JSX.Element => (
      <>
        <div class="v2-panel-root">
          <SubPanelTemplate
            title="报警事件处理情况"
            class="visual-v2-sub-panel v2-panel-card air-conditioning-v2-panel cmd-alarm-event-v2-panel"
            zoomable
            zoom-title="报警事件处理情况详情"
            zoom-width={900}
            v-slots={{
              titleIcon: () => <img src={titleIcon} alt="" class={styles.titleIcon} />,
              extra: () => (
                <div class="air-conditioning-header-toolbar" data-no-zoom>
                  <DateInlineForm
                    modelValue={alarmEventTime.value}
                    onUpdate:modelValue={(v) => {
                      alarmEventTime.value = v;
                    }}
                    onSearch={alarmEventTimetTop}
                  />
                </div>
              ),
              default: () => renderBody(false),
              "zoom-content": () => renderBody(true),
            }}
          />
        </div>
        <ModalAlarmTableNew
          showModal={alarmModalShow.value}
          onClose={() => {
            alarmModalShow.value = false;
          }}
          parameter={parameter}
        />
      </>
    );
  },
});

export default AlarmEventHandling;
