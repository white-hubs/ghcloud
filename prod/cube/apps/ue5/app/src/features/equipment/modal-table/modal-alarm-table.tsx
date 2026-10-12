import { message } from "ant-design-vue";
import dayjs, { Dayjs } from "dayjs";
import { defineComponent, onMounted, reactive, ref, watch } from "vue";

import { UeClient } from "@ghcloud/cube-visual-sdk";

import Modal from "./modal";
import Alarm from "@/features/equipment/alarmdetails/equipmentMode";
import { withPopoverColumns } from "@/features/equipment/modal-table/render-popover-text";
import { alarmrecords, satalarmlevels } from "@/infrastructure/api/alarm";
import { cubeOuaaService } from "@/infrastructure/api/service";
import enumerateData from "@/infrastructure/utils/enumeratie";
import { setSpecialCamera } from "@/visualization-core/scene/scene-actions";
import { useStateStore } from "@/visualization-core/stores/use-state-store";

import "./modal-alarm-table.module.less";

const DROPDOWN_CLASS = "visual-data-modal-dropdown";
const getPopupContainer = (): HTMLElement => document.body;

export const ModalAlarmTable = defineComponent({
  name: "ModalAlarmTable",
  props: {
    parameter: { type: Object, required: true },
    showModal: { type: Boolean, required: true, default: false },
  },
  emits: ["close"],
  setup(props, { emit }) {
    const ueClient = UeClient.getInstance();
    const { globalState } = useStateStore();
    const { alarmLeaveOptions } = enumerateData();
    const entry = ref(window.config.entry);

    const getLevelColor = (name: string): string => {
      return alarmLeaveOptions.value.find((res) => res.label == `${name}报警`)?.color || "";
    };

    const time = ref<Dayjs[]>(
      props.parameter.dateRange?.length > 1 ? [dayjs(props.parameter.dateRange[0]), dayjs(props.parameter.dateRange[1])] : [],
    );
    const keyword = ref("");
    const datainfo = reactive<Record<string, any>>({
      period: "",
      alarmLevelId: "",
      alarmLevelCode: "",
      alarmStatus: "",
      pageSize: 10,
      pageNumber: 1,
      sceneType: globalState.business.currentMenu,
      areaId: globalState.business.currentAreaId,
      total: 0,
      applicationCode: "",
    });

    const dataSource = ref<any[]>([]);
    const loadingDataSource = ref(false);
    const alarmDetailData = ref({});
    const show = ref(false);
    const level = ref<any[]>([]);
    const appOptions = ref<any[]>([]);

    const detiles = (item: any): void => {
      alarmDetailData.value = item;
      show.value = true;
    };

    const closeDevicePanel = (): void => {
      emit("close");
      show.value = false;
    };

    const position = async (item: any): Promise<void> => {
      ueClient.send("getActorById", { id: item.alarmTargetCode }, function (res) {
        if (res.id) {
          closeModal();
          setSpecialCamera(item.alarmTargetTypeName, item.alarmTargetCode);
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

    const columns = withPopoverColumns([
      {
        title: "报警时间",
        dataIndex: "alarmTime",
        key: "alarmTime",
        width: 140,
        align: "center" as const,
        customRender: ({ text }: { text: string }) => (text ? dayjs(text).format("YYYY-MM-DD HH:mm:ss") : "--"),
      },
      {
        title: "报警设备",
        dataIndex: "alarmTargetName",
        key: "alarmTargetName",
        ellipsis: true,
        width: 120,
        align: "center" as const,
      },
      {
        title: "报警级别",
        dataIndex: "alarmLevelName",
        key: "alarmLevelName",
        width: 72,
        align: "center" as const,
        customRender: ({ text }: { text: string }) => <span style={{ color: getLevelColor(text) }}>{text || "--"}</span>,
      },
      {
        title: "报警区域",
        dataIndex: "areaName",
        key: "areaName",
        ellipsis: true,
        width: 100,
        align: "center" as const,
      },
      {
        title: "报警事件",
        dataIndex: "alarmEventName",
        key: "alarmEventName",
        ellipsis: true,
        width: 120,
        align: "center" as const,
      },
      {
        title: "处理状态",
        dataIndex: "alarmStatusName",
        key: "alarmStatusName",
        width: 80,
        align: "center" as const,
      },
      {
        title: "应用名称",
        dataIndex: "applicationName",
        key: "applicationName",
        ellipsis: true,
        width: 100,
        align: "center" as const,
      },
      {
        title: "操作",
        key: "action",
        width: 100,
        align: "center" as const,
        customRender: ({ record }: { record: any }) => (
          <span class="row-actions">
            <a onClick={() => detiles(record)}>详情</a>
            {entry.value == "views" && <a onClick={() => position(record)}>定位</a>}
          </span>
        ),
      },
    ]);

    const onShowSizeChange = (current: number, size: number): void => {
      datainfo.pageNumber = current;
      datainfo.pageSize = size;
      void getData();
    };

    const getTableData = async (): Promise<void> => {
      const leveldata = await satalarmlevels();
      level.value = leveldata;
      level.value.unshift({ name: "所有", id: "", code: "" });
    };

    const getData = async (): Promise<void> => {
      loadingDataSource.value = true;
      try {
        if (time.value?.length) {
          datainfo.period = dayjs(time.value[0]).format("YYYY-MM-DD 00:00:00") + "," + dayjs(time.value[1]).format("YYYY-MM-DD 23:59:59");
        } else {
          datainfo.period = "";
        }
        datainfo.keyword = keyword.value;
        const data = await alarmrecords(datainfo);
        dataSource.value = Array.isArray(data?.records) ? data.records : [];
        datainfo.total = data?.total ?? 0;
      } finally {
        loadingDataSource.value = false;
      }
    };

    const query = (): void => {
      datainfo.pageNumber = 1;
      void getData();
    };

    const reset = (): void => {
      time.value = [];
      keyword.value = "";
      Object.assign(datainfo, {
        period: "",
        alarmLevelId: "",
        alarmLevelCode: "",
        alarmStatus: "",
        pageSize: 10,
        pageNumber: 1,
        total: 0,
        applicationCode: "",
      });
      datainfo.alarmLevelCode = props.parameter.alarmLevelCode ? props.parameter.alarmLevelCode : undefined;
      datainfo.alarmStatus = props.parameter.alarmStatus ? props.parameter.alarmStatus : undefined;
      datainfo.departmentId = props.parameter.departmentId ? props.parameter.departmentId : undefined;
      datainfo.alarmEvent = props.parameter.alarmEvent ? props.parameter.alarmEvent : undefined;
      datainfo.areaId = props.parameter.areaIds ? props.parameter.areaIds : datainfo.areaId;
      datainfo.userId = props.parameter.userId ? props.parameter.userId : undefined;
      datainfo.deviceTags = props.parameter.deviceTags ? props.parameter.deviceTags : undefined;
      datainfo.alarmHandlerResult = props.parameter.alarmHandlerResult ? props.parameter.alarmHandlerResult : undefined;
      datainfo.alarmEventTypeId = props.parameter.alarmEventTypeId ? props.parameter.alarmEventTypeId : undefined;
      datainfo.applicationCode = props.parameter.applicationCode ? props.parameter.applicationCode : undefined;
      datainfo.filterAreaIds = props.parameter.filterAreaIds ? props.parameter.filterAreaIds : undefined;
      updateTime();
      void getData();
    };

    const closeModal = (): void => {
      emit("close");
    };

    const getAppOptions = async (): Promise<void> => {
      cubeOuaaService.getTerminalApplications("bimops-manage-web").then((res) => {
        appOptions.value = res;
      });
    };

    function updateTime(): void {
      if (!props.parameter?.dateRange || props.parameter?.dateRange?.length < 2) {
        return;
      }
      time.value = [dayjs(props.parameter.dateRange[0]), dayjs(props.parameter.dateRange[1])];
    }

    watch(
      () => props.showModal,
      () => {
        if (props.showModal) {
          datainfo.pageNumber = 1;
          datainfo.alarmLevelCode = props.parameter.alarmLevelCode ? props.parameter.alarmLevelCode : undefined;
          datainfo.alarmStatus = props.parameter.alarmStatus ? props.parameter.alarmStatus : undefined;
          datainfo.departmentId = props.parameter.departmentId ? props.parameter.departmentId : undefined;
          datainfo.alarmEvent = props.parameter.alarmEvent ? props.parameter.alarmEvent : undefined;
          datainfo.areaId = props.parameter.areaIds ? props.parameter.areaIds : datainfo.areaId;
          datainfo.userId = props.parameter.userId ? props.parameter.userId : undefined;
          datainfo.deviceTags = props.parameter.deviceTags ? props.parameter.deviceTags : undefined;
          datainfo.alarmHandlerResult = props.parameter.alarmHandlerResult ? props.parameter.alarmHandlerResult : undefined;
          datainfo.alarmEventTypeId = props.parameter.alarmEventTypeId ? props.parameter.alarmEventTypeId : undefined;
          datainfo.applicationCode = props.parameter.applicationCode ? props.parameter.applicationCode : undefined;
          datainfo.filterAlarmStatus = props.parameter.filterAlarmStatus ? props.parameter.filterAlarmStatus : undefined;
          updateTime();
          void getTableData();
          void getData();
          void getAppOptions();
        }
      },
    );

    watch(
      () => props.parameter,
      () => {
        datainfo.applicationCode = props.parameter.applicationCode ? props.parameter.applicationCode : datainfo.applicationCode;
        datainfo.alarmStatus = props.parameter.alarmStatus ? props.parameter.alarmStatus : datainfo.alarmStatus;
      },
    );

    onMounted(() => {
      void getTableData();
      void getAppOptions();
    });

    return (): JSX.Element => (
      <div class="modal-alarm-table-root">
        <Modal title="报警记录" width="1250px" show={props.showModal} onClose={closeModal} wrapClassName="modal-table-alarm">
          <div class="alarm-records-content">
            <div class="filter-toolbar">
              <div class="filter-fields">
                <div class="filter-item">
                  <span class="filter-label">处理状态</span>
                  <a-select
                    value={datainfo.alarmStatus}
                    onUpdate:value={(v: string) => {
                      datainfo.alarmStatus = v;
                    }}
                    placeholder="请选择"
                    class="filter-control-select"
                    allowClear
                    getPopupContainer={getPopupContainer}
                    popupClassName={DROPDOWN_CLASS}
                    dropdownClassName={DROPDOWN_CLASS}
                  >
                    {alarmHandleEnumerate.map((item) => (
                      <a-select-option key={item.value || "all"} value={item.value}>
                        {item.label}
                      </a-select-option>
                    ))}
                  </a-select>
                </div>
                <div class="filter-item">
                  <span class="filter-label">报警级别</span>
                  <a-select
                    class="filter-control-select"
                    value={datainfo.alarmLevelCode}
                    onUpdate:value={(v: string) => {
                      datainfo.alarmLevelCode = v;
                    }}
                    placeholder="请选择"
                    allowClear
                    getPopupContainer={getPopupContainer}
                    popupClassName={DROPDOWN_CLASS}
                    dropdownClassName={DROPDOWN_CLASS}
                  >
                    {level.value.map((item) => (
                      <a-select-option key={item.code || item.id || "all"} value={item.code}>
                        {item.name}
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
                    }}
                    format="YYYY-MM-DD"
                    allowClear
                    getPopupContainer={getPopupContainer}
                    popupClassName={DROPDOWN_CLASS}
                    dropdownClassName={DROPDOWN_CLASS}
                  />
                </div>
                <div class="filter-item">
                  <span class="filter-label">应用名称</span>
                  <a-select
                    value={datainfo.applicationCode}
                    onUpdate:value={(v: string) => {
                      datainfo.applicationCode = v;
                    }}
                    placeholder="请选择"
                    class="filter-control-select"
                    allowClear
                    getPopupContainer={getPopupContainer}
                    popupClassName={DROPDOWN_CLASS}
                    dropdownClassName={DROPDOWN_CLASS}
                  >
                    {appOptions.value.map((item) => (
                      <a-select-option key={item.code} value={item.code}>
                        {item.name}
                      </a-select-option>
                    ))}
                  </a-select>
                </div>
                <div class="filter-item filter-item-keyword">
                  <span class="filter-label">关键字</span>
                  <a-input
                    value={keyword.value}
                    onUpdate:value={(v: string) => {
                      keyword.value = v;
                    }}
                    placeholder="请输入关键字"
                    allowClear
                    class="filter-keyword filter-control-input"
                  />
                  <div class="filter-actions">
                    <a-button type="primary" size="small" onClick={query} loading={loadingDataSource.value}>
                      查询
                    </a-button>
                    <a-button size="small" class="reset-btn" onClick={reset}>
                      重置
                    </a-button>
                  </div>
                </div>
              </div>
            </div>

            <div class="table-panel">
              <div class="table-wrapper">
                <a-table
                  class="alarm-records-table"
                  columns={columns}
                  dataSource={dataSource.value}
                  loading={loadingDataSource.value}
                  pagination={false}
                  rowKey={(record: any) => record.id || `${record.alarmTime}-${record.alarmTargetCode}`}
                  scroll={{ y: 420 }}
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
                  popupClassName: DROPDOWN_CLASS,
                  dropdownClassName: DROPDOWN_CLASS,
                }}
              />
            </div>
          </div>
          {show.value && (
            <Alarm
              onCloseDevicePanel={closeDevicePanel}
              alarmDetailData={alarmDetailData.value}
              onClose={() => {
                show.value = false;
              }}
              isalarm={true}
            />
          )}
        </Modal>
      </div>
    );
  },
});

export default ModalAlarmTable;
