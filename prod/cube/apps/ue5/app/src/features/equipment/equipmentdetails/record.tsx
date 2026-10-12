import { AlertOutlined, WarningOutlined } from "@ant-design/icons-vue";
import dayjs from "dayjs";
import { defineComponent, onMounted, ref } from "vue";

import { alarmStatisticsList, getstatus } from "@/infrastructure/api/alarm";
import type { AlarmTakeNotesList } from "@/infrastructure/api/models/alarm";
import NoData from "@/shared-ui/panel/noData";

import "./record.module.less";

export const Record = defineComponent({
  name: "Record",
  props: {
    code: { type: String, required: true },
    id: { type: String, required: true },
  },
  setup(props) {
    const pagination = ref({
      pageSize: 5,
      pageNumber: 1,
      total: 0,
    });
    const total = ref(0);
    const dataSource = ref<AlarmTakeNotesList[]>([]);
    const handlingNum = ref(0);

    const columns = ref([
      {
        title: "序号",
        width: 64,
        align: "center" as const,
        customRender: ({ index }: { index: number }) => `${index + 1}`,
      },
      {
        title: "异常类型",
        align: "center" as const,
        dataIndex: "alarmTypeName",
        ellipsis: true,
      },
      {
        title: "上报时间",
        align: "center" as const,
        dataIndex: "alarmTime",
        width: 168,
        customRender: ({ text }: { text: string }) => (text ? dayjs(text).format("YYYY-MM-DD HH:mm:ss") : "--"),
      },
      {
        title: "异常详情",
        align: "center" as const,
        dataIndex: "alarmEventName",
        ellipsis: true,
      },
      {
        title: "当前状态",
        align: "center" as const,
        dataIndex: "alarmStatusName",
        width: 100,
      },
    ]);

    const getTableData = (): void => {
      void alarmStatisticsList({
        alarmTargetCode: props.id,
        pageSize: pagination.value.pageSize,
        pageNumber: pagination.value.pageNumber,
      }).then((res) => {
        dataSource.value = res.records;
        total.value = res.total;
        pagination.value.total = res.total;
      });
      void getstatus({ alarmTargetCode: props.code }).then((res) => {
        handlingNum.value = res.alarmStatusStatistics[1].alarmNum;
      });
    };

    const pageChange = (pageNumber: number, pageSize: number): void => {
      pagination.value.pageNumber = pageNumber || 1;
      pagination.value.pageSize = pageSize;
      getTableData();
    };

    onMounted(() => {
      getTableData();
    });

    return (): JSX.Element => (
      <div class="device-error-record">
        <div class="status-bar">
          <div class="status-bar-item is-alarm">
            <span class="status-bar-label">
              <AlertOutlined class="status-icon is-alarm-icon" />
              告警总次数:
            </span>
            <div class="status-bar-value">{total.value}</div>
          </div>
          <div class="status-bar-item is-handling">
            <span class="status-bar-label">
              <WarningOutlined class="status-icon is-handling-icon" />
              处理中:
            </span>
            <div class="status-bar-value">{handlingNum.value}</div>
          </div>
        </div>
        <div class="section-title">近期异常情况概览:</div>
        <div class="table-wrapper">
          <a-table
            class="device-error-record-table"
            size="small"
            scroll={dataSource.value.length ? { y: 180 } : undefined}
            dataSource={dataSource.value}
            columns={columns.value}
            pagination={false}
            locale={{ emptyText: <NoData /> }}
            rowKey={(record: AlarmTakeNotesList) => record.id || `${record.alarmTime}-${record.alarmEventName}`}
          />
        </div>
        <div class="page">
          <a-pagination
            current={pagination.value.pageNumber}
            onUpdate:current={(v: number) => {
              pagination.value.pageNumber = v;
            }}
            pageSize={pagination.value.pageSize}
            onUpdate:pageSize={(v: number) => {
              pagination.value.pageSize = v;
            }}
            total={pagination.value.total}
            default-current={1}
            show-total={(count: number) => `共 ${count} 条数据`}
            onChange={pageChange}
            show-size-changer={false}
          />
        </div>
      </div>
    );
  },
});

export default Record;
