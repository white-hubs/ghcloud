import { CaretDownOutlined } from "@ant-design/icons-vue";
import { Select, Skeleton } from "ant-design-vue";
import moment from "moment";
import { computed, defineComponent, onBeforeUnmount, onMounted, reactive, ref, watch } from "vue";

import ModalAlarmTable from "@/features/equipment/modal-table/modal-alarm-table";
import RollTable from "@/features/panel-shell/tables/roll-table/roll-table";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { alarmrecords, recordStatus } from "@/infrastructure/api/alarm";
import { cubeOuaaService } from "@/infrastructure/api/service";
import bus from "@/infrastructure/utils/bus";
import { getThemeImage } from "@/infrastructure/utils/getImage";
import CountTo from "@/shared-ui/panel/count-to/count-to";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";
import { useStateStore } from "@/visualization-core/stores/use-state-store";

import "./people-flow-alarm-record.module.less";

const processedIcon = getThemeImage("alarm-count-handled.png");
const alarmHandlingIcon = getThemeImage("alarm-count-unhandled.png");
const alarmTotalIcon = getThemeImage("alarm-count.png");
const alarmRecordIcon = getThemeImage("alarm-record.png");

interface ApplicationOption {
  code: string;
  name: string;
}

interface AlarmRecordItem {
  alarmTime?: string | number | Date;
  alarmLevelName?: string;
  alarmEventName?: string;
  alarmStatus?: string;
  [key: string]: unknown;
}

