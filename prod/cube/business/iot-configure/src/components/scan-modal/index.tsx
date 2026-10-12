import { PickModal } from "./pick";
import {
  ctlAndVarScanParam,
  fetchScanResult,
  fetchScanVarResult,
  saveScanResult,
  saveScanVarResult,
  scanCtlAndVar,
  scanResult,
  scanVar,
  scanVarParamSchema,
  scanVarResult,
} from "@/api/scan";
import { useFormData } from "@/hook/use-form-data";
import { ScanResultEnum, TaskTypeEnum } from "@/typings/gateway";
import { exportExcel } from "@/utils/common";
import { Button, Form, FormItem, Modal, PopOver, Table, message, Switch, Row, Col } from "@ghcloud/cube-ui";
import type { FormExpose } from "@ghcloud/cube-ui/src/components/form/form";
import "@/styles/scan.less";
import InputNumber from "@ghcloud/cube-ui/src/components/input-number/input-number";
import { DynamicFormRender } from "@ghcloud/dynamic-form-render";
import { debounce } from "lodash";
import { defineComponent, ref, type PropType, type Component, watch, reactive, onUnmounted, computed } from "vue";

type FormSource = { value: string | number; label: string; component: Component; props?: unknown }[];
interface Props {
  formSource: FormSource;
  show: boolean;
  submitLoading?: boolean;
  labelWidth?: string;
  channelId: string;
  gwId: string;
  taskType: TaskTypeEnum;
}

