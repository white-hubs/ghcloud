import { cubeDeviceCenterService } from "@/api/service";
import { logger } from "@/logger";
import type { ImportProductType } from "@/types/common-type";
import { GLOBAL_SCENE_CODE } from "@ghcloud/cube-file-service";
import { Form, FormItem, Modal, PopOver, Step, Table, message, type FormExpose } from "@ghcloud/cube-ui";
import type { ColumnType } from "@ghcloud/cube-ui/node_modules/ant-design-vue/es/table";
import Steps from "@ghcloud/cube-ui/src/components/steps";
import { FileUpload } from "@ghcloud/generic-component";
import { debounce } from "lodash";
import { defineComponent, reactive, ref } from "vue";

interface ImportModalExpose {
  openModal: () => void;
}

/** 产品导入弹窗 */
export const ImportModal = defineComponent({
  emits: ["enter", "cancel"],
  setup(_, { emit, expose }) {
    // ==================== 状态管理 ====================
    const modalVisible = ref(false);
    const formInstance = ref<FormExpose>();
    const currentStep = ref(0);
    const importLoading = ref(false);
    const fileUploadRef = ref<{ triggerUpload: () => void; clearAll: () => void }>();

    // ==================== 表单数据 ====================
    const formState = reactive<{
      excel: File | null;
    }>({
      excel: null,
    });

    const formRules = {
      excel: [{ required: true, message: "请上传附件", trigger: "blur" }],
    };

    // ==================== 导入结果数据 ====================
    const importData = reactive<ImportProductType>({
      productSuccess: "",
      productFailDetails: [],
      timestamp: Date.now(),
    });

    const tableInfo = reactive<{
      failColumns: ColumnType[];
      failTableData: { details: string }[];
    }>({
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

    // ==================== 业务逻辑 ====================
    /**
     * 处理导入成功后的数据
     */
    const handleImportSuccess = (res: ImportProductType): void => {
      tableInfo.failTableData = [];
      if (res.productSuccess !== "ALL_SUCCESS") {
        tableInfo.failTableData = res.productFailDetails.map((item) => ({
          details: item,
        }));
      }
      Object.assign(importData, res);
    };

    /**
     * 执行导入操作
     */
    const handleImport = debounce(async (): Promise<void> => {
      if (!formState.excel || JSON.stringify(formState.excel) === "[]") {
        message.warning("请先上传文件");
        return;
      }

      importLoading.value = true;
      try {
        const params = {
          file: formState.excel as Blob | null,
        };
        const res = await cubeDeviceCenterService.importBatchProduct(params);
        currentStep.value = 1;
        handleImportSuccess(res as ImportProductType);
      } catch (err) {
        logger.debug(err);
      } finally {
        importLoading.value = false;
        emit("enter");
      }
    }, 500);

    /**
     * 确认按钮处理
     */
    const handleConfirm = (): void => {
      if (currentStep.value === 0) {
        // 第一步：执行导入
        handleImport();
      } else {
        // 第二步：关闭弹窗
        handleCancel();
      }
    };

    /**
     * 取消/关闭弹窗
     */
    const handleCancel = (): void => {
      modalVisible.value = false;
      formInstance.value?.resetFields();
      currentStep.value = 0;
      emit("cancel");
    };

    /**
     * 打开弹窗
     */
    const openModal = (): void => {
      // 重置状态
      formState.excel = null;
      currentStep.value = 0;
      importLoading.value = false;
      fileUploadRef.value?.clearAll();
      formInstance.value?.resetFields();

      // 打开弹窗
      modalVisible.value = true;
    };

    expose({
      openModal,
    } as ImportModalExpose);

    // ==================== 渲染内容 ====================
    /**
     * 步骤指示器
     */
    const renderSteps = (): JSX.Element => (
      <div style={{ marginBottom: "20px" }}>
        <Steps current={currentStep.value} size="small" style={{ width: "80%" }}>
          <Step title="上传数据" />
          <Step title="导入结果" />
        </Steps>
      </div>
    );

    /**
     * 第一步：上传文件表单
     */
    const renderUploadForm = (): JSX.Element => (
      <Form model={formState} ref={formInstance} rules={formRules}>
        <FormItem name="excel">
          <FileUpload
            ref={fileUploadRef}
            showtext
            sceneCode={GLOBAL_SCENE_CODE.deviceCenter}
            typelist={[".xls", ".xlsx"]}
            customText="支持上传（.xls/.xlsx）文件"
            multiple={false}
            customupload
            onFile={(file) => {
              formState.excel = file;
            }}
            type="picture"
            dragger
          />
        </FormItem>
      </Form>
    );

    /**
     * 第二步：导入结果展示
     */
    const renderImportResult = (): JSX.Element => {
      const isSuccess = importData.productSuccess === "ALL_SUCCESS";
      return (
        <div>
          <div style={{ marginBottom: "15px", textAlign: "center" }}>
            <span>导入结果如下：</span>
            {isSuccess ? <span style={{ color: "#389e0d" }}>导入成功</span> : <span style={{ color: "#cf1322" }}>导入失败</span>}
          </div>
          {tableInfo.failTableData.length > 0 && (
            <Table columns={tableInfo.failColumns} dataSource={tableInfo.failTableData} pagination={false} size="small" scrollY={500} />
          )}
        </div>
      );
    };

    /**
     * 弹窗内容
     */
    const renderModalContent = (): JSX.Element => (
      <>
        {renderSteps()}
        {currentStep.value === 0 && renderUploadForm()}
        {currentStep.value === 1 && renderImportResult()}
      </>
    );

    /**
     * 获取确认按钮文本
     */
    const getOkText = (): string => (currentStep.value === 1 ? "确定" : "下一步");

    return (): JSX.Element => (
      <Modal
        visible={modalVisible.value}
        title="批量导入"
        width="600px"
        destroyOnClose
        onOk={handleConfirm}
        onCancel={handleCancel}
        confirmLoading={importLoading.value}
        okText={getOkText()}
      >
        {renderModalContent()}
      </Modal>
    );
  },
});
