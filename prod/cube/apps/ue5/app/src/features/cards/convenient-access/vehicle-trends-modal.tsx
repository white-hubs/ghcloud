import zhCN from "ant-design-vue/es/locale/zh_CN";
import moment from "moment";
import { defineComponent, onMounted, reactive, ref, watch } from "vue";

import Modal from "@/features/equipment/modal-table/modal-layout";
import { getPopupContainer, renderPopoverText } from "@/features/equipment/modal-table/render-popover-text";
import { parkingAccessRecords, parkingAccessTotal, parkingInfos } from "@/infrastructure/api/park-management";

import "./vehicle-trends-modal.module.less";

const DROPDOWN_CLASS = "visual-data-modal-dropdown";

export const VehicleTrendsModal = defineComponent({
  name: "VehicleTrendsModal",
  props: {
    showModal: { type: Boolean, required: true, default: false },
    params: { type: null, required: true, default: {} },
  },
  emits: ["close"],
  setup(props, { emit }) {
    const inOut = ref({
      inNum: 0,
      outNum: 0,
    });

    const columns = [
      {
        title: "时间",
        dataIndex: "accessTime",
        key: "accessTime",
        ellipsis: true,
        align: "center" as const,
        width: 180,
        customRender: ({ text }: { text?: string }) =>
          renderPopoverText(text ? moment(text).format("YYYY-MM-DD HH:mm:ss") : null, { className: "traffic-record-cell-text" }),
      },
      {
        title: "车牌号码",
        dataIndex: "vehicleNo",
        key: "vehicleNo",
        ellipsis: true,
        align: "center" as const,
        width: 160,
        customRender: ({ text }: { text?: string }) => renderPopoverText(text, { className: "traffic-record-cell-text" }),
      },
      {
        title: "出入场",
        dataIndex: "accessType",
        key: "accessType",
        ellipsis: true,
        align: "center" as const,
        width: 100,
        customRender: ({ text }: { text?: string }) =>
          renderPopoverText(text === "ACCESS_IN" ? "入场" : "出场", { className: "traffic-record-cell-text" }),
      },
      {
        title: "所属停车场",
        dataIndex: "parkingInfoName",
        key: "parkingInfoName",
        ellipsis: true,
        align: "center" as const,
        customRender: ({ text }: { text?: string }) => renderPopoverText(text, { className: "traffic-record-cell-text" }),
      },
      {
        title: "位置",
        dataIndex: "channelName",
        key: "channelName",
        ellipsis: true,
        align: "center" as const,
        customRender: ({ text }: { text?: string }) => renderPopoverText(text, { className: "traffic-record-cell-text" }),
      },
      {
        title: "图片",
        dataIndex: "imageUrl",
        key: "imageUrl",
        ellipsis: true,
        align: "center" as const,
        width: 90,
        customRender: ({ text }: { text?: string }) => <a-image width={34} height={34} class="traffic-record-image" src={text} />,
      },
    ];

    const statusOptions = ref<Array<{ value: string; label: string }>>([]);
    const current = ref(1);
    const total = ref(0);
    const dataSource = ref<any[]>([]);
    const loading = ref(false);

    const search = reactive<Record<string, any>>({
      date: [],
      parkingInfoCode: undefined,
      pageSize: 10,
      pageNumber: 1,
    });

    const toPickerDates = (period?: string[]): string[] => {
      if (!period?.length || !period[0] || !period[1]) return [];
      return [moment(period[0]).format("YYYY-MM-DD"), moment(period[1]).format("YYYY-MM-DD")];
    };

    const buildPeriod = (dates?: string[]): string => {
      if (!dates?.length || !dates[0] || !dates[1]) return "";
      const start = moment(dates[0]).format("YYYY-MM-DD 00:00:00");
      const end = moment(dates[1]).format("YYYY-MM-DD 23:59:59");
      return `${start},${end}`;
    };

    const getInitialSearch = () => {
      const fromParams = toPickerDates(props.params?.period);
      // 无传入时段时默认今年，避免首次打开日期为空且不查数
      const date = fromParams.length === 2 ? fromParams : [moment().startOf("year").format("YYYY-MM-DD"), moment().format("YYYY-MM-DD")];
      return {
        date,
        parkingInfoCode: undefined as string | undefined,
      };
    };

    const closeModal = (): void => {
      emit("close");
    };

    const query = async (): Promise<void> => {
      loading.value = true;
      try {
        const period = buildPeriod(search.date);
        const param: Record<string, any> = {
          period,
          pageNumber: current.value,
          pageSize: 10,
        };
        if (search.parkingInfoCode) {
          param.parkingInfoCode = search.parkingInfoCode;
        }
        const res = await parkingAccessRecords(param);
        total.value = Number(res?.total) || 0;
        dataSource.value = Array.isArray(res?.records) ? res.records : [];
        const totalParam: Record<string, any> = { period };
        if (search.parkingInfoCode) {
          totalParam.parkingInfoCode = search.parkingInfoCode;
        }
        const totalRes = await parkingAccessTotal(totalParam);
        inOut.value = {
          inNum: Number(totalRes?.inNum) || 0,
          outNum: Number(totalRes?.outNum) || 0,
        };
      } catch {
        total.value = 0;
        dataSource.value = [];
        inOut.value = { inNum: 0, outNum: 0 };
      } finally {
        loading.value = false;
      }
    };

    const handleQuery = (): void => {
      current.value = 1;
      void query();
    };

    const getParkingInfos = async (): Promise<void> => {
      try {
        const res = await parkingInfos();
        statusOptions.value = (Array.isArray(res) ? res : []).map((e: { code: string; name: string }) => ({
          value: e.code,
          label: e.name,
        }));
      } catch {
        statusOptions.value = [];
      }
    };

    const reset = (): void => {
      Object.assign(search, getInitialSearch());
      current.value = 1;
      void query();
    };

    const onPageChange = (page: number): void => {
      current.value = page;
      void query();
    };

    // 父级常用 v-if 挂载弹窗（首次即为 true），必须 immediate，否则不会拉数
    watch(
      () => props.showModal,
      (visible) => {
        if (!visible) return;
        Object.assign(search, getInitialSearch());
        current.value = 1;
        void query();
      },
      { immediate: true },
    );

    onMounted(() => {
      void getParkingInfos();
    });

    return () => (
      <Modal
        title="车流通行记录"
        width={1250}
        modelValue={props.showModal}
        onUpdate:modelValue={(v: boolean) => {
          if (!v) closeModal();
        }}
        onClose={closeModal}
        wrapClassName="vehicle-traffic-records-modal"
        footer={null}
      >
        <div class="vehicle-traffic-records-content">
          <div class="filter-toolbar">
            <div class="filter-fields">
              <div class="filter-item filter-item-time">
                <span class="filter-label">时间</span>
                <a-config-provider locale={zhCN}>
                  <a-range-picker
                    allowClear={false}
                    value={search.date}
                    onUpdate:value={(v: string[]) => {
                      search.date = v;
                    }}
                    value-format="YYYY-MM-DD"
                    class="filter-date-picker filter-control-picker"
                    getPopupContainer={getPopupContainer}
                    popupClassName={DROPDOWN_CLASS}
                    dropdownClassName={DROPDOWN_CLASS}
                  />
                </a-config-provider>
              </div>
              <div class="filter-item filter-item-location">
                <span class="filter-label">进出位置</span>
                <a-select
                  allowClear
                  class="filter-select filter-control-select"
                  value={search.parkingInfoCode}
                  onUpdate:value={(v: string | undefined) => {
                    search.parkingInfoCode = v;
                  }}
                  placeholder="请选择"
                  getPopupContainer={getPopupContainer}
                  popupClassName={DROPDOWN_CLASS}
                  dropdownClassName={DROPDOWN_CLASS}
                >
                  {statusOptions.value.map((item) => (
                    <a-select-option key={item.value} value={item.value}>
                      {item.label}
                    </a-select-option>
                  ))}
                </a-select>
              </div>
              <div class="filter-item filter-item-actions">
                <div class="filter-actions">
                  <a-button type="primary" size="small" onClick={handleQuery} loading={loading.value}>
                    查询
                  </a-button>
                  <a-button size="small" class="reset-btn" onClick={reset}>
                    重置
                  </a-button>
                </div>
              </div>
            </div>
          </div>

          <div class="summary-row">
            <div class="summary-item summary-in">
              <span class="summary-label">入场车辆</span>
              <span class="summary-value">{inOut.value.inNum}</span>
              <span class="summary-unit">辆</span>
            </div>
            <div class="summary-item summary-out">
              <span class="summary-label">出场车辆</span>
              <span class="summary-value">{inOut.value.outNum}</span>
              <span class="summary-unit">辆</span>
            </div>
          </div>

          <div class="table-panel">
            <div class="table-wrapper">
              <a-table
                class="traffic-records-table"
                scroll={{ y: 420 }}
                pagination={false}
                columns={columns}
                dataSource={dataSource.value}
                loading={loading.value}
                rowKey={(record: any) => record.id || `${record.accessTime}-${record.vehicleNo}-${record.channelName}`}
              />
            </div>
            <a-pagination
              class="table-pagination"
              current={current.value}
              onUpdate:current={(v: number) => {
                current.value = v;
              }}
              total={total.value}
              showSizeChanger={false}
              show-total={(count: number) => `共 ${count} 条数据`}
              onChange={onPageChange}
            />
          </div>
        </div>
      </Modal>
    );
  },
});

export default VehicleTrendsModal;
