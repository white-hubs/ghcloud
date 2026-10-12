import dayjs from "dayjs";
import { defineComponent, onMounted, reactive, ref } from "vue";

import { Button, DateRangePicker, Form, FormItem, Modal, Page, PopOver, Table } from "@ghcloud/cube-ui";

import { cubeDeviceCenterInternalService } from "@/api/service";
import { useLoopExportExcel, type Row } from "@/hook/use-loop-export-excel";
import { debounce } from "@/utils/tool";

interface Props {
  id: string;
}
interface RecordState {
  name: string;
  eventCode: string;
  deviceName?: string;
  deviceNumber?: string;
}
const DATE_TIME_FORMAT = "YYYY-MM-DD HH:mm:ss";

const getDefaultPeriod = (): [string, string] => [
  dayjs().startOf("week").format("YYYY-MM-DD 00:00:00"),
  dayjs().format("YYYY-MM-DD 23:59:59"),
];

export const EventInfoModel = defineComponent({
  props: {
    id: {
      type: String,
      default: "",
    },
  },
  emits: ["enter"],
  setup(props: Props, { emit, expose }) {
    const { exportLoading, exportData } = useLoopExportExcel();
    const formState = reactive({
      period: getDefaultPeriod(),
    });
    const columns = [
      {
        title: "上报时间",
        dataIndex: "eventTime",
        ellipsis: true,
        align: "center",
        customRender: ({ text }: { text: string }): JSX.Element => {
          const time = text ? dayjs(text).format("YYYY-MM-DD HH:mm:ss") : "";
          return <PopOver content={time || "--"}>{time || "--"}</PopOver>;
        },
      },
    ];
    const recordState = ref<RecordState>({ name: "", eventCode: "" });
    const loading = ref(false);
    const dataSource = ref<unknown[]>([]);
    const pagination = ref({
      pageSize: 10,
      pageNumber: 1,
      total: 0,
    });
    const getTableData = async (): Promise<void> => {
      try {
        loading.value = true;
        const params = {
          startTime: dayjs(formState.period[0]).format(DATE_TIME_FORMAT),
          endTime: dayjs(formState.period[1]).format(DATE_TIME_FORMAT),
          pageNumber: pagination.value.pageNumber,
          pageSize: pagination.value.pageSize,
          deviceId: props.id,
          eventCodes: recordState.value?.eventCode ? [recordState.value?.eventCode] : [],
        };
        const res = await cubeDeviceCenterInternalService.getDeviceHistoryEvent(params);
        if (res) {
          const { records, total } = res;
          dataSource.value = records;
          pagination.value.total = total;
        }
      } catch {
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
      formState.period = getDefaultPeriod();
      queryForm();
    };
    const queryExportData = async (pageNumber: number, pageSize: number): Promise<{ records: Row[] }> => {
      try {
        const params = {
          startTime: dayjs(formState.period[0]).format(DATE_TIME_FORMAT),
          endTime: dayjs(formState.period[1]).format(DATE_TIME_FORMAT),
          pageNumber,
          pageSize,
          deviceId: props.id,
          eventCodes: recordState.value?.eventCode ? [recordState.value?.eventCode] : [],
        };
        const res = await cubeDeviceCenterInternalService.getDeviceHistoryEvent(params);
        return res as { records: Row[] };
      } catch {
        return { records: [] };
      }
    };
    const downloadExcel = async (): Promise<void> => {
      exportData({
        fileName: `${recordState.value.deviceName}-${recordState.value.deviceNumber}-${recordState.value.name}-${recordState.value.eventCode}`,
        exportTotal: pagination.value.total,
        pageSize: 1000,
        columns,
        getExportDataFunc: async (pageNumber: number, pageSize: number) => queryExportData(pageNumber, pageSize),
      });
    };

    const modalVisible = ref<boolean>(false);
    const handleOk = debounce(() => {
      emit("enter");
      modalVisible.value = false;
    }, 500);
    const cancel = (): void => {
      modalVisible.value = false;
    };
    const openModal = (rowItem: RecordState): void => {
      modalVisible.value = true;
      recordState.value = rowItem;
      pagination.value.pageNumber = 1;
      formState.period = getDefaultPeriod();
      getTableData();
    };
    onMounted(async () => {
      await getTableData();
    });

    expose({
      openModal,
    });
    const searchForm = (): JSX.Element => (
      <>
        <div style="display:flex;justify-content: space-between;">
          <Form layout="inline" style={{ margin: "0 0 10px 0" }}>
            <FormItem style={{ paddingRight: 0, marginRight: "20px", marginBottom: "10px" }} label="事件名称">
              <span>{recordState.value.name ?? "--"}</span>
            </FormItem>
            <FormItem style={{ paddingRight: 0, marginRight: "10px", marginBottom: "10px" }} label="时间范围">
              <DateRangePicker
                v-model:value={formState.period}
                allowClear={false}
                showTime
                format={DATE_TIME_FORMAT}
                valueFormat={DATE_TIME_FORMAT}
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
          <Button type="primary" loading={exportLoading.value} disabled={Number(pagination.value.total) === 0} onClick={downloadExcel}>
            导出
          </Button>
        </div>
      </>
    );
    return (): JSX.Element => (
      <>
        <Modal visible={modalVisible.value} title="历史记录" onOk={handleOk} onCancel={cancel} width={1000}>
          {searchForm()}
          <Table columns={columns} loading={loading.value} dataSource={dataSource.value} pagination={false} size="small" scrollY={500} />
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
      </>
    );
  },
});
