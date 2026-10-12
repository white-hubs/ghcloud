import moment from "moment";
import { defineComponent, nextTick, provide } from "vue";
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from "vue";

import AlarmMetrics, { createAlarmModalParameter, resolveAlarmStatus } from "../../_shared/alarm-metrics/alarm-metrics";
import { resolveEquipmentManagementPanelContext } from "../../air-exhaust/_shared/supply-exhaust-air-panel-context";
import { CARD_SLOT_DENSITY_CHANGE_EVENT } from "@/features/cards/base-panel-render/card-slot-density";
import { measureRollTableVisibleRows } from "@/features/cards/base-panel-render/slot-visible-rows";
import ModalAlarmTable from "@/features/equipment/modal-table/modal-alarm-tableNew";
import RollTable from "@/features/panel-shell/tables/roll-table/roll-table";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { alarmStatisticsList, statisticsStatus } from "@/infrastructure/api/alarm";
import { AlarmStatus } from "@/infrastructure/api/models/alarm";
import bus from "@/infrastructure/utils/bus";
import enumeratie from "@/infrastructure/utils/enumeratie";
import { getThemeImage } from "@/infrastructure/utils/getImage";
import DateInlineForm, { ModelValueItf } from "@/shared-ui/panel/dateInlineForm";
import NoData from "@/shared-ui/panel/noData";
import { panelCardLoadedKey } from "@/shared-ui/panel/panel-card-loaded-context";
import PanelCardLoading from "@/shared-ui/panel/panel-card-loading";
import { useStateStore } from "@/visualization-core/stores/use-state-store";

import "../../air-conditioning/_shared/air-conditioning-v2-shared.module.less";
import "../../energy-consumption/_shared/energy-v2-shared.less";

import styles from "./alarm-status-and-list.module.less";

const energyAlarmTitleIcon = getThemeImage("alarm-record.png");

const TABLE_ROW_HEIGHT = 36;