export const ScanModal = defineComponent({
  props: {
    show: {
      type: Boolean,
      default: false,
    },
    submitLoading: {
      type: Boolean,
      default: false,
    },
    taskType: {
      type: Object as PropType<TaskTypeEnum>,
      default: TaskTypeEnum.SCAN_CONTROLLER_VAR,
    },
    channelId: {
      type: String,
      default: "",
    },
    gwId: {
      type: String,
      default: "",
    },
    labelWidth: {
      type: String,
      default: "80px",
    },
    formSource: {
      type: Array as PropType<FormSource>,
      default: () => [],
    },
  },
  emits: ["update:show", "ok", "cancle", "update:formState", "getList", "refresh"],
  setup: (props: Props, { emit, expose }) => {
    const cancel = (): void => {
      emit("cancle", false);
      emit("update:show", false);
      emit("refresh");
    };
    const ok = debounce(async (): Promise<void> => {
      emit("cancle", false);
      emit("update:show", false);
      emit("getList");
      emit("refresh");
    }, 500);
    const exportLoading = ref(false);
    const dynamicFormRenderRef = ref<{ formRef: FormExpose }>();
    const {
      dynFormOptions: dynOptions,
      dynFormData: dynamicFormData,
      labelWidth: dynOptionsWidth,
      updateFormOptions,
      resetForm,
    } = useFormData("");

    watch(
      () => props.show,
      async () => {
        if (!props.show) {
          return;
        }
        resetForm();
        currentScan.id = "";
        currentScan.scanVarResultList = [];
        datalist.value = [];
        if (props.taskType === TaskTypeEnum.SCAN_CONTROLLER_VAR) {
          const { data } = await ctlAndVarScanParam(props.channelId);
          updateFormOptions(data);
        }
        if (props.taskType === TaskTypeEnum.SCAN_VAR) {
          const { data } = await scanVarParamSchema(props.channelId);
          updateFormOptions(data);
        }
      },
    );
    const scanCtlAndVarId = ref<string>("");
    const cvtime = ref();
    const vtime = ref();
    const resultData = reactive({
      cvdata: {},
      cdata: {},
    });
    const start = debounce(async (): Promise<void> => {
      Promise.allSettled([modalFormRef.value?.validate(), dynamicFormRenderRef.value?.formRef.validate()]).then(async (values) => {
        const rejected = values.some((c) => c.status === "rejected");

        if (!rejected) {
          scanLoading.value = true;
          formState.taskType = props.taskType;
          const databody = {
            channelId: props.channelId,
            scanParam: {
              config: dynamicFormData.value,
              ...formState,
            },
          };
          if (props.taskType === TaskTypeEnum.SCAN_CONTROLLER_VAR) {
            CtlAndVar(databody);
          }
          if (props.taskType === TaskTypeEnum.SCAN_VAR) {
            ctlInfo({
              controllerId: props.channelId,
              scanParam: {
                config: dynamicFormData.value,
                ...formState,
              },
            });
          }
        }
      });
    }, 500);
    const stopLoading = ref(false);
    const stop = async (): Promise<void> => {
      scanLoading.value = false;
      stopLoading.value = true;
      if (scanCtlAndVarId.value === "") {
        return;
      }
      if (props.taskType === TaskTypeEnum.SCAN_VAR) {
        getfetchScanVarResult();
        clearInterval(vtime.value);
      }
      setTimeout(() => {
        stopLoading.value = false;
      }, 2 * 1000);
    };

    const datalist = ref([]);
    const isPick = ref(false);
    const getfetchScanResult = async (): Promise<void> => {
      try {
        const { data } = await fetchScanResult(scanCtlAndVarId.value, props.channelId);
        datalist.value = data.scanCtlResults;
        if (data.scanResult === ScanResultEnum.SCAN_COMPLETE) {
          message.destroy();
          message.success("扫描完成");
          isPick.value = true;
          stop();
        }
        const resultList = data.scanCtlResults?.filter(
          (item: { scanVarResultList: unknown[] }) => item.scanVarResultList && item.scanVarResultList.length,
        );
        currentScan.id = resultList[0].id;
        currentScan.scanVarResultList = resultList[0].scanVarResultList;
      } catch {
        scanLoading.value = false;
      }
    };
    const CtlAndVar = async (databody: {
      channelId: string;
      scanParam: { config: object; retryTimes: number | null; timeOut: number | null; taskType: number | null };
    }): Promise<void> => {
      const { data } = await scanCtlAndVar(databody);
      scanCtlAndVarId.value = data;
      message.loading("扫描中");
      getfetchScanResult();
      cvtime.value = setInterval(async () => {
        const { data } = await scanResult(scanCtlAndVarId.value);
        resultData.cvdata = data.scanResult;
        if ([ScanResultEnum.SCAN_COMPLETE, ScanResultEnum.SCAN_TIMEOUT].includes(data.scanResult)) {
          getfetchScanResult();
          clearInterval(cvtime.value);
        }
      }, 2000);
    };
    const handlePickOk = async (): Promise<void> => {
      currentScan.id = "";
      currentScan.scanVarResultList = [];
      if (props.taskType === TaskTypeEnum.SCAN_CONTROLLER_VAR) {
        getfetchScanResult();
      }
      if (props.taskType === TaskTypeEnum.SCAN_VAR) {
        getfetchScanVarResult();
      }
    };
    const getfetchScanVarResult = async (): Promise<void> => {
      const { data } = await fetchScanVarResult(scanCtlAndVarId.value, props.channelId);
      currentScan.scanVarResultList = data.scanVarResultList;
    };
    const ctlInfo = async (databody: {
      controllerId: string;
      scanParam: { config: object; retryTimes: number | null; timeOut: number | null; taskType: number | null };
    }): Promise<void> => {
      const { data } = await scanVar(databody);
      scanCtlAndVarId.value = data;
      getfetchScanVarResult();
      vtime.value = setInterval(async () => {
        const { data } = await scanVarResult(scanCtlAndVarId.value);
        resultData.cdata = data.scanResult;
        if ([ScanResultEnum.SCAN_COMPLETE, ScanResultEnum.SCAN_TIMEOUT].includes(data.scanResult)) {
          getfetchScanVarResult();
          clearInterval(vtime.value);
        }
      }, 2000);
    };

    const modalFormRef = ref<FormExpose>();
    const formState = reactive<{
      retryTimes: number | null;
      timeOut: number | null;
      taskType: number | null;
      omitRepeat: number | null;
    }>({
      retryTimes: 1,
      timeOut: 60,
      taskType: null,
      omitRepeat: 1,
    });

    // 对外暴露组件实例
    expose({
      modalFormRef,
    });
    const currentScan = reactive<{
      id: string;
      scanVarResultList: any[];
    }>({
      id: "",
      scanVarResultList: [],
    });
    const handleCol = (res: { id: string; scanVarResultList: any }): void => {
      currentScan.id = res.id;
      currentScan.scanVarResultList = res.scanVarResultList ?? [];
    };
    const rules = {
      retryTimes: [{ required: true, message: "请输入扫描重试次数" }],
      timeOut: [{ required: true, message: "请输入扫描超时时间" }],
    };
    const columns = [
      {
        title: "变量名称",
        dataIndex: "name",
        ellipsis: true,
        customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text || "--"}>{text || "--"}</PopOver>,
      },
      {
        title: "变量标识",
        dataIndex: "varCode",
        customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text || "--"}>{text || "--"}</PopOver>,
      },
      {
        title: "设备组名称",
        dataIndex: "devName",
        customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text || "--"}>{text || "--"}</PopOver>,
      },
      {
        title: "设备属性",
        dataIndex: "propName",
        customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text || "--"}>{text || "--"}</PopOver>,
      },
      {
        title: "属性标识",
        dataIndex: "propCode",
        customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text || "--"}>{text || "--"}</PopOver>,
      },
    ];
    const columnsVar = [
      {
        title: "变量名称",
        dataIndex: "name",
        ellipsis: true,
        customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text || "--"}>{text || "--"}</PopOver>,
      },
      {
        title: "变量标识",
        dataIndex: "varCode",
        customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text || "--"}>{text || "--"}</PopOver>,
      },
      {
        title: "数据类型",
        dataIndex: "dataType",
        customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text || "--"}>{text || "--"}</PopOver>,
      },
      {
        title: "读写类型",
        dataIndex: "readType",
        customRender: ({ text }: { text: number }): JSX.Element => (
          <PopOver content={text === 0 ? "只读" : "读写"}>{text === 0 ? "只读" : "读写"}</PopOver>
        ),
      },
    ];
    const leftColumns = [
      {
        title: "控制器名称",
        dataIndex: "name",
        ellipsis: true,
        customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text || "--"}>{text || "--"}</PopOver>,
      },
      {
        title: "控制器标识",
        dataIndex: "ctlCode",
        customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text || "--"}>{text || "--"}</PopOver>,
      },
    ];
    const saveAll = debounce(async (): Promise<void> => {
      if (props.taskType === TaskTypeEnum.SCAN_CONTROLLER_VAR) {
        const result = datalist.value.flatMap((device: { id: string; scanVarResultList: { id: string }[] }) =>
          device.scanVarResultList.map((item) => ({
            scanControllerId: device.id,
            scanVarId: item.id,
          })),
        );
        await saveScanResult({
          channelId: props.channelId,
          ctlAndVarParamList: result,
        });
      }
      if (props.taskType === TaskTypeEnum.SCAN_VAR) {
        await saveScanVarResult({
          controllerId: props.channelId,
          gatewayId: props.gwId,

          varParamList: currentScan.scanVarResultList.map((res) => res.id),
        });
      }
      emit("getList");
      emit("refresh");
      emit("cancle", false);
      emit("update:show", false);
    }, 500);
    const exportVariable = async (): Promise<void> => {
      exportLoading.value = true;
      exportExcel("/excel/exportScanCtlAndVarResult", { taskId: scanCtlAndVarId.value }, "设备变量.xlsx").then(() => {
        exportLoading.value = false;
      });
    };
    const scanLoading = ref<boolean>(false);
    const pickModalRef = ref<{ openModal: (id?: string) => void }>();
    const handlePick = (): void => {
      pickModalRef.value?.openModal();
    };
    onUnmounted(() => {
      if (vtime.value) {
        clearInterval(vtime.value);
      }
      if (cvtime.value) {
        clearInterval(cvtime.value);
      }
      isPick.value = false;
    });
    const title = computed(() => {
      const taskTypeTextMap = new Map<number, string>([
        [TaskTypeEnum.SCAN_CONTROLLER_VAR, "控制器变量"],
        [TaskTypeEnum.SCAN_CONTROLLER, "控制器"],
        [TaskTypeEnum.SCAN_VAR, "变量"],
      ]);
      const text = taskTypeTextMap.get(props.taskType) || "";
      return `扫描${text}`;
    });
    const modalFooterSlots = {
      footer: (): JSX.Element => (
        <>
          <Button key="back" onClick={cancel} style={{ display: "none" }}>
            取消
          </Button>
          <Button
            key="submit"
            disabled={currentScan.scanVarResultList.length === 0}
            loading={props.submitLoading ?? false}
            type="primary"
            onClick={saveAll}
          >
            保存本次扫描结果
          </Button>
          <Button
            type="primary"
            disabled={currentScan.scanVarResultList.length === 0}
            loading={exportLoading.value}
            onClick={exportVariable}
          >
            导出结果
          </Button>
          <Button
            key="submit"
            disabled={!isPick.value || currentScan.scanVarResultList.length === 0}
            loading={props.submitLoading ?? false}
            type="primary"
            onClick={handlePick}
          >
            拣选扫描结果
          </Button>
        </>
      ),
    };
    return (): JSX.Element => (
      <>
        <Modal
          visible={props.show}
          title={title.value}
          width="90vw"
          confirmLoading={props.submitLoading ?? false}
          destroyOnClose
          onCancel={cancel}
          onOk={ok}
          v-slots={modalFooterSlots}
          maskClosable={false}
        >
          <div style="height:650px;overflow:auto;padding-right: 16px;">
            <DynamicFormRender
              class={dynOptions.value?.length > 0 ? "dynamic-form" : ""}
              formOptions={dynOptions.value}
              labelWidth={`${dynOptionsWidth.value}px`}
              v-model:formData={dynamicFormData.value}
              ref={dynamicFormRenderRef}
            />
            <Form ref={modalFormRef} model={formState} rules={rules} labelCol={{ style: { width: props.labelWidth } }}>
              <Row style={{ marginLeft: "50px" }}>
                <Col span={8}>
                  <FormItem label="扫描重试次数:" name="retryTimes">
                    <InputNumber min={0} placeholder="请输入扫描重试次数" v-model:value={formState.retryTimes} />
                  </FormItem>
                </Col>
                <Col span={8}>
                  <FormItem label="扫描超时时间:" name="timeOut">
                    <InputNumber addon-after="秒" min={0} max={86400} placeholder="请输入扫描超时时间" v-model:value={formState.timeOut} />
                  </FormItem>
                </Col>
                <Col span={8}>
                  <FormItem label="是否去重:" name="omitRepeat">
                    <Switch v-model:value={formState.omitRepeat} checkedValue={1} />
                  </FormItem>
                </Col>
              </Row>
              <FormItem>
                <div class="flex-center">
                  <Button type="primary" onClick={start} loading={scanLoading.value}>
                    开始扫描
                  </Button>
                  <Button type="primary" style="margin-left:30px" onClick={stop}>
                    停止扫描
                  </Button>
                </div>
              </FormItem>
            </Form>
            <div class="bottom">
              {props.taskType === TaskTypeEnum.SCAN_CONTROLLER_VAR && (
                <div class="left">
                  <Table
                    pagination={false}
                    columns={leftColumns}
                    rowKey="id"
                    size="small"
                    dataSource={datalist.value}
                    scrollY={1000}
                    customRow={(record: any) => {
                      const isSelected = record.id === currentScan.id;
                      return {
                        onClick: () => handleCol(record),
                        style: {
                          background: isSelected ? "#e6f4ff" : "",
                          color: "#333",
                          cursor: "pointer",
                          "&:hover": {
                            color: "#333",
                            background: "#f5f5f5",
                          },
                        },
                      };
                    }}
                  />
                </div>
              )}
              <div style="flex:1;margin:0 20px;">
                <Table
                  pagination
                  columns={props.taskType === TaskTypeEnum.SCAN_CONTROLLER_VAR ? columns : columnsVar}
                  rowKey="id"
                  size="small"
                  dataSource={currentScan.scanVarResultList}
                  scrollY={500}
                />
              </div>
            </div>
          </div>
        </Modal>
        <PickModal
          ref={pickModalRef}
          taskType={props.taskType}
          taskId={scanCtlAndVarId.value}
          channelId={props.channelId}
          gwId={props.gwId}
          onOk={handlePickOk}
        />
      </>
    );
  },
});
