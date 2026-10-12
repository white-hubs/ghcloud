import dayjs from "dayjs";
import { defineComponent, onMounted, reactive, ref } from "vue";

import { Button, DateRangePicker, Form, FormItem, Modal, Page, PopOver, Table } from "@ghcloud/cube-ui";

import { cubeDeviceCenterInternalService, cubeDeviceCenterService } from "@/api/service";
import { useLoopExportExcel, type Row } from "@/hook/use-loop-export-excel";
import { DeviceStatusOptions, type LedgerInfo } from "@/types/device-type";
import { debounce } from "@/utils/tool";

interface Props {
  id: string;
}
interface RecordState {
  name: string;
  dataType?: string;
  unitName: string;
  dataConfig?: string;
  propCode?: string;
  deviceName?: string;
  deviceNumber?: string;
}
interface ValueState {
  value: string;
  valueText: string;
  valueOfStr: string;
  ts: number;
}
const DATE_TIME_FORMAT = "YYYY-MM-DD HH:mm:ss";

const getDefaultPeriod = (): [string, string] => [
  dayjs().startOf("week").format("YYYY-MM-DD 00:00:00"),
  dayjs().format("YYYY-MM-DD 23:59:59"),
];

export const AttrInfoModel = defineComponent({
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
        title: "值",
        dataIndex: "valueText",
        ellipsis: true,
        align: "center",
        customRender: ({ record }: { record: { value: string; valueText: string; valueOfStr: string } }): JSX.Element => {
          let value = record.valueText || record.value;
          if (recordState.value?.dataType && ["float", "int", "long", "double"].includes(recordState.value?.dataType)) {
            value = record.valueOfStr;
          }
          return <PopOver content={value ?? "--"}>{value ?? "--"}</PopOver>;
        },
      },
      {
        title: "单位",
        dataIndex: "unitName",
        ellipsis: true,
        align: "center",
        customRender: (): JSX.Element => <PopOver content={unitName.value}>{unitName.value}</PopOver>,
      },
      {
        title: "更新时间",
        dataIndex: "ts",
        ellipsis: true,
        align: "center",
        customRender: ({ text }: { text: string }): JSX.Element => {
          const time = text ? dayjs(text).format("YYYY-MM-DD HH:mm:ss") : "";
          return <PopOver content={time || "--"}>{time || "--"}</PopOver>;
        },
      },
    ];
    const recordState = ref<RecordState>({
      name: "",
      dataType: "",
      unitName: "",
    });
    const loading = ref(false);
    const dataSource = ref<{ value: string; valueText: string; ts: number }[]>([]);
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
          propCodes: [curPropCode.value],
        };
        const res = await cubeDeviceCenterInternalService.getDeviceHistoryProp(params);
        if (res) {
          const { records, total } = res;
          dataSource.value = records as ValueState[];
          pagination.value.total = total;
          dataSource.value = resolveProp(dataSource.value as ValueState[]);
        }
      } catch {
        loading.value = false;
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
          propCodes: [curPropCode.value],
        };
        const res = await cubeDeviceCenterInternalService.getDeviceHistoryProp(params);
        res.records = resolveProp(res.records as ValueState[]);
        return res as { records: Row[] };
      } catch {
        return { records: [] };
      }
    };
    const state = reactive<{
      baseInfo: LedgerInfo;
    }>({
      baseInfo: {},
    });
    const getDeviceInfo = async (): Promise<void> => {
      try {
        const res = await cubeDeviceCenterService.getDeviceInstanceDetail({ deviceId: props.id });
        state.baseInfo = res as unknown as LedgerInfo;
      } catch {}
    };
    const downloadExcel = async (): Promise<void> => {
      await getDeviceInfo();
      const onlineState = state.baseInfo?.baseArchivesInfo?.status?.onlineState ?? 0;
      const curState = DeviceStatusOptions.find((e) => e.value === Number(onlineState));
      const headDesc = `设备序列号: ${recordState.value.deviceNumber || "--"}\t    设备名称: ${recordState.value.deviceName || "--"}\t    设备状态: ${curState?.label || "--"}\t    所属区域: ${state.baseInfo.baseArchivesInfo?.area?.name || "--"}\n    属性名称: ${recordState.value.name || "--"} `;

      exportData({
        fileName: `${recordState.value.deviceName}-${recordState.value.deviceNumber}-${recordState.value.name}-${recordState.value.propCode}`,
        exportTotal: pagination.value.total,
        pageSize: 1000,
        columns,
        getExportDataFunc: async (pageNumber: number, pageSize: number) => queryExportData(pageNumber, pageSize),
        headDesc,
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
    const dataConfigStr = ref();
    const curPropCode = ref();
    const unitName = ref();
    const openModal = (rowItem: RecordState): void => {
      modalVisible.value = true;
      recordState.value = rowItem;
      dataConfigStr.value = rowItem.dataConfig;
      curPropCode.value = rowItem.propCode;
      pagination.value.pageNumber = 1;
      unitName.value = rowItem.unitName;
      formState.period = getDefaultPeriod();
      getTableData();
    };
    const resolveProp = (
      dataSource: {
        unitName?: string;
        value: string;
        valueText: string;
        valueOfStr: string;
        ts: number;
      }[],
    ): { value: string; valueText: string; valueOfStr: string; ts: number }[] => {
      if (dataSource.length > 0) {
        dataSource.map((item) => {
          const config = JSON.parse(dataConfigStr.value);
          if (config && item.value !== undefined) {
            if (Array.isArray(config)) {
              const cur = config.filter((c) => c.value + "" === item.value + "")[0];
              item.valueText = cur?.label ?? item.value;
            } else {
              item.valueText = config[item.value];
            }
            if (recordState.value?.dataType && ["float", "int", "long", "double"].includes(recordState.value?.dataType)) {
              item.valueText = item.valueOfStr;
            }
          }
          item.unitName = unitName.value;
          return item;
        });
      }
      return dataSource;
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
            <FormItem style={{ paddingRight: 0, marginRight: "20px", marginBottom: "10px" }} label="属性名称">
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
        <Modal visible={modalVisible.value} title="历史数据" onOk={handleOk} onCancel={cancel} width={1000}>
          {searchForm()}
          <Table columns={columns} loading={loading.value} dataSource={dataSource.value} pagination={false} size="small" scrollY={500} />
          <Page
            class="mt-20px"
            style={{ marginTop: "20px", display: "flex", justifyContent: "right" }}
            syncToUrl={false}
            cachePageQuery={false}
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
