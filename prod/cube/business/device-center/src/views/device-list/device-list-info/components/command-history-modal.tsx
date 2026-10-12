import dayjs from "dayjs";
import { defineComponent, reactive, ref } from "vue";

import { Button, DatePicker, Form, FormItem, Modal, Page, PopOver, Table } from "@ghcloud/cube-ui";

import { cubeDeviceCenterService } from "@/api/service";

interface CommandHistoryRecord {
  instanceId?: string;
  cmdSeq?: string;
  downCmd?: string;
  translatedCmdContent?: string;
  singleCmdStatus?: string;
  deviceId?: number;
  startTime?: string;
  endTime?: string;
}

interface CommandHistoryLogRecord {
  createTime?: string;
  logContent?: string;
}

interface OpenModalOptions {
  targetIdentifier?: string;
}

export const CommandHistoryModal = defineComponent({
  props: {
    title: {
      type: String,
      default: "历史数据",
    },
    downCmd: {
      type: String,
      default: "METHOD_INVOKE",
    },
  },
  setup(props, { expose }) {
    const modalVisible = ref(false);
    const loading = ref(false);
    const detailVisible = ref(false);
    const detailLoading = ref(false);
    const dataSource = ref<CommandHistoryRecord[]>([]);
    const detailDataSource = ref<CommandHistoryLogRecord[]>([]);
    const currentTargetIdentifier = ref<string | undefined>(undefined);
    const pagination = ref({
      pageSize: 10,
      pageNumber: 1,
      total: 0,
    });
    const formState = reactive<{
      startTime: string | undefined;
      endTime: string | undefined;
    }>({
      startTime: dayjs().startOf("month").format("YYYY-MM-DD 00:00:00"),
      endTime: dayjs().endOf("month").format("YYYY-MM-DD 23:59:59"),
    });

    const deviceCenterCommandService = cubeDeviceCenterService as typeof cubeDeviceCenterService & {
      getDeviceCommandHistoryPage: (payload: {
        pageNumber: number;
        pageSize: number;
        deviceId?: number;
        targetIdentifier?: string;
        startTime?: string;
        endTime?: string;
      }) => Promise<{ records: CommandHistoryRecord[]; total: number }>;
      getDeviceCommandHistoryLogs: (payload: { instanceId: string }) => Promise<CommandHistoryLogRecord[]>;
    };

    const renderTextCell = (value?: string | number): JSX.Element => {
      const text = value === 0 ? "0" : value ? String(value) : "--";
      return <PopOver content={text}>{text}</PopOver>;
    };

    const openDetailModal = async (instanceId: string): Promise<void> => {
      try {
        detailVisible.value = true;
        detailLoading.value = true;
        detailDataSource.value = [];
        const res = await deviceCenterCommandService.getDeviceCommandHistoryLogs({ instanceId });
        detailDataSource.value = res ?? [];
      } catch (_ignore) {
      } finally {
        detailLoading.value = false;
      }
    };

    const closeDetailModal = (): void => {
      detailVisible.value = false;
      detailDataSource.value = [];
    };

    const getTableData = async (targetIdentifier?: string): Promise<void> => {
      try {
        loading.value = true;
        const activeTargetIdentifier = targetIdentifier ?? currentTargetIdentifier.value;
        /** 操作记录查询不按设备过滤，不传 deviceId（仅 downCmd、时间、targetIdentifier 等） */
        const params = {
          pageNumber: pagination.value.pageNumber,
          pageSize: pagination.value.pageSize,
          downCmd: props.downCmd,
          ...(activeTargetIdentifier ? { targetIdentifier: activeTargetIdentifier } : {}),
          ...(formState.startTime ? { startTime: formState.startTime } : {}),
          ...(formState.endTime ? { endTime: formState.endTime } : {}),
        };
        const res = await deviceCenterCommandService.getDeviceCommandHistoryPage(params);
        if (res) {
          const { records, total } = res;
          dataSource.value = records ?? [];
          pagination.value.total = total;
        }
      } catch (_ignore) {
      } finally {
        loading.value = false;
      }
    };

    const pageChange = (pageNumber: number, pageSize: number): void => {
      pagination.value.pageNumber = pageNumber || 1;
      pagination.value.pageSize = pageSize;
      getTableData();
    };

    const queryForm = (): void => {
      pagination.value.pageNumber = 1;
      getTableData();
    };

    const reset = (): void => {
      formState.startTime = dayjs().startOf("month").format("YYYY-MM-DD 00:00:00");
      formState.endTime = dayjs().endOf("month").format("YYYY-MM-DD 23:59:59");
      queryForm();
    };

    const closeModal = (): void => {
      modalVisible.value = false;
    };

    const openModal = (options?: OpenModalOptions): void => {
      modalVisible.value = true;
      pagination.value.pageNumber = 1;
      currentTargetIdentifier.value = options?.targetIdentifier;
      formState.startTime = dayjs().startOf("month").format("YYYY-MM-DD 00:00:00");
      formState.endTime = dayjs().endOf("month").format("YYYY-MM-DD 23:59:59");
      getTableData(options?.targetIdentifier);
    };

    expose({
      openModal,
    });

    const columns = [
      {
        title: "实例ID",
        dataIndex: "instanceId",
        ellipsis: true,
        width: 220,
        customRender: ({ text }: { text: string }): JSX.Element => renderTextCell(text),
      },
      {
        title: "命令类型",
        dataIndex: "downCmd",
        ellipsis: true,
        width: 180,
        customRender: ({ text }: { text: string }): JSX.Element => {
          const displayText = text === "METHOD_INVOKE" ? "方法调用" : text === "DEV_PROP_SET" ? "属性设值" : text;
          return renderTextCell(displayText);
        },
      },
      {
        title: "命令内容",
        dataIndex: "translatedCmdContent",
        ellipsis: true,
        width: 280,
        customRender: ({ text }: { text: string }): JSX.Element => renderTextCell(text),
      },
      {
        title: "执行状态",
        dataIndex: "singleCmdStatus",
        ellipsis: true,
        width: 160,
        customRender: ({ text }: { text: string }): JSX.Element => renderTextCell(text),
      },
      {
        title: "开始时间",
        dataIndex: "startTime",
        ellipsis: true,
        width: 180,
        customRender: ({ text }: { text: string }): JSX.Element => renderTextCell(text),
      },
      {
        title: "结束时间",
        dataIndex: "endTime",
        ellipsis: true,
        width: 180,
        customRender: ({ text }: { text: string }): JSX.Element => renderTextCell(text),
      },
      {
        title: "操作",
        dataIndex: "actions",
        width: 100,
        fixed: "right",
        customRender: ({ record }: { record: CommandHistoryRecord }): JSX.Element => {
          return (
            <Button
              type="link"
              size="small"
              disabled={!record.instanceId}
              onClick={() => {
                if (record.instanceId) {
                  openDetailModal(record.instanceId);
                }
              }}
            >
              详情
            </Button>
          );
        },
      },
    ];

    const detailColumns = [
      {
        title: "时间",
        dataIndex: "createTime",
        ellipsis: true,
        width: 180,
        customRender: ({ text }: { text: string }): JSX.Element => renderTextCell(text),
      },
      {
        title: "日志内容",
        dataIndex: "logContent",
        ellipsis: true,
        customRender: ({ text }: { text: string }): JSX.Element => renderTextCell(text),
      },
    ];

    return (): JSX.Element => (
      <>
        <Modal visible={modalVisible.value} title={props.title} width={1000} footer={null} onCancel={closeModal}>
          <Form layout="inline" style={{ margin: "0 0 10px 0" }}>
            <FormItem style={{ paddingRight: 0, marginRight: "10px", marginBottom: "10px" }} label="开始时间">
              <DatePicker
                show-time
                valueFormat="YYYY-MM-DD HH:mm:ss"
                v-model:value={formState.startTime}
                placeholder="请选择开始时间"
                allowClear
              />
            </FormItem>
            <FormItem style={{ paddingRight: 0, marginRight: "10px", marginBottom: "10px" }} label="结束时间">
              <DatePicker
                show-time
                valueFormat="YYYY-MM-DD HH:mm:ss"
                v-model:value={formState.endTime}
                placeholder="请选择结束时间"
                allowClear
              />
            </FormItem>
            <FormItem style={{ paddingRight: 0, marginRight: "10px", marginBottom: "10px" }}>
              <Button type="primary" onClick={queryForm}>
                查询
              </Button>
              <Button style={{ marginLeft: "10px" }} onClick={reset}>
                重置
              </Button>
            </FormItem>
          </Form>
          <Table
            rowKey={(record: CommandHistoryRecord): string => record.instanceId || `${record.cmdSeq || ""}-${record.startTime || ""}`}
            columns={columns}
            loading={loading.value}
            dataSource={dataSource.value}
            pagination={false}
            scrollY={420}
          />
          <Page
            class="mt-20px"
            style={{ marginTop: "20px", display: "flex", justifyContent: "right" }}
            syncToUrl={false}
            v-model:current={pagination.value.pageNumber}
            v-model:pageSize={pagination.value.pageSize}
            v-model:total={pagination.value.total}
            onPageChange={pageChange}
          />
        </Modal>
        <Modal visible={detailVisible.value} title="历史记录详情" width={900} footer={null} onCancel={closeDetailModal}>
          <Table
            rowKey={(record: CommandHistoryLogRecord, index?: number): string => `${record.createTime || ""}-${index || 0}`}
            columns={detailColumns}
            loading={detailLoading.value}
            dataSource={detailDataSource.value}
            pagination={false}
            size="small"
            scrollY={400}
          />
        </Modal>
      </>
    );
  },
});
