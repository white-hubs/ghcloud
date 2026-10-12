import { computed, defineComponent, onMounted, reactive, ref } from "vue";

import ModalAlarmTable from "@/features/equipment/modal-table/modal-alarm-table";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { getstatus, groupTotalSearch } from "@/infrastructure/api/alarm";
import ElevatorAnalysisPie from "@/shared-ui/panel/charts/pie/elevator-analysis-pie";
import CountTo from "@/shared-ui/panel/count-to/count-to";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";
import ElevatorAnalysisList from "@/shared-ui/panel/elevator-analysis-list";
import { useVisualTheme } from "@/visualization-core/hooks/use-visual-theme";
import { useStateStore } from "@/visualization-core/stores/use-state-store";

import "./people-flow-alarm.module.less";

export const PeopleFlowAlarm = defineComponent({
  name: "PeopleFlowAlarm",
  setup() {
    const { globalState } = useStateStore();
    const { currentTheme } = useVisualTheme();
    const isMinimalWhite = computed(() => currentTheme.value === "minimal-white");
    const pieRingVariant = computed(() => (isMinimalWhite.value ? "clean" : "default"));

    const eventTime = ref({ timeType: "THIS_YEAR", dateRange: [] as string[] });
    const alarmModalShow = ref(false);
    const detectionData = ref<Array<{ id?: string; name: string; color: string; value: number }>>([]);

    const deviceStatisticsData = reactive({
      title: "报警总数",
      total: 0,
      itemize: [
        { name: "处理中", label: "挂起", value: 0, offline: 0, key: "OFFLINE1" },
        { name: "已处理", label: "待确认", value: 0, offline: 0, key: "OFFLINE2" },
      ],
    });

    const parameter = reactive({
      alarmEventTypeId: undefined as string | undefined,
      dateRange: [] as string[],
      alarmStatus: undefined as string | undefined,
    });

    const closeModal = (): void => {
      alarmModalShow.value = false;
    };

    const alarmEventTop = async (): Promise<void> => {
      const res = await getstatus({
        sceneType: globalState.business.currentMenu,
        areaId: globalState.business.currentAreaId,
        period: eventTime.value.dateRange.join(","),
        type: eventTime.value.timeType,
      });
      deviceStatisticsData.total = res?.alarmNum;
      deviceStatisticsData.itemize[0].value = res?.alarmStatusStatistics?.find((e) => e?.alarmStatus === "ALARM_SUSPEND")?.alarmNum;
      deviceStatisticsData.itemize[0].offline = res?.alarmStatusStatistics?.find(
        (e) => e?.alarmStatus === "ALARM_PROGRESS_CONFIRMED",
      )?.alarmNum;
      deviceStatisticsData.itemize[1].value = res?.alarmStatusStatistics?.find((e) => e?.alarmStatus === "ALARM_UN_CONFIRMED")?.alarmNum;
      deviceStatisticsData.itemize[1].offline = res?.alarmStatusStatistics?.find((e) => e?.alarmStatus === "ALARM_HANDLER")?.alarmNum;

      const data = await groupTotalSearch({
        areaId: globalState.business.currentAreaId,
        period: eventTime.value.dateRange.join(","),
        sceneType: globalState.business.currentMenu,
      });
      const colors = ["#328BF7", "#FFC700", "#19F8F7", "#EF424A", "#29C2FF", "#74AEE7", "#655DD1", "#B9D9FF", "#6EE3E1"];
      detectionData.value = data.map((item, index) => ({
        id: item?.id,
        name: item?.name,
        value: item?.totalNum,
        color: colors[index],
      }));
    };

    const handelClickItemize = (value?: string): void => {
      const obj: Record<string, string> = {
        挂起: "ALARM_SUSPEND",
        处理中: "ALARM_PROGRESS_CONFIRMED",
        待确认: "ALARM_UN_CONFIRMED",
        已处理: "ALARM_HANDLER",
      };
      parameter.alarmStatus = value ? obj[value] : undefined;
      parameter.alarmEventTypeId = undefined;
      parameter.dateRange = eventTime.value.dateRange;
      alarmModalShow.value = true;
    };

    const alarmClickBar = (value: { id?: string }): void => {
      parameter.alarmStatus = undefined;
      parameter.alarmEventTypeId = value.id;
      parameter.dateRange = eventTime.value.dateRange;
      alarmModalShow.value = true;
    };

    onMounted(() => {
      void alarmEventTop();
    });

    const renderStats = (isZoom: boolean): JSX.Element => (
      <div class={["stats-row", isZoom ? "is-zoom" : ""]} data-no-zoom>
        <div class="stat-card is-total" onClick={() => handelClickItemize()}>
          {!isZoom ? (
            <div class="stat-icon icon-total">
              <svg viewBox="0 0 24 24" class="stat-icon-svg">
                <path
                  d="M12 2a6 6 0 0 0-6 6v3.1L4 14h16l-2-2.9V8a6 6 0 0 0-6-6Zm0 18a2.4 2.4 0 0 0 2.3-1.8H9.7A2.4 2.4 0 0 0 12 20Z"
                  fill="currentColor"
                />
              </svg>
            </div>
          ) : null}
          <div class="stat-content">
            <div class="stat-value v2-metric-value">
              {isZoom ? (
                deviceStatisticsData.total
              ) : (
                <CountTo startVal={0} endVal={deviceStatisticsData.total} separator="" duration={4000} />
              )}
            </div>
            <div class="stat-label">{deviceStatisticsData.title}</div>
          </div>
        </div>
        <div class="stat-card is-processing" onClick={() => handelClickItemize("挂起")}>
          <div class="stat-content">
            <div class="stat-value is-processing-value v2-metric-value">
              {isZoom ? (
                deviceStatisticsData.itemize[0].value
              ) : (
                <CountTo startVal={0} endVal={deviceStatisticsData.itemize[0].value} separator="" duration={4000} />
              )}
            </div>
            <div class="stat-label">{deviceStatisticsData.itemize[0].label}</div>
          </div>
        </div>
        <div class="stat-card is-pending" onClick={() => handelClickItemize("处理中")}>
          <div class="stat-content">
            <div class="stat-value is-pending-value v2-metric-value">
              {isZoom ? (
                deviceStatisticsData.itemize[0].offline
              ) : (
                <CountTo startVal={0} endVal={deviceStatisticsData.itemize[0].offline} separator="" duration={4000} />
              )}
            </div>
            <div class="stat-label">{deviceStatisticsData.itemize[0].name}</div>
          </div>
        </div>
        <div class="stat-card is-done" onClick={() => handelClickItemize("待确认")}>
          <div class="stat-content">
            <div class="stat-value is-done-value v2-metric-value">
              {isZoom ? (
                deviceStatisticsData.itemize[1].value
              ) : (
                <CountTo startVal={0} endVal={deviceStatisticsData.itemize[1].value} separator="" duration={4000} />
              )}
            </div>
            <div class="stat-label">{deviceStatisticsData.itemize[1].label}</div>
          </div>
        </div>
        <div class="stat-card is-handler" onClick={() => handelClickItemize("已处理")}>
          <div class="stat-content">
            <div class="stat-value is-handler-value v2-metric-value">
              {isZoom ? (
                deviceStatisticsData.itemize[1].offline
              ) : (
                <CountTo startVal={0} endVal={deviceStatisticsData.itemize[1].offline} separator="" duration={4000} />
              )}
            </div>
            <div class="stat-label">{deviceStatisticsData.itemize[1].name}</div>
          </div>
        </div>
      </div>
    );

    const renderPie = (isZoom: boolean): JSX.Element => (
      <div class={["elevator-analysis", isZoom ? "is-zoom" : "", isMinimalWhite.value ? "is-clean-ring" : ""]} data-no-zoom>
        <ElevatorAnalysisPie
          class="pie-chart"
          pieData={detectionData.value}
          ringVariant={pieRingVariant.value}
          radius={isMinimalWhite.value ? "78" : "75"}
          onClickbar={alarmClickBar}
        >
          <div class="pie-center-value v2-metric-value">
            {isZoom ? (
              deviceStatisticsData.total
            ) : (
              <CountTo startVal={0} endVal={deviceStatisticsData.total} separator="" duration={4000} />
            )}
          </div>
          <div class="pie-center-label">报警总数（个）</div>
        </ElevatorAnalysisPie>
        <ElevatorAnalysisList class="pie-list" showRatio contentList={detectionData.value} onHandlecurrent={alarmClickBar} />
      </div>
    );

    return () => (
      <div class="people-flow-alarm-v2-root v2-panel-root">
        <SubPanelTemplate
          title="报警事件统计"
          class="visual-v2-sub-panel people-flow-alarm-v2-panel v2-panel-card"
          zoomable
          zoom-title="报警事件统计详情"
          zoom-width={720}
          v-slots={{
            titleIcon: () => (
              <span class="v2-title-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" class="v2-title-icon-svg">
                  <path
                    d="M12 2a6 6 0 0 0-6 6v3.1L4 14h16l-2-2.9V8a6 6 0 0 0-6-6Zm0 18a2.4 2.4 0 0 0 2.3-1.8H9.7A2.4 2.4 0 0 0 12 20Z"
                    fill="currentColor"
                  />
                </svg>
              </span>
            ),
            extra: () => <DateInlineForm v-model:modelValue={eventTime.value} data-no-zoom onSearch={alarmEventTop} />,
            "zoom-content": () => (
              <div class="people-flow-alarm-v2 people-flow-alarm-v2-panel is-zoom">
                {renderStats(true)}
                {renderPie(true)}
              </div>
            ),
          }}
        >
          <div class="people-flow-alarm-v2 people-flow-alarm-v2-panel v2-panel-body">
            {renderStats(false)}
            {renderPie(false)}
          </div>
        </SubPanelTemplate>
        <ModalAlarmTable show-modal={alarmModalShow.value} parameter={parameter} onClose={closeModal} />
      </div>
    );
  },
});