export const AlarmStatusAndList = defineComponent({
  name: "AlarmStatusAndList",
  props: {
    panelName: { type: String, required: false },
  },
  setup(props) {
    let timer = ref<any>(null);
    const { globalState } = useStateStore();
    const panelContext = resolveEquipmentManagementPanelContext(props.panelName);
    const useV2 = true;
    const panelClass = panelContext.isV2
      ? panelContext.panelClass
      : "visual-v2-sub-panel v2-panel-card air-conditioning-v2-panel security-overview-alarm-status-panel";
    const zoomClass = panelContext.isV2 ? panelContext.zoomClass : [];
    let timeFrame = ref<ModelValueItf>({ timeType: "THIS_YEAR", dateRange: [] });
    const colorList = ["#FFC700", "#74AEE7", "#00F27B", "#29C2FF"];

    const { alarmStatusOptions, alarmLeaveOptions } = enumeratie();
    const alarmCon = ref({
      count: 0,
      ratio: 0,
    });
    const alarmModalShow = ref(false);
    const alarmModalParameter = ref<Record<string, unknown>>({});
    const alarmModalStatus = ref("");

    let alarmStatusData = ref<AlarmStatus[]>([]);
    const loaded = ref(false);
    provide(panelCardLoadedKey, loaded);
    const tableSurfaceRef = ref<HTMLElement | null>(null);
    const visibleRows = ref(4);
    let resizeObserver: ResizeObserver | null = null;
    let resizeFrame = 0;

    const updateVisibleRows = (): void => {
      window.cancelAnimationFrame(resizeFrame);
      resizeFrame = window.requestAnimationFrame(() => {
        visibleRows.value = measureRollTableVisibleRows(tableSurfaceRef.value, {
          rowHeight: TABLE_ROW_HEIGHT,
          min: 3,
          max: 6,
        });
      });
    };

    const column = ref<any[]>([
      {
        title: "报警时间",
        dataIndex: "alarmTime",
        width: 96,
      },
      {
        title: "报警级别",
        dataIndex: "alarmLevelCode",
        flex: 0.9,
        slots: {
          customRender: "alarmLevelCode",
        },
      },
      {
        title: "报警事件",
        dataIndex: "alarmEventName",
        flex: 1.55,
      },
      {
        title: "状态",
        dataIndex: "alarmStatus",
        width: 64,
        slots: {
          customRender: "alarmStatus",
        },
      },
    ]);
    watch(
      () => globalState.business.currentAreaId,
      () => {
        clearInterval(timer.value);
        timer.value = setInterval(
          () => {
            init();
          },
          (window as any).config.pageLoopRequestTime,
        );
        init();
      },
    );
    const data = ref([]);
    const hasAlarmData = computed(
      () => loaded.value && (alarmCon.value.count > 0 || alarmStatusData.value.length > 0 || data.value.length > 0),
    );
    const statusStyle = computed(() => (key: string) => {
      let option = alarmStatusOptions.value.find((item) => {
        return item.value === key;
      });
      return option;
    });
    const leaveStyle = computed(() => (key: string) => {
      let option = alarmLeaveOptions.value.find((item) => {
        return item.value === key;
      });
      return option;
    });

    // 电气报警
    function changeTimeFrame() {
      getAlarmList();
    }
    // 报警状态数量和报警列表
    async function getAlarmList() {
      loaded.value = false;
      alarmStatusData.value = [];
      data.value = [];
      let params = {
        sceneType: globalState.business.currentMenu,
        areaId: globalState.business.currentAreaId,
        period: timeFrame.value.dateRange.join(","),
        type: timeFrame.value.timeType,
        pageSize: 50,
        pageNumber: 1,
      };
      try {
        const [status, res]: [any, any] = await Promise.all([statisticsStatus(params), alarmStatisticsList(params)]);
        alarmStatusData.value = (status?.alarmStatusStatistics ?? []).map((item, index) => {
          item.color = colorList[index];
          return item;
        });
        alarmCon.value = {
          count: Number(status?.alarmNum) || 0,
          ratio: Number(status?.chainRatio) || 0,
        };
        data.value = (res?.records ?? []).map((item) => {
          item.alarmTime = moment(item.alarmTime).format("YYYY-MM-DD");
          return item;
        });
      } catch {
        alarmCon.value = { count: 0, ratio: 0 };
      } finally {
        loaded.value = true;
      }
    }
    const handelClickRow = (record) => {
      if (record.alarmTargetCode) {
        bus.emit("equipmentPosition", record);
      }
    };
    function init() {
      getAlarmList();
    }
    let densityChangeHandler: (() => void) | null = null;
    onMounted(() => {
      init();
      timer.value = setInterval(
        () => {
          init();
        },
        (window as any).config.pageLoopRequestTime,
      );
      densityChangeHandler = (): void => {
        updateVisibleRows();
      };
      window.addEventListener(CARD_SLOT_DENSITY_CHANGE_EVENT, densityChangeHandler);
      if (typeof ResizeObserver !== "undefined") {
        resizeObserver = new ResizeObserver(updateVisibleRows);
        void nextTick(() => {
          if (tableSurfaceRef.value) resizeObserver?.observe(tableSurfaceRef.value);
          updateVisibleRows();
        });
      }
    });
    onBeforeUnmount(() => {
      if (densityChangeHandler) {
        window.removeEventListener(CARD_SLOT_DENSITY_CHANGE_EVENT, densityChangeHandler);
      }
      clearInterval(timer.value);
      resizeObserver?.disconnect();
      window.cancelAnimationFrame(resizeFrame);
    });
    watch(
      () => [loaded.value, data.value.length],
      () => {
        void nextTick(updateVisibleRows);
      },
    );

    const resolveStatusTone = (status?: string): "pending" | "processing" | "done" => {
      if (status === "ALARM_UN_CONFIRMED") return "pending";
      if (status === "ALARM_PROGRESS_CONFIRMED") return "processing";
      if (status === "ALARM_SUSPEND") return "processing";
      return "done";
    };

    const renderStatus = ({ record }: { record: Record<string, string> }): JSX.Element => {
      const option = statusStyle.value(record.alarmStatus);
      const tone = resolveStatusTone(record.alarmStatus);
      return <span class={["status", "status-tag", `is-${tone}`]}>{option?.label ?? "--"}</span>;
    };

    const renderLevel = ({ record }: { record: Record<string, string> }): JSX.Element => {
      const option = leaveStyle.value(record.alarmLevelCode);
      return (
        <span class={styles.levelText} style={option?.color ? { color: option.color } : undefined}>
          {option?.label ?? "--"}
        </span>
      );
    };

    const openAlarmModal = (item?: AlarmStatus): void => {
      const alarmStatus = resolveAlarmStatus(item);
      alarmModalStatus.value = alarmStatus;
      alarmModalParameter.value = createAlarmModalParameter(timeFrame.value, alarmStatus);
      alarmModalShow.value = true;
    };

    const closeAlarmModal = (): void => {
      alarmModalShow.value = false;
      alarmModalStatus.value = "";
    };

    const renderTable = (isZoom: boolean): JSX.Element => (
      <RollTable
        column={column.value}
        data={data.value}
        showLength={isZoom ? 9 : visibleRows.value}
        rowHeight={isZoom ? 40 : TABLE_ROW_HEIGHT}
        onClickRow={handelClickRow}
        v-slots={{
          alarmStatus: renderStatus,
          alarmLevelCode: renderLevel,
        }}
      />
    );

    const renderDateForm = (inHeader = false): JSX.Element => (
      <div class={inHeader ? "air-conditioning-header-toolbar" : "header"} data-no-zoom>
        <DateInlineForm
          modelValue={timeFrame.value}
          onUpdate:modelValue={(v) => {
            timeFrame.value = v;
          }}
          onSearch={changeTimeFrame}
        />
      </div>
    );

    const renderBody = (isZoom: boolean): JSX.Element => {
      if (!loaded.value) {
        return <PanelCardLoading zoom={isZoom} />;
      }
      if (!hasAlarmData.value) {
        return (
          <div
            class={[
              styles.cardBody,
              styles.emptySurface,
              isZoom ? styles.zoomBody : "",
              "air-conditioning-card-body",
              ...(isZoom ? zoomClass : []),
            ]}
            data-no-zoom
          >
            <NoData />
          </div>
        );
      }

      return (
        <div
          class={[styles.cardBody, isZoom ? styles.zoomBody : "", "air-conditioning-card-body", ...(isZoom ? zoomClass : [])]}
          data-no-zoom
        >
          <div class={styles.metricsHost}>
            <AlarmMetrics
              count={alarmCon.value.count}
              ratio={alarmCon.value.ratio}
              statuses={alarmStatusData.value}
              zoom={isZoom}
              onSummaryClick={() => openAlarmModal()}
              onStatusClick={(_event, item) => openAlarmModal(item)}
            />
          </div>
          <div
            ref={isZoom ? undefined : tableSurfaceRef}
            class={[styles.tableSurface, "table-panel", "visual-v2-roll-table", isZoom ? "is-zoom" : ""]}
            style={isZoom ? undefined : ({ "--visible-rows": String(visibleRows.value) } as Record<string, string>)}
          >
            {data.value.length > 0 ? (
              renderTable(isZoom)
            ) : (
              <div class={styles.tableEmpty}>
                <NoData />
              </div>
            )}
          </div>
        </div>
      );
    };

    return (): JSX.Element => (
      <>
        <div class="v2-panel-root">
          <SubPanelTemplate
            title="报警状态和报警列表统计"
            class={panelClass}
            zoomable={useV2}
            zoom-title="报警状态和报警列表统计详情"
            zoom-width={1000}
            v-slots={{
              ...(useV2
                ? {
                    titleIcon: () => <img src={energyAlarmTitleIcon} alt="" class="title-icon-img" />,
                    extra: () => renderDateForm(true),
                    "zoom-content": () => renderBody(true),
                  }
                : {}),
              default: () => renderBody(false),
            }}
          />
        </div>
        {alarmModalShow.value && (
          <ModalAlarmTable
            showModal={alarmModalShow.value}
            alarmStatus={alarmModalStatus.value}
            parameter={alarmModalParameter.value}
            onClose={closeAlarmModal}
          />
        )}
      </>
    );
  },
});

export default AlarmStatusAndList;
