import { computed, defineComponent, reactive, ref, watch } from "vue";

import Modal from "@/features/equipment/modal-table/modal-layout";
import { withPopoverColumns } from "@/features/equipment/modal-table/render-popover-text";
import { companiesPage } from "@/infrastructure/api/merchant";
import NoData from "@/shared-ui/panel/noData";
import { useVisualTheme } from "@/visualization-core/hooks/use-visual-theme";

import "@/features/equipment/modal-table/modal-equipmentAll-table.module.less";
import "./merchant-list-modal.module.less";

/** 表体行高 42px × 10 条，保证默认一页不出现纵向滚动条 */
const TABLE_BODY_SCROLL_Y = 420;

interface MerchantRow {
  id?: string | number;
  name?: string;
  companyName?: string;
  spaces?: unknown[];
  spaceCount?: number;
  [key: string]: unknown;
}

export const MerchantListModal = defineComponent({
  name: "MerchantListModal",
  props: {
    showModal: { type: Boolean, required: true, default: false },
    keyword: { type: String, required: false, default: "" },
  },
  emits: ["close"],
  setup(props, { emit }) {
    const { currentTheme } = useVisualTheme();
    const modalWrapClassName = computed(
      () =>
        `modal-table-device equipment-data-list-modal traffic-records-modal merchant-list-data-modal device-records-theme-${currentTheme.value}`,
    );

    const current = ref(1);
    const total = ref(0);
    const loading = ref(false);
    const dataSource = ref<MerchantRow[]>([]);
    const search = reactive({
      keyword: "",
      pageSize: 10,
    });

    const closeModal = (): void => {
      emit("close");
    };

    const query = async (pageNumber?: number): Promise<void> => {
      if (pageNumber) current.value = pageNumber;
      loading.value = true;
      try {
        const res = await companiesPage({
          pageSize: search.pageSize,
          pageNum: current.value,
          sort: "sendTime,desc",
          orderby: "sendTime,desc",
          search: search.keyword,
        });
        total.value = Number(res?.total) || 0;
        const rows = Array.isArray(res?.records) ? res.records : [];
        dataSource.value = rows.map((item: MerchantRow) => {
          const spaces = Array.isArray(item?.spaces) ? item.spaces : [];
          return {
            ...item,
            spaceCount: spaces.length,
          };
        });
      } catch {
        total.value = 0;
        dataSource.value = [];
      } finally {
        loading.value = false;
      }
    };

    const reset = (): void => {
      search.keyword = "";
      search.pageSize = 10;
      void query(1);
    };

    const columns = withPopoverColumns([
      {
        title: "商户名称",
        dataIndex: "name",
        key: "name",
        align: "left" as const,
        ellipsis: true,
        customRender: ({ record }: { record: MerchantRow }) => record.name || record.companyName || "--",
      },
      {
        title: "档位数",
        dataIndex: "spaceCount",
        key: "spaceCount",
        align: "center" as const,
        width: 160,
        customRender: ({ text }: { text: number }) => `${Number(text) || 0}个`,
      },
    ]);

    watch(
      () => props.showModal,
      (visible) => {
        if (!visible) return;
        search.keyword = props.keyword || "";
        void query(1);
      },
    );

    return (): JSX.Element => (
      <Modal
        title="商户清单"
        width={980}
        modelValue={props.showModal}
        onUpdate:modelValue={(v: boolean) => {
          if (!v) closeModal();
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
                <span class="filter-label">商户名称</span>
                <a-input
                  value={search.keyword}
                  onUpdate:value={(v: string) => {
                    search.keyword = v || "";
                  }}
                  allowClear
                  placeholder="请输入商户名称"
                  class="filter-control-input"
                />
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
                rowKey={(record: MerchantRow) => String(record.id ?? record.name ?? record.companyName ?? "")}
                scroll={{ y: TABLE_BODY_SCROLL_Y }}
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
    );
  },
});

export default MerchantListModal;
