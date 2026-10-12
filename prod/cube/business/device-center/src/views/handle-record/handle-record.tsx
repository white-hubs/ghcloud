import dayjs from "dayjs";
import { defineComponent, onMounted, reactive, ref } from "vue";
import { useRoute } from "vue-router";

import { useCubeQueryState } from "@ghcloud/cube-app-design";
import { Button, DatePicker, Form, FormItem, Modal, Page, PopOver, Select, Table } from "@ghcloud/cube-ui";
import { AliasTable } from "@ghcloud/generic-component";

import { cubeDeviceCenterService } from "@/api/service";
import { Layout } from "@/components/layout/layout";
import { useTableScroll } from "@/hook/use-table-scroll";

import "@/styles/common.less";

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

interface HandleRecordQuery {
  id?: string;
  deviceId?: string;
  subDeviceId?: string;
}

interface HandleRecordQueryState {
  startTime: string | undefined;
  endTime: string | undefined;
  downCmd: string | undefined;
  pageNumber: number;
  pageSize: number;
  total: number;
}

export const HandleRecord = defineComponent({
  setup: () => {
    const route = useRoute();
    const tableCode = route.path.replaceAll("/", "");

    const queryState = useCubeQueryState<HandleRecordQueryState>({
      initialState: {
        startTime: dayjs().startOf("month").format("YYYY-MM-DD 00:00:00"),
        endTime: dayjs().endOf("month").format("YYYY-MM-DD 23:59:59"),
        downCmd: undefined,
        pageNumber: 1,
        pageSize: 10,
        total: 0,
      },
      storage: "url",
      cacheFields: ["downCmd", "startTime", "endTime", "pageNumber", "pageSize"],
      resolveValue: (field, raw) => {
        if (field === "pageNumber" || field === "pageSize") return Number(raw);
        return raw;
      },
    });

    // 页面既可能从设备详情进入，也可能通过带 query 的独立路由进入，这里统一兜底取设备 ID。
    const getCurrentDeviceId = (): number | undefined => {
      const query = route.query as HandleRecordQuery;
      const rawDeviceId = query.deviceId || query.id || query.subDeviceId;
      if (!rawDeviceId) {
        return undefined;
      }
      const parsedDeviceId = Number(rawDeviceId);
      return Number.isNaN(parsedDeviceId) ? undefined : parsedDeviceId;
    };

    const commandTypeOptions = [
      { value: "DEV_PROP_SET", label: "属性设值" },
      { value: "METHOD_INVOKE", label: "方法调用" },
    ];

    const renderTextCell = (value?: string | number): JSX.Element => {
      const text = value === 0 ? "0" : value ? String(value) : "--";
      return <PopOver content={text}>{text}</PopOver>;
    };

    const deviceCenterCommandService = cubeDeviceCenterService as typeof cubeDeviceCenterService & {
      getDeviceCommandHistoryPage: (payload: {
        pageNumber: number;
        pageSize: number;
        deviceId?: number;
        downCmd?: string;
        startTime?: string;
        endTime?: string;
      }) => Promise<{ records: CommandHistoryRecord[]; total: number }>;
      getDeviceCommandHistoryLogs: (payload: { instanceId: string }) => Promise<CommandHistoryLogRecord[]>;
    };

    const columns = [
      {
        title: "实例ID",
        dataIndex: "instanceId",
        ellipsis: true,
        width: 220,
        customRender: ({ text }: { text: string }): JSX.Element => {
          return renderTextCell(text);
        },
      },
      {
        title: "命令类型",
        dataIndex: "downCmd",
        ellipsis: true,
        width: 180,
        customRender: ({ text }: { text: string }): JSX.Element => {
          const currentOption = commandTypeOptions.find((item) => item.value === text);
          return renderTextCell(currentOption?.label || text);
        },
      },
      {
        title: "命令内容",
        dataIndex: "translatedCmdContent",
        ellipsis: true,
        width: 280,
        customRender: ({ text }: { text: string }): JSX.Element => {
          return renderTextCell(text);
        },
      },
      {
        title: "执行状态",
        dataIndex: "singleCmdStatus",
        ellipsis: true,
        width: 160,
        customRender: ({ text }: { text: string }): JSX.Element => {
          return renderTextCell(text);
        },
      },
      {
        title: "开始时间",
        dataIndex: "startTime",
        ellipsis: true,
        width: 180,
        customRender: ({ text }: { text: string }): JSX.Element => {
          return renderTextCell(text);
        },
      },
      {
        title: "结束时间",
        dataIndex: "endTime",
        ellipsis: true,
        width: 180,
        customRender: ({ text }: { text: string }): JSX.Element => {
          return renderTextCell(text);
        },
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
        customRender: ({ text }: { text: string }): JSX.Element => {
          return renderTextCell(text);
        },
      },
      {
        title: "日志内容",
        dataIndex: "logContent",
        ellipsis: true,
        customRender: ({ text }: { text: string }): JSX.Element => {
          return renderTextCell(text);
        },
      },
    ];

    const loading = ref(false);
    const dataSource = ref<CommandHistoryRecord[]>([]);
    const detailLoading = ref(false);
    const detailVisible = ref(false);
    const detailDataSource = ref<CommandHistoryLogRecord[]>([]);

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

    const getTableData = async (): Promise<void> => {
      try {
        loading.value = true;
        const deviceId = getCurrentDeviceId();
        const params = {
          pageNumber: queryState.state.pageNumber,
          pageSize: queryState.state.pageSize,
          ...(deviceId ? { deviceId } : {}),
          ...(queryState.state.downCmd ? { downCmd: queryState.state.downCmd } : {}),
          ...(queryState.state.startTime ? { startTime: queryState.state.startTime } : {}),
          ...(queryState.state.endTime ? { endTime: queryState.state.endTime } : {}),
        };
        const res = await deviceCenterCommandService.getDeviceCommandHistoryPage(params);
        if (res) {
          const { records, total } = res;
          dataSource.value = records as CommandHistoryRecord[];
          queryState.update({ total });
          queryState.writeCache();
        }
      } catch (_ignore) {
      } finally {
        loading.value = false;
      }
    };

    const pageChange = (pageNumber: number, pageSize: number): void => {
      queryState.setPage(pageNumber || 1, pageSize);
      getTableData();
    };

    const queryForm = (): void => {
      queryState.resetPage();
      queryState.writeCache();
      getTableData();
    };
    const reset = (): void => {
      queryState.update({
        startTime: dayjs().startOf("month").format("YYYY-MM-DD 00:00:00"),
        endTime: dayjs().endOf("month").format("YYYY-MM-DD 23:59:59"),
        downCmd: undefined,
      });
      queryState.resetPage();
      queryState.clearCache();
      getTableData();
    };
    const { scrollY } = useTableScroll();

    onMounted(() => {
      getTableData();
    });

    const layoutSlots = {
      "layout-header": (): JSX.Element => {
        return <div>{/* <Button type='primary' onClick={exportExcel} loading={exportLoading.value}>导出</Button> */}</div>;
      },
      "layout-content": (): JSX.Element => {
        return (
          <>
            <Form layout="inline" style={{ margin: "10px 0 0 0" }}>
              <FormItem style={{ paddingRight: 0, marginRight: "10px", marginBottom: "10px" }} label="开始时间">
                <DatePicker
                  show-time
                  valueFormat="YYYY-MM-DD HH:mm:ss"
                  v-model:value={queryState.state.startTime}
                  placeholder="请选择开始时间"
                  allowClear
                />
              </FormItem>
              <FormItem style={{ paddingRight: 0, marginRight: "10px", marginBottom: "10px" }} label="结束时间">
                <DatePicker
                  show-time
                  valueFormat="YYYY-MM-DD HH:mm:ss"
                  v-model:value={queryState.state.endTime}
                  placeholder="请选择结束时间"
                  allowClear
                />
              </FormItem>
              <FormItem style={{ paddingRight: 0, marginRight: "10px", marginBottom: "10px" }} label="命令类型">
                <Select
                  style={{ width: "180px" }}
                  v-model:value={queryState.state.downCmd}
                  placeholder="请选择命令类型"
                  options={commandTypeOptions}
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
            <AliasTable
              rowKey={(record: CommandHistoryRecord): string => record.instanceId || `${record.cmdSeq || ""}-${record.startTime || ""}`}
              columns={columns}
              loading={loading.value}
              dataSource={dataSource.value}
              tableCode={tableCode}
              pagination={false}
              scrollY={scrollY.value}
              applicationCode={__ENV__.applicationCode}
            />
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
      "footer-page": (): JSX.Element => {
        return (
          <Page
            v-model:current={queryState.state.pageNumber}
            v-model:pageSize={queryState.state.pageSize}
            v-model:total={queryState.state.total}
            onPageChange={pageChange}
          />
        );
      },
    };
    return (): JSX.Element => (
      <>
        <Layout title="命令下发记录" v-slots={layoutSlots} />
      </>
    );
  },
});