export const PeopleFlowAlarmRecord = defineComponent({
  name: "PeopleFlowAlarmRecord",
  props: {
    title: { type: String, default: "报警记录" },
  },
  setup(props) {
    const { globalState } = useStateStore();
    const getPopupContainer = (): HTMLElement => document.querySelector(".view") || document.body;

    const timeFilter = ref({ timeType: "THIS_YEAR", dateRange: [] as string[] });
    const applicationCode = ref<string | undefined>("TRAFFIC_DETECTION");
    const appOptions = ref<ApplicationOption[]>([]);
    const listData = ref<AlarmRecordItem[]>([]);
    const loading = ref(false);
    const alarmModalShow = ref(false);
    let refreshTimer: ReturnType<typeof setInterval> | null = null;

    const parameter = reactive({
      areaIds: "",
      alarmStatus: undefined as string | undefined,
      filterAlarmStatus: undefined as string | undefined,
      dateRange: [] as string[],
      applicationCode: undefined as string | undefined,
    });

    const columns = [
      { title: "报警时间", dataIndex: "alarmTime" },
      { title: "报警级别", dataIndex: "alarmLevelName" },
      { title: "报警事件", dataIndex: "alarmEventName" },
      { title: "状态", dataIndex: "alarmStatus", slots: { customRender: "alarmStatus" } },
    ];

    const statistics = reactive({ total: 0, processed: 0, pending: 0 });

    const alarmStatCards = computed(() => [
      {
        cardClass: "is-total",
        iconSrc: alarmTotalIcon,
        value: statistics.total,
        label: "报警数",
        valueClass: "",
        clickKey: undefined as string | undefined,
      },
      {
        cardClass: "is-processed",
        iconSrc: processedIcon,
        value: statistics.processed,
        label: "已处理",
        valueClass: "is-processed-value",
        clickKey: "已处理数",
      },
      {
        cardClass: "is-pending",
        iconSrc: alarmHandlingIcon,
        value: statistics.pending,
        label: "未处理",
        valueClass: "is-pending-value",
        clickKey: "未处理数",
      },
    ]);

    const closeModal = (): void => {
      alarmModalShow.value = false;
    };

    const handleStatisticClick = (value?: string): void => {
      parameter.alarmStatus = undefined;
      parameter.filterAlarmStatus = undefined;
      if (value === "未处理数") {
        parameter.alarmStatus = "ALARM_UN_CONFIRMED";
      } else if (value === "已处理数") {
        parameter.alarmStatus = "ALARM_HANDLER";
      }
      const range = timeFilter.value.dateRange;
      if (!range?.[0] || !range?.[1]) {
        parameter.dateRange = [
          moment().startOf("year").format("YYYY-MM-DD 00:00:00"),
          moment().endOf("year").format("YYYY-MM-DD 23:59:59"),
        ];
      } else {
        parameter.dateRange = [...range];
      }
      parameter.applicationCode = applicationCode.value;
      alarmModalShow.value = true;
    };

    const changeEventTime = async (): Promise<void> => {
      try {
        loading.value = true;
        const params = {
          sceneType: globalState.business.currentMenu,
          areaId: globalState.business.currentAreaId,
          period: timeFilter.value.dateRange.join(","),
          type: timeFilter.value.timeType,
          pageSize: 50,
          pageNumber: 1,
          applicationCode: applicationCode.value,
        };
        const [recordsResult, statusResult] = await Promise.all([alarmrecords(params), recordStatus(params)]);
        const records = Array.isArray(recordsResult?.records) ? recordsResult.records : [];

        statistics.total = Number(statusResult?.alarmNum) || 0;
        statistics.processed = Number(statusResult?.alarmHandlerNum) || 0;
        statistics.pending = Number(statusResult?.alarmUnresolvedHandlerNum) || 0;
        listData.value = records.map((item: AlarmRecordItem) => ({
          ...item,
          alarmTime: item.alarmTime ? moment(item.alarmTime).format("YYYY-MM-DD") : "--",
        }));
      } catch {
        statistics.total = 0;
        statistics.processed = 0;
        statistics.pending = 0;
        listData.value = [];
      } finally {
        loading.value = false;
      }
    };

    const openAlarmModal = (item: AlarmRecordItem): void => {
      if ((window as { config?: { entry?: string } }).config?.entry === "views") {
        bus.emit("setOpenAlarmModal", { ...item, hidePanel: true });
      } else {
        bus.emit("openAlarmModal", item);
      }
    };

    const renderStatus = (record: AlarmRecordItem): JSX.Element => {
      if (record.alarmStatus === "ALARM_UN_CONFIRMED") {
        return <span class="status is-pending">待处理</span>;
      }
      if (record.alarmStatus === "ALARM_PROGRESS_CONFIRMED") {
        return <span class="status is-processing">处理中</span>;
      }
      return <span class="status is-done">已处理</span>;
    };

    const renderStats = (isZoom: boolean): JSX.Element => (
      <div class="stats-row" data-no-zoom>
        {alarmStatCards.value.map((item) => (
          <button
            type="button"
            class={["stat-card", item.cardClass]}
            key={`${isZoom ? "zoom-" : ""}${item.label}`}
            onClick={() => handleStatisticClick(item.clickKey)}
          >
            <img src={item.iconSrc} alt="" class="stat-icon-img" />
            <span class="stat-content">
              <span class={["stat-value", item.valueClass]}>
                {isZoom ? item.value : <CountTo startVal={0} endVal={item.value} separator="" duration={2000} />}
              </span>
              <span class="stat-label">{item.label}</span>
            </span>
          </button>
        ))}
      </div>
    );

    const renderTable = (isZoom: boolean): JSX.Element => (
      <div class={["table-panel", "visual-v2-roll-table", isZoom ? "is-zoom" : ""]} data-no-zoom>
        {isZoom ? (
          <div class="zoom-table-viewport">
            <RollTable
              column={columns}
              data={listData.value}
              showLength={9999}
              class="zoom-roll-table"
              onClickRow={openAlarmModal}
              v-slots={{ alarmStatus: ({ record }: { record: AlarmRecordItem }) => renderStatus(record) }}
            />
          </div>
        ) : (
          <RollTable
            column={columns}
            data={listData.value}
            limitScrollNum={4}
            onClickRow={openAlarmModal}
            v-slots={{ alarmStatus: ({ record }: { record: AlarmRecordItem }) => renderStatus(record) }}
          />
        )}
      </div>
    );

    const getAppOptions = async (): Promise<void> => {
      try {
        const result = await cubeOuaaService.getTerminalApplications("bimops-manage-web");
        appOptions.value = Array.isArray(result) ? result : [];
      } catch {
        appOptions.value = [];
      }
    };

    const clearRefreshTimer = (): void => {
      if (refreshTimer !== null) {
        clearInterval(refreshTimer);
        refreshTimer = null;
      }
    };

    const startRefreshTimer = (): void => {
      clearRefreshTimer();
      const interval = Number((window as { config?: { pageLoopRequestTime?: number } }).config?.pageLoopRequestTime);
      if (interval > 0) {
        refreshTimer = setInterval(changeEventTime, interval);
      }
    };

    watch(
      () => globalState.business.currentAreaId,
      () => {
        void changeEventTime();
        startRefreshTimer();
      },
    );

    onMounted(() => {
      void changeEventTime();
      void getAppOptions();
      startRefreshTimer();
    });

    onBeforeUnmount(clearRefreshTimer);

    return () => (
      <div class="people-flow-alarm-record-v2-root v2-panel-root">
        <SubPanelTemplate
          title={props.title}
          class="visual-v2-sub-panel people-flow-alarm-record-v2-panel v2-panel-card"
          zoomable
          zoom-title={`${props.title}详情`}
          zoom-width={860}
          v-slots={{
            titleIcon: () => <img src={alarmRecordIcon} alt="" class="title-card-icon" />,
            extra: () => (
              <div class="record-toolbar" data-no-zoom>
                <Select
                  v-model:value={applicationCode.value}
                  placeholder="应用名称"
                  class="record-app-select"
                  popupClassName="date-inline-dropdown"
                  getPopupContainer={getPopupContainer}
                  allowClear
                  dropdownMatchSelectWidth={false}
                  onChange={changeEventTime}
                  v-slots={{
                    suffixIcon: () => <CaretDownOutlined class="record-filter-arrow" />,
                  }}
                >
                  {appOptions.value.map((item) => (
                    <Select.Option key={item.code} value={item.code}>
                      {item.name}
                    </Select.Option>
                  ))}
                </Select>
                <DateInlineForm v-model:modelValue={timeFilter.value} class="record-date-form" onSearch={changeEventTime} />
              </div>
            ),
            "zoom-content": () => (
              <div class="alarm-record-content people-flow-alarm-record-v2-panel is-zoom people-flow-alarm-list-zoom">
                {renderStats(true)}
                {renderTable(true)}
              </div>
            ),
          }}
        >
          <Skeleton loading={loading.value} active>
            <div class="alarm-record-content people-flow-alarm-record-v2-panel v2-panel-body">
              {renderStats(false)}
              {renderTable(false)}
            </div>
          </Skeleton>
        </SubPanelTemplate>
        <ModalAlarmTable show-modal={alarmModalShow.value} parameter={parameter} onClose={closeModal} />
      </div>
    );
  },
});

export default PeopleFlowAlarmRecord;
