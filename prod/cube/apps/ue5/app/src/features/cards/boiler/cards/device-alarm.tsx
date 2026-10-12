import moment from "moment";
import { computed, defineComponent, onMounted, reactive, ref, provide } from "vue";

import CardTitleIcon from "@/features/cards/_shared/card-title-icon/card-title-icon";
import { BOILER_PANEL_CLASS, boilerZoomClass } from "@/features/cards/boiler/_shared/boiler-panel-context";
import ModalAlarmTable from "@/features/equipment/modal-table/modal-alarm-tableNew";
import RollTable from "@/features/panel-shell/tables/roll-table/roll-table";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { alarmrecords, recordStatus } from "@/infrastructure/api/alarm";
import bus from "@/infrastructure/utils/bus";
import { getThemeImage } from "@/infrastructure/utils/getImage";
import CountTo from "@/shared-ui/panel/count-to/count-to";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";
import NoData from "@/shared-ui/panel/noData";
import { panelCardLoadedKey } from "@/shared-ui/panel/panel-card-loaded-context";
import PanelCardLoading from "@/shared-ui/panel/panel-card-loading";
import { ModelValueItf } from "@/shared-ui/panel/types";
import { useStateStore } from "@/visualization-core/stores/use-state-store";

import "./device-alarm.module.less";

const processedIcon = getThemeImage("alarm-count-handled.png");
const alarmHandlingIcon = getThemeImage("alarm-count-unhandled.png");
const alarmTotalIcon = getThemeImage("alarm-count.png");
const alarmRecordIcon = getThemeImage("alarm-record.png");

interface AlarmRecordItem {
  alarmTime?: string | number | Date;
  alarmLevelName?: string;
  alarmEventName?: string;
  alarmStatus?: string;
  [key: string]: unknown;
}

const renderAlarmStatus = (record: { alarmStatus?: string }): JSX.Element => {
  if (record.alarmStatus === "ALARM_UN_CONFIRMED") {
    return <span class="status is-pending">待处理</span>;
  }
  if (record.alarmStatus === "ALARM_PROGRESS_CONFIRMED") {
    return <span class="status is-processing">处理中</span>;
  }
  return <span class="status is-done">已处理</span>;
};

