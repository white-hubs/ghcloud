import { message } from "ant-design-vue";
import dayjs, { Dayjs } from "dayjs";
import { computed, defineComponent, onBeforeUnmount, onMounted, reactive, ref, watch } from "vue";

import { UeClient } from "@ghcloud/cube-visual-sdk";

import Modal from "./modal";
import Alarm from "@/features/equipment/alarmdetails/equipmentMode";
import { getPopupContainer, POPOVER_CLASS, renderPopoverText, toDisplayText } from "@/features/equipment/modal-table/render-popover-text";
import { alarmrecords, alarmStatisticsList } from "@/infrastructure/api/alarm";
import { debounce } from "@/infrastructure/utils/common";
import enumerateData from "@/infrastructure/utils/enumeratie";
import NoData from "@/shared-ui/panel/noData";
import { useVisualTheme } from "@/visualization-core/hooks/use-visual-theme";
import { useStateStore } from "@/visualization-core/stores/use-state-store";

import "./modal-equipmentAll-table.module.less";
import "./modal-alarm-tableNew.module.less";

const DROPDOWN_CLASS = "visual-data-modal-dropdown";

interface AlarmRecord {
  id?: string;
  alarmTime?: string;
  alarmTargetName?: string;
  alarmTargetCode?: string;
  alarmLevelName?: string;
  alarmEventName?: string;
  alarmStatus?: string;
  alarmStatusName?: string;
}

type AlarmStatusTone = "pending" | "processing" | "suspend" | "done" | "default";

const resolveAlarmStatusTone = (record: AlarmRecord): AlarmStatusTone => {
  const code = String(record.alarmStatus ?? "").trim();
  const name = String(record.alarmStatusName ?? "").trim();
  if (code === "ALARM_UN_CONFIRMED" || name.includes("待")) return "pending";
  if (code === "ALARM_PROGRESS_CONFIRMED" || name.includes("处理中")) return "processing";
  if (code === "ALARM_SUSPEND" || name.includes("挂起")) return "suspend";
  if (code === "ALARM_HANDLER" || name.includes("已处理")) return "done";
  return "default";
};

const renderAlarmStatusCell = (record: AlarmRecord): JSX.Element => {
  const label = toDisplayText(record.alarmStatusName);
  if (label === "--") {
    return <span class="device-record-cell-text">--</span>;
  }
  const toneClassMap: Record<AlarmStatusTone, string> = {
    pending: "is-pending",
    processing: "is-processing",
    suspend: "is-suspend",
    done: "is-done",
    default: "is-default",
  };
  return <span class={["alarm-record-status-tag", toneClassMap[resolveAlarmStatusTone(record)]]}>{label}</span>;
};

