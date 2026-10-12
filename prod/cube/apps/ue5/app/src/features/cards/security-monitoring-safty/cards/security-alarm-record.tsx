import { CaretDownOutlined } from "@ant-design/icons-vue";
import moment from "moment";
import { computed, defineComponent, nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from "vue";

import { CARD_SLOT_DENSITY_CHANGE_EVENT } from "@/features/cards/base-panel-render/card-slot-density";
import { measureRollTableVisibleRows } from "@/features/cards/base-panel-render/slot-visible-rows";
import ModalAlarmTableNew from "@/features/equipment/modal-table/modal-alarm-tableNew";
import RollTable from "@/features/panel-shell/tables/roll-table/roll-table";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { alarmrecords, recordStatus } from "@/infrastructure/api/alarm";
import { cubeAlarmCenterService } from "@/infrastructure/api/service";
import bus from "@/infrastructure/utils/bus";
import { getThemeImage } from "@/infrastructure/utils/getImage";
import CountTo from "@/shared-ui/panel/count-to/count-to";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";
import { useStateStore } from "@/visualization-core/stores/use-state-store";

import "./security-alarm-record.module.less";

const processedIcon = getThemeImage("alarm-count-handled.png");
const alarmHandlingIcon = getThemeImage("alarm-count-unhandled.png");
const alarmTotalIcon = getThemeImage("alarm-count.png");
const alarmRecordTitleIcon = getThemeImage("alarm-record.png");

const cardIcons = {
  alarmTotal: alarmTotalIcon,
  alarmHandling: alarmHandlingIcon,
  processed: processedIcon,
} as const;

const TABLE_ROW_HEIGHT = 36;

const renderAlarmStatus = (record: { alarmStatus?: string }): JSX.Element => {
  if (record.alarmStatus === "ALARM_UN_CONFIRMED") {
    return <span class="status status-tag is-pending">待处理</span>;
  }
  if (record.alarmStatus === "ALARM_PROGRESS_CONFIRMED") {
    return <span class="status status-tag is-processing">处理中</span>;
  }
  return <span class="status status-tag is-done">已处理</span>;
};

export const SecurityAlarmRecord = defineComponent({
  name: "SecurityAlarmRecord",
  props: {
    title: { type: String, default: "报警记录" },
  },
  setup(props) {
    const { globalState } = useStateStore();
    const getPopupContainer = (): HTMLElement => (document.querySelector(".view") as HTMLElement) || document.body;

    const timeTypeqs = ref({
      timeType: "THIS_YEAR",
      dateRange: [] as string[],
    });
    let timer: ReturnType<typeof setInterval> | null = null;
    const alarmModalShow = ref(false);
    const alarmTypeId = ref<string | undefined>(undefined);
    const listData = ref<Array<Record<string, unknown>>>([]);
    const alarmTypesList = ref<Array<{ label: string; value: string }>>([]);

    const parameter = reactive({
      areaIds: "",
      alarmStatus: "" as string | undefined,
      filterAlarmStatus: "" as string | undefined,
      dateRange: [] as string[],
      alarmTypeId: undefined as string | undefined,
    });

    const column = reactive([
      { title: "报警时间", dataIndex: "alarmTime" },
      { title: "报警级别", dataIndex: "alarmLevelName" },
      { title: "报警事件", dataIndex: "alarmEventName" },
      {
        title: "状态",
        dataIndex: "alarmStatus",
        slots: { customRender: "alarmStatus" },
      },
    ]);

    const deviceStatisticsrecord = reactive({
      title: "报警数",
      total: 0,
      itemize: [
        {
          name: "未处理数",
          label: "已处理数",
          value: 0,
          offline: 0,
          key: "OFFLINE",
        },
      ],
    });

    const alarmStatCards = computed(() => [
      {
        cardClass: "is-total",
        iconSrc: cardIcons.alarmTotal,
        value: deviceStatisticsrecord.total,
        label: deviceStatisticsrecord.title,
        valueClass: "",
        clickKey: undefined as string | undefined,
      },
      {
        cardClass: "is-processed",
        iconSrc: cardIcons.processed,
        value: deviceStatisticsrecord.itemize[0].value,
        label: deviceStatisticsrecord.itemize[0].label,
        valueClass: "is-processed-value",
        clickKey: "已处理数",
      },
      {
        cardClass: "is-pending",
        iconSrc: cardIcons.alarmHandling,
        value: deviceStatisticsrecord.itemize[0].offline,
        label: deviceStatisticsrecord.itemize[0].name,
        valueClass: "is-pending-value",
        clickKey: "未处理数",
      },
    ]);

    const rollTableSlots = {
      alarmStatus: ({ record }: { record: { alarmStatus?: string } }) => renderAlarmStatus(record),
    };
    const tableSurfaceRef = ref<HTMLElement | null>(null);
    const visibleRows = ref(5);
    let resizeObserver: ResizeObserver | null = null;
    let resizeFrame = 0;

    const updateVisibleRows = (): void => {
      window.cancelAnimationFrame(resizeFrame);
      resizeFrame = window.requestAnimationFrame(() => {
        visibleRows.value = measureRollTableVisibleRows(tableSurfaceRef.value, {
          rowHeight: TABLE_ROW_HEIGHT,
          min: 1,
          max: 8,
        });
      });
    };

    const closeModal = (): void => {
      alarmModalShow.value = false;
    };

    const handelClickItemize = (value?: string): void => {
      parameter.filterAlarmStatus = undefined;
      if (value === "未处理数") {
        parameter.alarmStatus = undefined;
        parameter.filterAlarmStatus = ["ALARM_HANDLER"].toString();
      } else if (value === "已处理数") {
        parameter.alarmStatus = "ALARM_HANDLER";
      } else {
        parameter.alarmStatus = undefined;
      }
      const range = timeTypeqs.value.dateRange;
      if (!range?.[0] || !range?.[1]) {
        parameter.dateRange = [
          moment().startOf("year").format("YYYY-MM-DD 00:00:00"),
          moment().endOf("year").format("YYYY-MM-DD 23:59:59"),
        ];
      } else {
        parameter.dateRange = [...range];
      }
      parameter.alarmTypeId = alarmTypeId.value;
      alarmModalShow.value = true;
    };

    const changeEventTime = async (): Promise<void> => {
      const params = {
        sceneType: globalState.business.currentMenu,
        areaId: globalState.business.currentAreaId,
        period: timeTypeqs.value.dateRange.join(","),
        type: timeTypeqs.value.timeType,
        pageSize: 50,
        pageNumber: 1,
        alarmTypeId: alarmTypeId.value,
      };
      const res = await alarmrecords(params);
      const data = await recordStatus(params);
      deviceStatisticsrecord.total = data.alarmNum;
      deviceStatisticsrecord.itemize = [
        {
          name: "未处理数",
          label: "已处理数",
          value: data.alarmHandlerNum,
          offline: data.alarmUnresolvedHandlerNum,
          key: "OFFLINE",
        },
      ];
      listData.value = (res.records ?? []).map((item: Record<string, unknown>) => ({
        ...item,
        alarmTime: moment(item.alarmTime as string).format("YYYY-MM-DD"),
      }));
    };

    const openAlarmModal = (item: Record<string, unknown>): void => {
      if ((window as Window & { config?: { entry?: string } }).config?.entry === "views") {
        bus.emit("setOpenAlarmModal", { ...item, hidePanel: true });
      } else {
        bus.emit("openAlarmModal", item);
      }
    };

    const getAlarmTypesOptions = async (): Promise<void> => {
      const data = await cubeAlarmCenterService.getSatAlarmTypes();
      alarmTypesList.value = data?.map((e) => ({ label: e.name, value: e.id }));
    };

    const init = (): void => {
      void changeEventTime();
      void getAlarmTypesOptions();
    };

    watch(
      () => globalState.business.currentAreaId,
      () => {
        if (timer) clearInterval(timer);
        timer = setInterval(
          () => {
            init();
          },
          (window as Window & { config?: { pageLoopRequestTime?: number } }).config?.pageLoopRequestTime ?? 60000,
        );
        init();
      },
    );

    let densityChangeHandler: (() => void) | null = null;
    onMounted(() => {
      init();
      timer = setInterval(
        () => {
          init();
        },
        (window as Window & { config?: { pageLoopRequestTime?: number } }).config?.pageLoopRequestTime ?? 60000,
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

    watch(
      () => listData.value.length,
      () => {
        void nextTick(updateVisibleRows);
      },
    );

    onBeforeUnmount(() => {
      if (densityChangeHandler) {
        window.removeEventListener(CARD_SLOT_DENSITY_CHANGE_EVENT, densityChangeHandler);
      }
      if (timer) clearInterval(timer);
      resizeObserver?.disconnect();
      window.cancelAnimationFrame(resizeFrame);
    });

    const renderStatsRow = (isZoom: boolean): JSX.Element => (
      <div class="stats-row" data-no-zoom>
        {alarmStatCards.value.map((item) => (
          <button
            type="button"
            class={["stat-card", item.cardClass]}
            key={`${isZoom ? "zoom-" : ""}${item.label}`}
            onClick={(event) => {
              event.stopPropagation();
              handelClickItemize(item.clickKey);
            }}
            onPointerdown={(event) => event.stopPropagation()}
          >
            <span class="stat-icon stat-icon-image" aria-hidden="true">
              <img src={item.iconSrc} alt="" class="stat-icon-img" />
            </span>
            <span class="stat-content">
              <span class="stat-label">{item.label}</span>
              <span class={["stat-value", item.valueClass]}>
                {isZoom ? item.value : <CountTo startVal={0} endVal={item.value} separator="" duration={4000} />}
              </span>
            </span>
          </button>
        ))}
      </div>
    );

    const tableVisibleRows = Math.max(1, Math.min(visibleRows.value, listData.value.length || visibleRows.value));

    const renderBody = (isZoom: boolean): JSX.Element => (
      <div class={["security-alarm-record-v2", "security-alarm-record-v2-panel", isZoom ? "is-zoom" : ""]}>
        {renderStatsRow(isZoom)}
        <div
          ref={isZoom ? undefined : tableSurfaceRef}
          class={["table-panel", "visual-v2-roll-table", isZoom ? "is-zoom" : ""]}
          style={isZoom ? undefined : ({ "--visible-rows": String(tableVisibleRows) } as Record<string, string>)}
          data-no-zoom
        >
          {isZoom ? (
            <div class="zoom-table-viewport">
              <RollTable
                column={column}
                data={listData.value}
                showLength={9999}
                class="zoom-roll-table"
                onClickRow={openAlarmModal}
                v-slots={rollTableSlots}
              />
            </div>
          ) : (
            <RollTable
              column={column}
              data={listData.value}
              showLength={tableVisibleRows}
              rowHeight={TABLE_ROW_HEIGHT}
              onClickRow={openAlarmModal}
              v-slots={rollTableSlots}
            />
          )}
        </div>
      </div>
    );

    return () => (
      <div class="v2-panel-root security-alarm-record-v2-root">
        <SubPanelTemplate
          title={props.title}
          class="visual-v2-sub-panel v2-panel-card security-alarm-record-v2-panel"
          zoomable
          zoom-title={`${props.title}详情`}
          zoom-width={860}
          v-slots={{
            titleIcon: () => <img src={alarmRecordTitleIcon} alt="" class="title-icon-img" />,
            extra: () => (
              <div class="toolbar-extra record-toolbar-filters" data-no-zoom>
                <a-select
                  value={alarmTypeId.value}
                  onUpdate:value={(v: string | undefined) => {
                    alarmTypeId.value = v;
                  }}
                  placeholder="应用名称"
                  class="panel-filter-select record-app-select"
                  popupClassName="date-inline-dropdown"
                  getPopupContainer={getPopupContainer}
                  allowClear
                  dropdownMatchSelectWidth={false}
                  onChange={changeEventTime}
                  v-slots={{
                    suffixIcon: () => <CaretDownOutlined class="record-filter-arrow" />,
                  }}
                >
                  {alarmTypesList.value.map((item) => (
                    <a-select-option value={item.value} key={item.value}>
                      {item.label}
                    </a-select-option>
                  ))}
                </a-select>
                <DateInlineForm
                  class="record-date-form"
                  modelValue={timeTypeqs.value}
                  onUpdate:modelValue={(v) => {
                    timeTypeqs.value = v;
                  }}
                  onSearch={changeEventTime}
                />
              </div>
            ),
            default: () => renderBody(false),
            "zoom-content": () => renderBody(true),
          }}
        />
        <ModalAlarmTableNew showModal={alarmModalShow.value} parameter={parameter} onClose={closeModal} />
      </div>
    );
  },
});

export default SecurityAlarmRecord;
