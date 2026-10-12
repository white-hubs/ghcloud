import Styles from "./import-modal.module.less";
import { IotDeviceTable } from "./iot-device-table";
import { cubeDeviceCenterInternalService, cubeDeviceCenterService } from "@/api/service";
import { ProductSelect } from "@/components/business/product-select/product-select";
import "@/styles/common.less";
import type { ImportType } from "@/types/common-type";
import { Form, FormItem, Modal, PopOver, Select, Step, Table } from "@ghcloud/cube-ui";
import type { ColumnType } from "@ghcloud/cube-ui/node_modules/ant-design-vue/es/table";
import Steps from "@ghcloud/cube-ui/src/components/steps";
import { message } from "ant-design-vue/es";
import { computed, defineComponent, reactive, ref } from "vue";

export const SyncModal = defineComponent({
  emits: ["enter"],
  setup(props, { emit, expose }) {
    const importVisible = ref<boolean>(false);
    const formRenderRef = ref<{ resetFields: () => void; validateFields: () => Promise<void>; validate: () => Promise<void> }>();

    const importCancel = (): void => {
      importVisible.value = false;
      emit("enter");
      formRenderRef.value?.resetFields();
      currentStep.value = 0;
    };
    const importData = reactive({
      success: "",
      fail: "",
    });
    const tableInfo = reactive<{ failColumns: ColumnType[]; failTableData: { details: string }[] }>({
      failColumns: [
        {
          title: "导入详情",
          dataIndex: "details",
          align: "center",
          width: 200,
          customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text || "--"}>{text || "--"}</PopOver>,
        },
        {
          title: "状态",
          dataIndex: "state",
          align: "center",
          width: 50,
          customRender: (): JSX.Element => <PopOver content="失败">失败</PopOver>,
        },
      ],
      failTableData: [],
    });
    const importSuccess = (res: ImportType): void => {
      Object.assign(importData, res);
      tableInfo.failTableData = [];
      tableInfo.failTableData = res.errorMsg.map((item) => ({
        details: item,
      }));
      currentStep.value++;
    };
    const tableInfoBatch = ref<{ failTableData: { details: string }[]; importData: ImportType }[]>([]);
    const importSuccessBatch = (res: ImportType): void => {
      currentStep.value = 2;
      tableInfoBatch.value.push({
        failTableData: res.errorMsg.map((item) => ({
          details: item,
        })),
        importData: res,
      });
    };
    const totalSuccess = computed(() => tableInfoBatch.value?.reduce((acc, item) => acc + Number(item.importData?.success ?? 0), 0));
    const totalFail = computed(() => tableInfoBatch.value?.reduce((acc, item) => acc + Number(item.importData?.fail ?? 0), 0));
    const totalFailTableData = computed(() => {
      const list: { details: string }[] = [];
      tableInfoBatch.value.map((item) => {
        list.concat(item.failTableData);
        return item;
      });
      // Return new Set([...list])
      return list;
    });

    const parentDeviceOption = ref<unknown[]>();
    const fileUploadRef = ref<{ triggerUpload: () => void; clearAll: () => void }>();
    const openModal = (): void => {
      formState.productId = undefined;
      formState.nodeTypeName = "";
      formState.nodeType = undefined;
      formState.parentDeviceId = null;
      importVisible.value = true;
      fileUploadRef.value?.clearAll();
      currentStep.value = 0;
      importLoading.value = false;
      if (formRenderRef.value) {
        formRenderRef.value.resetFields();
      }
      cubeDeviceCenterInternalService.getDeviceGateway().then((res: unknown[]) => {
        parentDeviceOption.value = res;
      });
    };
    expose({
      openModal,
    });
    const formState = reactive<{
      productId: string | undefined;
      parentDeviceId: string | null;
      deviceType: number;
      remark?: string;
      nodeType: number | undefined;
      nodeTypeName: string | undefined;
    }>({
      productId: undefined,
      parentDeviceId: null,
      deviceType: 1, // 设备类型 1真实设备; 0虚拟设备
      remark: "",
      nodeType: undefined,
      nodeTypeName: undefined,
    });

    const isSubDevice = computed(() => formState.nodeTypeName === "网关子设备" || formState.nodeType === 3);
    const modalRules = {
      productId: [{ required: true, message: "请选择所属产品", trigger: "blur" }],
    };
    const modalRulesTwo = {
      productId: [{ required: true, message: "请选择所属产品", trigger: "blur" }],
      parentDeviceId: [{ required: true, message: "请选择父级设备", trigger: "blur" }],
    };

    const importLoading = ref(false);
    const actionImport = async (): Promise<void> => {
      importLoading.value = true;
      try {
        const paramsSub = {
          productId: formState.productId ?? "",
          parentDeviceId: formState.parentDeviceId ?? "",
          isSubDevice: Number(isSubDevice.value),
          deviceType: Number(isSubDevice.value),
          synDevices: deviceList.value.map((i) => ({
            deviceNumber: i.devNum,
            deviceName: i.devName,
          })),
        };
        const params = {
          productId: formState.productId ?? "",
          isSubDevice: Number(isSubDevice.value),
          deviceType: Number(isSubDevice.value),
          synDevices: deviceList.value.map((i) => ({
            deviceNumber: i.devNum,
            deviceName: i.devName,
          })),
        };
        if (!batchDevice.checkAll) {
          await cubeDeviceCenterService.importBatchDeviceMgt(isSubDevice.value ? paramsSub : params).then((res) => {
            importSuccess(res as ImportType);
          });
          importLoading.value = false;
          emit("enter");
        } else {
          tableInfoBatch.value = [];
          await batchImport(isSubDevice.value ? paramsSub : params);
        }
      } catch {
        if (!batchDevice.checkAll) {
          importLoading.value = false;
          emit("enter");
        }
      }
    };
    const batchImport = async (params: Record<string, unknown>): Promise<void> => {
      importLoading.value = true;
      const payload: { synDevices: { deviceNumber: string; deviceName: string }[] } = { ...params, synDevices: [] };
      try {
        const pageSize = 50;
        const count = Math.ceil(batchDevice.total / pageSize);
        for (let i = 0; i < count; i++) {
          const { records } = await cubeDeviceCenterService.getDeviceMgtPage({ ...tableQuery.value, pageNumber: i + 1, pageSize });
          if (records) {
            payload.synDevices = records.map((i) => ({
              deviceNumber: (i as { devNum: string }).devNum,
              deviceName: (i as { devName: string }).devName,
            }));
            const res = await cubeDeviceCenterService.importBatchDeviceMgt(payload);
            importSuccessBatch(res as ImportType);
          }
        }
        importLoading.value = false;
        emit("enter");
      } catch {
        importLoading.value = false;
        emit("enter");
      }
    };
    const tableQuery = ref();
    const handleImport = async (): Promise<void> => {
      if (iotDeviceRef.value) {
        const { devNumLike, parentDevNum, devNameLike } = iotDeviceRef.value.formState;
        tableQuery.value = {
          devNumLike,
          parentDevNum,
          devNameLike,
          startTime: iotDeviceRef.value.period?.[0],
          endTime: iotDeviceRef.value.period?.[1],
        };
      }
      if (!batchDevice.checkAll && deviceList.value.length === 0) {
        message.warning("请选择需要同步的设备");
        return;
      }
      if (batchDevice.checkAll && !batchDevice.total) {
        message.warning("请选择需要同步的设备");
        return;
      }
      if (currentStep.value === 1) {
        await formRenderRef.value?.validate();
        actionImport();
        return;
      }
      currentStep.value++;
    };

    const currentStep = ref(0);
    const deviceList = ref<{ parentDevNum: string; devNum: string; devName: string }[]>([]);
    const iotDeviceRef = ref();
    const batchDevice = reactive({
      checkAll: false,
      total: 0,
    });

    return (): JSX.Element => (
      <>
        <Modal
          visible={importVisible.value}
          title="批量同步"
          onOk={currentStep.value < 2 ? handleImport : importCancel}
          onCancel={importCancel}
          confirmLoading={importLoading.value}
          okText={currentStep.value === 2 ? "确定" : "下一步"}
          width={1300}
          class="syncModal"
        >
          {importVisible.value && (
            <>
              <div class={Styles["step-form-title"]}>
                <Steps current={currentStep.value} size="small" style="width:80%">
                  <Step title="设备列表" />
                  <Step title="选择产品" />
                  <Step title="导入结果" />
                </Steps>
              </div>
              {currentStep.value === 0 && (
                <div class={Styles["step-form-table"]}>
                  <IotDeviceTable
                    ref={iotDeviceRef}
                    onSelection={(list) => {
                      deviceList.value = list;
                    }}
                    onCheckAll={(isAll, total) => {
                      batchDevice.checkAll = isAll;
                      batchDevice.total = total;
                    }}
                  />
                </div>
              )}
              {currentStep.value === 1 && (
                <div class={Styles["step-form"]} v-show={currentStep.value === 1}>
                  <Form model={formState} ref={formRenderRef} rules={isSubDevice.value ? modalRulesTwo : modalRules}>
                    <FormItem label="所属产品" name="productId">
                      <ProductSelect
                        width="380px"
                        v-model:value={formState.productId}
                        onChange={(e: { nodeType: number; nodeTypeName: string }) => {
                          formState.nodeType = e.nodeType;
                          formState.nodeTypeName = e.nodeTypeName;
                          if (!isSubDevice.value) {
                            formState.parentDeviceId = null;
                          }
                        }}
                      />
                    </FormItem>
                    <FormItem label="节点类型" name="nodeTypeName">
                      <span>{formState.nodeTypeName || "--"}</span>
                    </FormItem>
                    {isSubDevice.value && (
                      <>
                        <FormItem label="父级设备" name="parentDeviceId">
                          <Select
                            style={{ width: "380px" }}
                            v-model:value={formState.parentDeviceId}
                            options={parentDeviceOption.value}
                            placeholder="请选择父级设备"
                            field-names={{ label: "name", value: "id" }}
                            allowClear
                          />
                        </FormItem>
                      </>
                    )}
                  </Form>
                </div>
              )}
              {currentStep.value === 2 && !batchDevice.checkAll && (
                <div class={`${Styles["step-form"]} importFeedback`}>
                  <div class="importFeedback_title" style={{ marginBottom: "15px", textAlign: "center" }}>
                    <span>导入结果如下：</span>
                    <span>
                      导入成功共计<span style={{ color: "#389e0d", margin: "0 3px", fontSize: "14px" }}>{importData.success}</span>条，失败
                      <span style={{ fontSize: "14px", color: "#cf1322", margin: "0 3px" }}>{importData.fail}</span>条
                    </span>
                  </div>
                  {tableInfo.failTableData.length > 0 && (
                    <Table
                      columns={tableInfo.failColumns}
                      dataSource={tableInfo.failTableData}
                      pagination={false}
                      size="small"
                      scrollY={500}
                    />
                  )}
                </div>
              )}
              {currentStep.value === 2 && batchDevice.checkAll && (
                <>
                  <div class={`${Styles["step-form"]}`} style="max-height: 300px; overflow: auto">
                    <div class="importFeedback_title" style={{ marginBottom: "15px", textAlign: "center" }}>
                      <span>导入结果如下：</span>
                      <span>
                        导入成功共计<span style={{ color: "#389e0d", margin: "0 3px", fontSize: "14px" }}>{totalSuccess.value ?? 0}</span>
                        条，失败<span style={{ fontSize: "14px", color: "#cf1322", margin: "0 3px" }}>{totalFail.value ?? 0}</span>条
                      </span>
                    </div>
                    <Table
                      columns={tableInfo.failColumns}
                      dataSource={totalFailTableData.value}
                      pagination={false}
                      size="small"
                      scrollY={500}
                    />
                  </div>
                </>
              )}
            </>
          )}
        </Modal>
      </>
    );
  },
});
