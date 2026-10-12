import zhCN from "ant-design-vue/es/locale/zh_CN";
import dayjs from "dayjs";
import moment from "moment";
import { computed, defineComponent, onMounted, reactive, ref, watch } from "vue";

import Modal from "@/features/equipment/modal-table/modal-layout";
import { withPopoverColumns } from "@/features/equipment/modal-table/render-popover-text";
import { liftFiveCallLogPage } from "@/infrastructure/api/securitymanagement";
import NoData from "@/shared-ui/panel/noData";
import { useVisualTheme } from "@/visualization-core/hooks/use-visual-theme";

import "@/features/equipment/modal-table/modal-equipmentAll-table.module.less";
import "./lift-modal.module.less";

export const LiftModal = defineComponent({
  name: "LiftModal",
  props: {
    showModal: { type: Boolean, required: true, default: false },
    params: { type: null, required: false, default: undefined },
  },
  emits: ["close"],
  setup(props, { emit }) {
    const { currentTheme } = useVisualTheme();
    const modalWrapClassName = computed(
      () => `modal-table-device equipment-data-list-modal traffic-records-modal device-records-theme-${currentTheme.value}`,
    );
    const columns = withPopoverColumns([
      {
        title: "来电人信息",
        dataIndex: "caller",
        key: "caller",
        align: "center",
      },
      {
        title: "日期",
        dataIndex: "callTime",
        key: "callTime",
        align: "center",
        customRender: ({ text }: { text: number }) => {
          return text ? dayjs(text).format("YYYY-MM-DD HH:mm:ss") : "";
        },
      },
      {
        title: "电梯编号",
        dataIndex: "liftNumber",
        key: "liftNumber",
        align: "center",
      },
      {
        title: "所在区域",
        dataIndex: "areaName",
        key: "areaName",
        align: "center",
      },
      {
        title: "通话内容",
        dataIndex: "callContent",
        key: "callContent",
        align: "center",
      },
      {
        title: "处理情况",
        dataIndex: "handlingSituation",
        key: "handlingSituation",
        align: "center",
      },
    ]);
    const current = ref(1);
    const total = ref(0);
    const loading = ref(false);
    const dataSource = ref<any[]>([]);
    const search = reactive<Record<string, any>>({
      date: [],
      eventResult: "",
      keyword: "",
      typeName: "",
      pageSize: 10,
      pageNumber: 1,
    });

    const closeModal = () => {
      emit("close");
    };
    const query = async (pageNumber?: number) => {
      if (pageNumber) {
        current.value = pageNumber;
      }
      let time = search.date ? search.date : [];
      let arr = time.map((item, index) => {
        if (index === 0) {
          item = moment(item).format("YYYY-MM-DD 00:00:00");
        } else {
          item = moment(item).format("YYYY-MM-DD 23:59:59");
        }
        return item;
      });
      let param = {
        period: arr ? arr.join(",") : "",
        pageNumber: current.value,
        pageSize: search.pageSize,
      };
      loading.value = true;
      try {
        const res = await liftFiveCallLogPage(param);
        total.value = Number(res?.total) || 0;
        dataSource.value = Array.isArray(res?.records) ? res.records : [];
      } finally {
        loading.value = false;
      }
    };
    const reset = () => {
      search.keyword = "";
      search.eventResult = "";
      search.date = [];
      search.pageSize = 10;
      search.pageNumber = 1;
      void query(1);
    };
    onMounted(() => {
      if (props.showModal) void query(1);
    });

    watch(
      () => props.showModal,
      (visible) => {
        if (visible) void query(1);
      },
    );

    return (): JSX.Element => (
      <>
        <Modal
          title="五方通话记录"
          width={1200}
          modelValue={props.showModal}
          onUpdate:modelValue={(v) => {
            props.showModal = v;
          }}
          onClose={closeModal}
          wrapClassName={modalWrapClassName.value}
        >
          <div class="device-records-content">
            <form
              class="filter-toolbar filter-form"
              onSubmit={(event: Event) => {
                event.preventDefault();
                void query(1);
              }}
            >
              <div class="filter-fields">
                <div class="filter-item">
                  <span class="filter-label">时间</span>
                  <a-config-provider locale={zhCN}>
                    <a-range-picker
                      value={search.date}
                      onUpdate:value={(v: string[]) => {
                        search.date = v || [];
                      }}
                      value-format="YYYY-MM-DD"
                      class="filter-control-input"
                      getPopupContainer={() => document.body}
                      popupClassName={`visual-data-modal-dropdown device-records-theme-${currentTheme.value}`}
                    />
                  </a-config-provider>
                </div>
                <div class="filter-item filter-item-actions">
                  <div class="filter-actions">
                    <a-button type="primary" size="small" html-type="submit" loading={loading.value}>
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
                  loading={loading.value}
                  pagination={false}
                  rowKey={(record: any) =>
                    String(
                      record.id ??
                        [record.liftNumber, record.callTime, record.caller, record.callContent].map((value) => value ?? "").join("-"),
                    )
                  }
                  scroll={{ y: 380 }}
                  locale={{ emptyText: <NoData /> }}
                />
              </div>
              <a-pagination
                class="table-pagination"
                current={current.value}
                pageSize={search.pageSize}
                total={total.value}
                showSizeChanger
                show-total={(value: number) => `总数 ${value}`}
                onChange={(page: number, pageSize: number) => {
                  search.pageSize = pageSize;
                  void query(page);
                }}
                onUpdate:current={(v: number) => {
                  current.value = v;
                }}
                onUpdate:pageSize={(v: number) => {
                  search.pageSize = v;
                }}
              />
            </div>
          </div>
        </Modal>
      </>
    );
  },
});

export default LiftModal;