export const DeviceAlarm = defineComponent({
  name: "DeviceAlarm",
  props: {
    title: { type: String, default: "报警列表" },
  },
  setup(props) {
    const { globalState } = useStateStore();

    const timeFilter = ref<ModelValueItf>({
      timeType: "THIS_YEAR",
      dateRange: [],
    });
    const listData = ref<AlarmRecordItem[]>([]);
    const loaded = ref(false);
    provide(panelCardLoadedKey, loaded);
    const alarmModalShow = ref(false);

    const parameter = reactive({
      alarmStatus: undefined as string | undefined,
      dateRange: [] as string[],
    });

    const statistics = reactive({
      total: 0,
      pending: 0,
      processed: 0,
    });

    const column = reactive([
      { title: "报警时间", dataIndex: "alarmTime", width: 148, align: "left" as const },
      { title: "报警级别", dataIndex: "alarmLevelName", align: "left" as const, flex: 1 },
      { title: "报警事件", dataIndex: "alarmEventName", align: "left" as const, flex: 1.2 },
      {
        title: "状态",
        dataIndex: "alarmStatus",
        align: "left" as const,
        width: 64,
        slots: { customRender: "alarmStatus" },
      },
    ]);

    const zoomColumn = reactive([
      { title: "报警时间", dataIndex: "alarmTime", width: 180, align: "left" as const },
      { title: "报警级别", dataIndex: "alarmLevelName", align: "left" as const, flex: 1 },
      { title: "报警事件", dataIndex: "alarmEventName", align: "left" as const, flex: 1.2 },
      {
        title: "状态",
        dataIndex: "alarmStatus",
        align: "left" as const,
        width: 72,
        slots: { customRender: "alarmStatus" },
      },
    ]);

    const alarmStatCards = computed(() => [
      {
        cardClass: "is-total",
        iconSrc: alarmTotalIcon,
        value: statistics.total,
        label: "报警总数",
        valueClass: "",
        clickKey: undefined as string | undefined,
      },
      {
        cardClass: "is-pending",
        iconSrc: alarmHandlingIcon,
        value: statistics.pending,
        label: "未处理数",
        valueClass: "is-pending-value",
        clickKey: "未处理数",
      },
      {
        cardClass: "is-processed",
        iconSrc: processedIcon,
        value: statistics.processed,
        label: "已处理数",
        valueClass: "is-processed-value",
        clickKey: "已处理数",
      },
    ]);

    const fetchAlarmData = async (): Promise<void> => {
      const params = {
        sceneType: globalState.business.currentMenu,
        areaId: globalState.business.currentAreaId,
        period: timeFilter.value.dateRange?.join(",") ?? "",
        type: timeFilter.value.timeType,
        pageSize: 50,
        pageNumber: 1,
      };
      try {
        const [recordsResult, statusResult] = await Promise.all([alarmrecords(params), recordStatus(params)]);
        const records = Array.isArray(recordsResult?.records) ? recordsResult.records : [];
        statistics.total = Number(statusResult?.alarmNum) || 0;
        statistics.processed = Number(statusResult?.alarmHandlerNum) || 0;
        statistics.pending = Number(statusResult?.alarmUnresolvedHandlerNum) || 0;
        listData.value = records.map((item: AlarmRecordItem) => ({
          ...item,
          alarmTime: item.alarmTime ? moment(item.alarmTime).format("YYYY-MM-DD HH:mm") : "--",
        }));
      } catch {
        statistics.total = 0;
        statistics.processed = 0;
        statistics.pending = 0;
        listData.value = [];
      } finally {
        loaded.value = true;
      }
    };

    const openStatisticModal = (clickKey?: string): void => {
      if (clickKey === "未处理数") {
        parameter.alarmStatus = "ALARM_UN_CONFIRMED";
      } else if (clickKey === "已处理数") {
        parameter.alarmStatus = "ALARM_HANDLER";
      } else {
        parameter.alarmStatus = undefined;
      }
      parameter.dateRange = [...(timeFilter.value.dateRange ?? [])];
      alarmModalShow.value = true;
    };

    const closeModal = (): void => {
      alarmModalShow.value = false;
    };

    const handelClickRow = (record: AlarmRecordItem): void => {
      if ((window as { config?: { entry?: string } }).config?.entry === "views") {
        bus.emit("setOpenAlarmModal", { ...record, hidePanel: true });
      } else {
        bus.emit("openAlarmModal", record);
      }
    };

    onMounted(() => {
      void fetchAlarmData();
    });

    const renderBody = (isZoom: boolean): JSX.Element => {
      if (!loaded.value) {
        return <PanelCardLoading zoom={isZoom} />;
      }
      if (loaded.value && !listData.value.length && !statistics.total) {
        return (
          <div class="up-empty boiler-alarm-empty">
            <NoData />
          </div>
        );
      }

      return (
        <>
          <div class="stats-row" data-no-zoom>
            {alarmStatCards.value.map((item) => (
              <div
                key={`${isZoom ? "zoom-" : ""}${item.label}`}
                class={["stat-card", item.cardClass]}
                onClick={() => openStatisticModal(item.clickKey)}
              >
                <div class="stat-icon stat-icon-image" aria-hidden="true">
                  <img src={item.iconSrc} alt="" class="stat-icon-img" />
                </div>
                <div class="stat-content">
                  <div class={["stat-value", item.valueClass]}>
                    {isZoom ? item.value : <CountTo startVal={0} endVal={item.value} separator="" duration={2000} />}
                  </div>
                  <div class="stat-label">{item.label}</div>
                </div>
              </div>
            ))}
          </div>
          <div class={["table-panel", "visual-v2-roll-table", "boiler-alarm-roll-table", isZoom ? "is-zoom" : ""]} data-no-zoom>
            {isZoom ? (
              <div class="zoom-table-viewport">
                <RollTable
                  column={zoomColumn}
                  data={listData.value}
                  show-length={9999}
                  class="zoom-roll-table"
                  onClickRow={handelClickRow}
                  v-slots={{
                    alarmStatus: ({ record }: { record: { alarmStatus: string } }) => renderAlarmStatus(record),
                  }}
                />
              </div>
            ) : listData.value.length ? (
              <RollTable
                column={column}
                data={listData.value}
                showLength={5}
                onClickRow={handelClickRow}
                v-slots={{
                  alarmStatus: ({ record }: { record: { alarmStatus: string } }) => renderAlarmStatus(record),
                }}
              />
            ) : (
              <div class="up-empty">
                <NoData />
              </div>
            )}
          </div>
        </>
      );
    };

    return (): JSX.Element => (
      <>
        <div class="v2-panel-root boiler-device-alarm-v2-root">
          <SubPanelTemplate
            title={props.title}
            class="visual-v2-sub-panel v2-panel-card boiler-device-alarm-v2-panel"
            zoomable
            zoom-title={`${props.title}详情`}
            zoom-width={860}
            v-slots={{
              titleIcon: () => <img src={alarmRecordIcon} alt="" class="title-icon-img" />,
              extra: () => (
                <div class="header-toolbar" data-no-zoom>
                  <DateInlineForm
                    modelValue={timeFilter.value}
                    onUpdate:modelValue={(v) => {
                      timeFilter.value = v;
                    }}
                    onSearch={fetchAlarmData}
                  />
                </div>
              ),
              default: () => (
                <div class="boiler-alarm-body" data-no-zoom>
                  {renderBody(false)}
                </div>
              ),
              "zoom-content": () => (
                <div class="boiler-alarm-body is-zoom" data-no-zoom>
                  {renderBody(true)}
                </div>
              ),
            }}
          />
        </div>
        <modalAlarmTable show-modal={alarmModalShow.value} parameter={parameter} onClose={closeModal} />
      </>
    );
  },
});

export default DeviceAlarm;
