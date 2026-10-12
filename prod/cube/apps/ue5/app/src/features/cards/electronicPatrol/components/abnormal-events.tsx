import { defineComponent, onMounted, reactive, ref } from "vue";

import { renderPopoverText } from "@/features/equipment/modal-table/render-popover-text";
import { alarmPage } from "@/infrastructure/api/maintain";
import NoData from "@/shared-ui/panel/noData";

import "@/features/equipment/modal-table/modal-equipmentAll-table.module.less";

import styles from "./abnormal-events.module.less";

type AlarmEventRow = {
  alarmContent?: string;
  alarmTime?: string;
  alarmPoint?: string;
  patrolRecordId?: string;
  alarmResult?: string;
};

const DROPDOWN_CLASS = "visual-data-modal-dropdown";
const getPopupContainer = (): HTMLElement => document.body;

const TABLE_HEADERS = ["报警内容", "报警时间", "报警地点", "巡检记录ID", "处理结果"];

export const AbnormalEvents = defineComponent({
  name: "AbnormalEvents",
  setup() {
    const dataInfo = reactive({
      pageSize: 10,
      pageNumber: 1,
      keyword: "",
      total: 0,
    });
    const dataSource = ref<AlarmEventRow[]>([]);
    const loadingDataSource = ref(false);

    const loadList = async (): Promise<void> => {
      loadingDataSource.value = true;
      try {
        const data = await alarmPage({
          pageSize: dataInfo.pageSize,
          pageNumber: dataInfo.pageNumber,
          keyword: dataInfo.keyword,
        });
        dataSource.value = Array.isArray(data?.records) ? data.records : [];
        dataInfo.total = Number(data?.total) || 0;
      } catch {
        dataSource.value = [];
        dataInfo.total = 0;
      } finally {
        loadingDataSource.value = false;
      }
    };

    const onShowSizeChange = (current: number, size: number): void => {
      dataInfo.pageNumber = current;
      dataInfo.pageSize = size;
      void loadList();
    };

    const query = (event?: Event): void => {
      event?.preventDefault();
      dataInfo.pageNumber = 1;
      void loadList();
    };

    const reset = (): void => {
      dataInfo.keyword = "";
      dataInfo.pageSize = 10;
      dataInfo.pageNumber = 1;
      void loadList();
    };

    onMounted(() => {
      void loadList();
    });

    return (): JSX.Element => (
      <div class={["device-records-content", styles.modalLayout]}>
        <form class="filter-toolbar filter-form" onSubmit={query}>
          <div class="filter-fields">
            <div class="filter-item filter-item-keyword">
              <span class="filter-label">报警内容</span>
              <a-input
                value={dataInfo.keyword}
                onUpdate:value={(v: string) => {
                  dataInfo.keyword = v;
                }}
                allowClear
                class="filter-keyword filter-control-input"
                placeholder="请输入报警内容"
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
          <div class={["table-wrapper", styles.tableWrapper]}>
            <div class={["table_header", styles.tableHeader]}>
              {TABLE_HEADERS.map((item) => (
                <div key={item}>{item}</div>
              ))}
            </div>
            <a-spin spinning={loadingDataSource.value}>
              <div class={["table_content", styles.tableContent]}>
                {dataSource.value.length === 0 ? (
                  <div class={styles.noContent}>
                    <NoData />
                  </div>
                ) : (
                  dataSource.value.map((item, index) => (
                    <div class="content" key={`${item.patrolRecordId ?? "row"}-${index}`}>
                      <div>{renderPopoverText(item.alarmContent || "--")}</div>
                      <div>{renderPopoverText(item.alarmTime || "--")}</div>
                      <div>{renderPopoverText(item.alarmPoint || "--")}</div>
                      <div>{renderPopoverText(item.patrolRecordId || "--")}</div>
                      <div>{renderPopoverText(item.alarmResult || "--")}</div>
                    </div>
                  ))
                )}
              </div>
            </a-spin>
          </div>

          <a-pagination
            class="table-pagination"
            current={dataInfo.pageNumber}
            onUpdate:current={(v: number) => {
              dataInfo.pageNumber = v;
            }}
            pageSize={dataInfo.pageSize}
            onUpdate:pageSize={(v: number) => {
              dataInfo.pageSize = v;
            }}
            showSizeChanger
            show-total={(total: number) => `总数 ${total}`}
            onChange={onShowSizeChange}
            total={dataInfo.total}
            selectProps={{
              getPopupContainer,
              popupClassName: DROPDOWN_CLASS,
              dropdownClassName: DROPDOWN_CLASS,
            }}
          />
        </div>
      </div>
    );
  },
});

export default AbnormalEvents;