export const ModalAlarmTableNew = defineComponent({
  name: "ModalAlarmTableNew",
  props: {
    parameter: { type: Object, required: false },
    alarmStatus: { type: String, required: false },
    alarmLevelCode: { type: String, required: false },
    showModal: { type: Boolean, required: true, default: false },
  },
  emits: ["close"],
  setup(props, { emit }) {
    const { globalState } = useStateStore();
    const { currentTheme } = useVisualTheme();
    const themeClassName = computed(() => `device-records-theme-${currentTheme.value}`);
    const modalWrapClassName = computed(
      () => `modal-table-alarm modal-table-device equipment-data-list-modal alarm-records-modal ${themeClassName.value}`,
    );
    const dropdownClassName = computed(() => `${DROPDOWN_CLASS} ${themeClassName.value}`);

    const ueClient = UeClient.getInstance();
    const { alarmLeaveOptions } = enumerateData();
    const entry = ref(window.config.entry);

    const getLevelColor = (name?: string): string => {
      if (!name) return "";
      return alarmLeaveOptions.value.find((res) => res.label == `${name}报警`)?.color || "";
    };

    const time = ref<Dayjs[]>(
      props.parameter?.dateRange?.length > 1 ? [dayjs(props.parameter.dateRange[0]), dayjs(props.parameter.dateRange[1])] : [],
    );
    const sourcePeriod = ref("");
    const keyword = ref("");
    const datainfo = reactive<Record<string, any>>({
      period: "",
      alarmLevelId: "",
      alarmStatus: "",
      alarmLevelCode: "",
      pageSize: 10,
      pageNumber: 1,
      total: 0,
    });

    const dataSource = ref<AlarmRecord[]>([]);
    const loadingDataSource = ref(false);
    const alarmDetailData = ref({});
    const show = ref(false);
    let requestSequence = 0;

    const detiles = (item: AlarmRecord): void => {
      alarmDetailData.value = item;
      show.value = true;
    };

    const closeDevicePanel = (): void => {
      emit("close");
      show.value = false;
    };

    const closeAlarmDetail = (): void => {
      show.value = false;
    };

    const position = async (item: AlarmRecord): Promise<void> => {
      await ueClient.saveNowViewPoint();
      ueClient.send("getActorById", { id: item.alarmTargetCode }, function (res) {
        if (res.id) {
          closeModal();
          ueClient.send("focusActor", { id: res.id });
          ueClient.send("startFlash", { id: res.id, level: 1 });
          ueClient.send("showShell", { id: res.id });
        } else {
          message.error("模型中未找到对应设备");
        }
      });
    };

    const alarmHandleEnumerate = [
      { label: "所有", value: "" },
      { label: "待接收", value: "ALARM_UN_CONFIRMED" },
      { label: "处理中", value: "ALARM_PROGRESS_CONFIRMED" },
      { label: "已挂起", value: "ALARM_SUSPEND" },
      { label: "已处理", value: "ALARM_HANDLER" },
    ];

    const alarmLevelCodeEnumerate = [
      { label: "所有", value: "" },
      { label: "一级报警", value: "one_level" },
      { label: "二级报警", value: "two_level" },
      { label: "三级报警", value: "three_level" },
      { label: "四级报警", value: "four_level" },
    ];

    const columns = [
      {
        title: "报警时间",
        dataIndex: "alarmTime",
        key: "alarmTime",
        ellipsis: true,
        width: 150,
        align: "center" as const,
        customRender: ({ record }: { record: AlarmRecord }) =>
          renderPopoverText(record.alarmTime ? dayjs(record.alarmTime).format("YYYY-MM-DD HH:mm:ss") : ""),
      },
      {
        title: "报警设备",
        dataIndex: "alarmTargetName",
        key: "alarmTargetName",
        ellipsis: true,
        width: 150,
        align: "center" as const,
        customRender: ({ text }: { text?: string }) => renderPopoverText(text),
      },
      {
        title: "报警等级",
        dataIndex: "alarmLevelName",
        key: "alarmLevelName",
        ellipsis: true,
        width: 80,
        align: "center" as const,
        customRender: ({ record }: { record: AlarmRecord }) =>
          renderPopoverText(record.alarmLevelName, { color: getLevelColor(record.alarmLevelName) }),
      },
      {
        title: "报警事件",
        dataIndex: "alarmEventName",
        key: "alarmEventName",
        ellipsis: true,
        width: 150,
        align: "center" as const,
        customRender: ({ text }: { text?: string }) => renderPopoverText(text),
      },
      {
        title: "处理状态",
        dataIndex: "alarmStatusName",
        key: "alarmStatusName",
        ellipsis: true,
        width: 88,
        align: "center" as const,
        customRender: ({ record }: { record: AlarmRecord }) => renderAlarmStatusCell(record),
      },
      {
        title: "操作",
        key: "action",
        width: 100,
        align: "center" as const,
        customRender: ({ record }: { record: AlarmRecord }) => (
          <div class="row-actions">
            <a
              onClick={(event: MouseEvent) => {
                event.preventDefault();
                event.stopPropagation();
                detiles(record);
              }}
            >
              详情
            </a>
            {entry.value == "views" && (
              <a
                onClick={(event: MouseEvent) => {
                  event.preventDefault();
                  event.stopPropagation();
                  void position(record);
                }}
              >
                定位
              </a>
            )}
          </div>
        ),
      },
    ];

    const onShowSizeChange = (current: number, size: number): void => {
      datainfo.pageNumber = current;
      datainfo.pageSize = size;
      void getData();
    };

    function updateTime(): void {
      if (!props.parameter?.dateRange || props.parameter?.dateRange?.length < 2) {
        time.value = [];
        sourcePeriod.value = "";
        return;
      }
      time.value = [dayjs(props.parameter.dateRange[0]), dayjs(props.parameter.dateRange[1])];
      sourcePeriod.value = props.parameter.dateRange.join(",");
    }

    function applyParameterToDatainfo(): void {
      const p = props.parameter ?? {};
      if (props.alarmStatus) {
        datainfo.alarmStatus = props.alarmStatus;
      } else if ("alarmStatus" in p) {
        // 空字符串表示「所有」，需原样透传；勿用 ?? 把 "" 丢掉
        datainfo.alarmStatus = p.alarmStatus ?? "";
      }
      // 对齐旧版 modal-alarm-table：未传级别时用 undefined，避免空串误过滤
      const levelCode = props.alarmLevelCode ?? p.alarmLevelCode;
      datainfo.alarmLevelCode = levelCode || undefined;
      datainfo.alarmHandlerResult = (p.alarmHandleResult ?? p.alarmHandlerResult) || undefined;
      datainfo.applicationCode = p.applicationCode || undefined;
      datainfo.alarmTypeId = p.alarmTypeId || undefined;
      datainfo.alarmEventTypeId = p.alarmEventTypeId || undefined;
      datainfo.alarmEvent = p.alarmEvent || undefined;
      datainfo.areaId = p.areaIds ? p.areaIds : globalState.business.currentAreaId;
      datainfo.sceneType = globalState.business.currentMenu;
      // 部门处理排名 / 人员处理排名 / 设备标签下钻（旧版 modal-alarm-table 透传字段）
      datainfo.departmentId = p.departmentId || undefined;
      datainfo.userId = p.userId || undefined;
      datainfo.deviceTags = p.deviceTags || undefined;
      datainfo.filterAreaIds = p.filterAreaIds || undefined;
      datainfo.filterAlarmStatus = p.filterAlarmStatus || undefined;
      datainfo.type = p.timeType ?? p.type ?? undefined;
      updateTime();
    }

    const getData = async (): Promise<void> => {
      const currentRequest = ++requestSequence;
      loadingDataSource.value = true;
      try {
        if (sourcePeriod.value) {
          datainfo.period = sourcePeriod.value;
        } else if (time.value?.length) {
          datainfo.period = dayjs(time.value[0]).format("YYYY-MM-DD 00:00:00") + "," + dayjs(time.value[1]).format("YYYY-MM-DD 23:59:59");
        } else {
          datainfo.period = "";
        }
        datainfo.keyword = keyword.value;
        // 有部门/人员/标签筛选时走 alarm-records，与旧版 command-dispatch 下钻一致
        const useLegacyRecords = Boolean(datainfo.departmentId || datainfo.userId || datainfo.deviceTags);
        const data = useLegacyRecords ? await alarmrecords(datainfo) : await alarmStatisticsList(datainfo);
        if (currentRequest !== requestSequence) return;
        dataSource.value = Array.isArray(data?.records) ? data.records : [];
        datainfo.total = data?.total ?? 0;
      } finally {
        if (currentRequest === requestSequence) {
          loadingDataSource.value = false;
        }
      }
    };

    const query = (): void => {
      datainfo.pageNumber = 1;
      void getData();
    };

    const debouncedQuery = debounce(query, 300);

    const queryImmediately = (): void => {
      debouncedQuery.cancel();
      query();
    };

    const handleFilterSubmit = (event: Event): void => {
      event.preventDefault();
      queryImmediately();
    };

    const reset = (): void => {
      debouncedQuery.cancel();
      time.value = [];
      keyword.value = "";
      Object.assign(datainfo, {
        period: "",
        alarmLevelId: "",
        alarmStatus: "",
        alarmLevelCode: undefined,
        alarmEventTypeId: undefined,
        departmentId: undefined,
        userId: undefined,
        deviceTags: undefined,
        alarmEvent: undefined,
        filterAreaIds: undefined,
        filterAlarmStatus: undefined,
        type: undefined,
        pageSize: 10,
        pageNumber: 1,
        total: 0,
      });
      applyParameterToDatainfo();
      void getData();
    };

    const closeModal = (): void => {
      debouncedQuery.cancel();
      emit("close");
    };

    watch(
      () => props.showModal,
      () => {
        if (props.showModal) {
          applyParameterToDatainfo();
          void getData();
        } else {
          debouncedQuery.cancel();
        }
      },
    );

    watch(
      () => props.parameter,
      () => {
        if (props.showModal) {
          applyParameterToDatainfo();
          void getData();
        }
      },
      { deep: true },
    );

    onMounted(() => {
      applyParameterToDatainfo();
      void getData();
    });

    onBeforeUnmount(() => {
      debouncedQuery.cancel();
    });

    return () => (
      <>
        <Modal title="报警记录" width="1250px" show={props.showModal} onClose={closeModal} wrapClassName={modalWrapClassName.value}>
          <div class="device-records-content">
            <form class="filter-toolbar filter-form" onSubmit={handleFilterSubmit}>
              <div class="filter-fields">
                <div class="filter-item filter-item-status">
                  <span class="filter-label">处理状态</span>
                  <a-select
                    value={datainfo.alarmStatus}
                    onUpdate:value={(v: string) => {
                      datainfo.alarmStatus = v;
                      queryImmediately();
                    }}
                    class="filter-control-select"
                    getPopupContainer={getPopupContainer}
                    popupClassName={dropdownClassName.value}
                    dropdownClassName={dropdownClassName.value}
                  >
                    {alarmHandleEnumerate.map((item) => (
                      <a-select-option key={item.value || "all"} value={item.value}>
                        {item.label}
                      </a-select-option>
                    ))}
                  </a-select>
                </div>
                <div class="filter-item filter-item-level">
                  <span class="filter-label">报警等级</span>
                  <a-select
                    value={datainfo.alarmLevelCode}
                    onUpdate:value={(v: string) => {
                      datainfo.alarmLevelCode = v;
                      queryImmediately();
                    }}
                    class="filter-control-select"
                    getPopupContainer={getPopupContainer}
                    popupClassName={dropdownClassName.value}
                    dropdownClassName={dropdownClassName.value}
                  >
                    {alarmLevelCodeEnumerate.map((item) => (
                      <a-select-option key={item.value || "all"} value={item.value}>
                        {item.label}
                      </a-select-option>
                    ))}
                  </a-select>
                </div>
                <div class="filter-item filter-item-time">
                  <span class="filter-label">报警时间</span>
                  <a-range-picker
                    class="alarm-time-picker filter-control-picker"
                    value={time.value}
                    onUpdate:value={(v: Dayjs[]) => {
                      time.value = v;
                      sourcePeriod.value = "";
                      queryImmediately();
                    }}
                    format="YYYY-MM-DD"
                    allowClear={false}
                    getPopupContainer={getPopupContainer}
                    popupClassName={dropdownClassName.value}
                    dropdownClassName={dropdownClassName.value}
                  />
                </div>
                <div class="filter-item filter-item-keyword">
                  <span class="filter-label">关键字</span>
                  <a-input
                    value={keyword.value}
                    onUpdate:value={(v: string) => {
                      keyword.value = v;
                      debouncedQuery();
                    }}
                    class="filter-keyword filter-control-input"
                    placeholder="请输入关键字"
                    allowClear
                  />
                </div>
                <div class="filter-item filter-item-actions">
                  <div class="filter-actions">
                    <a-button type="primary" size="small" html-type="submit" loading={loadingDataSource.value}>
                      查询
                    </a-button>
                    <a-button size="small" html-type="button" class="reset-btn" onClick={reset}>
                      重置
                    </a-button>
                  </div>
                </div>
              </div>
            </form>

            <div class="table-panel">
              <div class="table-wrapper">
                <a-table
                  class="device-records-table"
                  columns={columns}
                  dataSource={dataSource.value}
                  loading={loadingDataSource.value}
                  pagination={false}
                  rowKey={(record: AlarmRecord, index?: number) => record.id || `${record.alarmTime}-${record.alarmTargetCode}-${index}`}
                  scroll={{ y: 420 }}
                  locale={{ emptyText: <NoData /> }}
                />
              </div>
              <a-pagination
                class="table-pagination"
                current={datainfo.pageNumber}
                onUpdate:current={(v: number) => {
                  datainfo.pageNumber = v;
                }}
                pageSize={datainfo.pageSize}
                onUpdate:pageSize={(v: number) => {
                  datainfo.pageSize = v;
                }}
                showSizeChanger
                onChange={onShowSizeChange}
                total={datainfo.total}
                show-total={(total: number) => `总数 ${total}`}
                selectProps={{
                  getPopupContainer,
                  popupClassName: dropdownClassName.value,
                  dropdownClassName: dropdownClassName.value,
                }}
              />
            </div>
          </div>
        </Modal>
        {show.value && (
          <Alarm
            showModal={show.value}
            onCloseDevicePanel={closeDevicePanel}
            alarmDetailData={alarmDetailData.value}
            onClose={closeAlarmDetail}
            isalarm={true}
          />
        )}
      </>
    );
  },
});

export default ModalAlarmTableNew;
