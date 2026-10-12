import { computed, defineComponent, onMounted, ref, reactive } from "vue";

import type { ProductState } from "@ghcloud/cube-iot-center-service";
import { Button, Modal, PopOver, Steps, Step, message, Table, Form, FormItem, Input, Select, Tag, Page, Spin } from "@ghcloud/cube-ui";

import { cubeDeviceCenterInternalService, cubeDeviceCenterService } from "@/api/service";
import { statusOptions } from "@/types/device-type";

import styles from "./prop-relation-modal.module.less";

// ==================== 类型定义 ====================
interface Props {
  propId: string;
  propCode: string;
  propName: string;
  // 源属性类型
  propDataType?: string | undefined;
  currentDeviceId?: string;
}

interface DeviceInfo {
  id: string;
  name: string;
  deviceNumber: string;
  productName: string;
  nodeTypeName: string;
  onlineTimeStr: string;
  status: number;
  slaveDeviceIds: string;
  productId?: string;
}

interface PropInfo {
  id: string;
  propId: string;
  propCode: string;
  name: string;
  dataTypeName?: string;
  dataType?: string;
  dataWrite: number;
  remark: string;
}

interface StepConfig {
  title: string;
  description: string;
}

interface DevicePageResponse {
  records: DeviceInfo[];
  total: number;
}

// ==================== 常量定义 ====================
const STEPS_CONFIG: StepConfig[] = [
  { title: "选择设备", description: "需要关联的设备" },
  { title: "选择属性", description: "需要关联的属性" },
  { title: "确认信息", description: "请确认关联信息" },
];

const DEFAULT_PAGINATION = {
  pageNumber: 1,
  pageSize: 10,
  total: 0,
};

const DEFAULT_SEARCH_FORM = {
  prodId: "",
  deviceNameOrNumber: "",
  status: "",
};

const SEARCH_INPUT_WIDTH = "180px";
const TABLE_SCROLL_Y = 430;
const CONFIRM_TABLE_SCROLL_Y = 300;

// ==================== 工具函数 ====================
/**
 * 创建文本列配置（带 PopOver）
 */
const createTextColumn = (title: string, dataIndex: string, width: number) => ({
  title,
  dataIndex,
  ellipsis: true,
  width,
  customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text || "--"}>{text || "--"}</PopOver>,
});

/**
 * 创建设备状态列配置
 */
const createDeviceStatusColumn = () => ({
  title: "设备状态",
  dataIndex: "status",
  ellipsis: true,
  width: 120,
  align: "center" as const,
  customRender: ({ text }: { text: number }): JSX.Element => {
    const curState = statusOptions.find((e) => e.value === text);
    return (
      <PopOver content={curState?.label || "--"}>{curState?.label ? <Tag color={curState?.color}>{curState?.label}</Tag> : "--"}</PopOver>
    );
  },
});

/**
 * 创建读写类型列配置
 */
const createReadWriteColumn = () => ({
  title: "读写类型",
  dataIndex: "dataWrite",
  ellipsis: true,
  width: 180,
  customRender: ({ text }: { text: number }): string => (text === 1 ? "读写" : "只读"),
});

/**
 * 解析设备列表响应数据
 */
const parseDeviceListResponse = (res: unknown): DevicePageResponse | null => {
  if (!res || typeof res !== "object") {
    return null;
  }

  if ("data" in res && res.data) {
    const data = res.data as DevicePageResponse;
    return { records: data.records, total: data.total };
  }

  if ("records" in res) {
    return res as DevicePageResponse;
  }

  return null;
};

// ==================== 组件 ====================
export const PropRelationModal = defineComponent({
  props: {
    propId: {
      type: String,
      default: "",
    },
    propCode: {
      type: String,
      default: "",
    },
    propName: {
      type: String,
      default: "",
    },
    propDataType: {
      type: String,
      default: "",
    },
    currentDeviceId: {
      type: String,
      default: "",
    },
  },
  emits: ["ok"],
  setup(props: Props, { emit, expose }) {
    // ==================== 状态管理 ====================
    const modalVisible = ref(false);
    const currentStep = ref(0);

    // 设备选择相关状态（支持多选）
    const deviceLoading = ref(false);
    const selectedDevices = ref<DeviceInfo[]>([]);
    const deviceSelectKeys = ref<string[]>([]);
    const deviceSelectValue = ref<DeviceInfo[]>([]);
    const deviceDataSource = ref<DeviceInfo[]>([]);
    const devicePagination = reactive({ ...DEFAULT_PAGINATION });
    const deviceSearchForm = reactive({ ...DEFAULT_SEARCH_FORM });

    // 属性选择相关状态
    const propLoading = ref(false);
    const selectedProps = ref<PropInfo[]>([]);
    const propSelectKeys = ref<string[]>([]);
    const propSelectValue = ref<PropInfo[]>([]);
    const propList = ref<PropInfo[]>([]);

    // 已关联的属性ID列表（用于禁用已关联的属性）
    const relatedPropIds = ref<Set<string>>(new Set());

    // 产品选项
    const productOptions = ref<ProductState[]>([]);

    // ==================== 表格列配置 ====================
    const deviceColumns = [
      createTextColumn("设备序列号", "deviceNumber", 200),
      createTextColumn("设备名称", "name", 180),
      createTextColumn("所属产品", "productName", 180),
      createTextColumn("节点类型", "nodeTypeName", 180),
      createTextColumn("最后连接时间", "onlineTimeStr", 180),
      createDeviceStatusColumn(),
    ];

    const propColumns = [
      createTextColumn("属性标识", "propCode", 180),
      createTextColumn("属性名称", "name", 180),
      createTextColumn("数据类型", "dataTypeName", 180),
      createReadWriteColumn(),
      createTextColumn("属性描述", "remark", 180),
    ];

    // ==================== 搜索配置 ====================
    const deviceSearch = computed(() => [
      {
        label: "所属产品",
        key: "prodId",
        component: Select,
        componentProps: {
          options: productOptions.value,
          changeOnSelect: true,
          fieldNames: { label: "prodName", value: "id" },
          placeholder: "请选择所属产品",
          style: { width: SEARCH_INPUT_WIDTH },
          showSearch: true,
          optionFilterProp: "prodName",
        },
      },
      {
        label: "设备状态",
        key: "status",
        component: Select,
        componentProps: {
          options: statusOptions,
          changeOnSelect: true,
          placeholder: "请选择设备状态",
          style: { width: SEARCH_INPUT_WIDTH },
        },
      },
      {
        label: "",
        key: "deviceNameOrNumber",
        component: Input,
        componentProps: {
          placeholder: "设备名称/设备序列号",
          maxlength: 200,
          showCount: false,
          style: { width: SEARCH_INPUT_WIDTH },
        },
      },
    ]);

    // ==================== API 调用 ====================
    /**
     * 获取设备列表（必须已选择所属产品）
     */
    const getDeviceList = async (): Promise<void> => {
      if (!deviceSearchForm.prodId) {
        deviceDataSource.value = [];
        devicePagination.total = 0;
        return;
      }
      try {
        deviceLoading.value = true;
        const params = {
          pageNumber: devicePagination.pageNumber,
          pageSize: devicePagination.pageSize,
          ...deviceSearchForm,
        };
        const res = await cubeDeviceCenterInternalService.getDevicePage(params);
        const parsedData = parseDeviceListResponse(res);
        if (parsedData) {
          deviceDataSource.value = parsedData.records;
          devicePagination.total = parsedData.total;
        }
      } catch (error) {
        message.error("获取设备列表失败");
      } finally {
        deviceLoading.value = false;
      }
    };

    /**
     * 获取已关联的属性ID列表
     */
    const getRelatedPropIds = async (): Promise<void> => {
      try {
        if (!props.currentDeviceId) {
          return;
        }

        const res = await cubeDeviceCenterInternalService.getDeviceDataShare(props.currentDeviceId);
        if (res && Array.isArray(res)) {
          // 获取当前源属性已关联的所有目标属性ID（sourceDataType === 1 且 sourceDataId === props.propId）
          const relatedIds = res
            .filter((item) => item.sourceDataType === 1 && item.sourceDataId === props.propId)
            .map((item) => item.targetDataId);
          relatedPropIds.value = new Set(relatedIds);
        }
      } catch {
        // 静默失败
      }
    };

    /**
     * 获取设备属性列表
     */
    const getPropList = async (deviceId: string): Promise<void> => {
      try {
        propLoading.value = true;
        const deviceDetail = await cubeDeviceCenterInternalService.getDeviceDetail({ deviceId });
        const productId = (deviceDetail as { productId?: string })?.productId;

        if (!productId) {
          message.error("该设备未关联产品，无法获取属性列表");
          return;
        }

        const res = await cubeDeviceCenterService.getProductPropList({ prodId: productId });
        if (res) {
          propList.value = res as unknown as PropInfo[];
          // 获取已关联的属性ID列表
          await getRelatedPropIds();
        }
      } catch (error) {
        message.error("获取属性列表失败");
      } finally {
        propLoading.value = false;
      }
    };

    // ==================== 事件处理 ====================
    /**
     * 设备分页变化
     */
    const handleDevicePageChange = (pageNumber: number, pageSize: number): void => {
      devicePagination.pageNumber = pageNumber || 1;
      devicePagination.pageSize = pageSize;
      getDeviceList();
    };

    /**
     * 设备搜索（必须已选择所属产品）
     */
    const handleDeviceSearch = (): void => {
      if (!deviceSearchForm.prodId) {
        message.warning("请先选择所属产品");
        return;
      }
      devicePagination.pageNumber = 1;
      getDeviceList();
    };

    /**
     * 设备搜索重置
     */
    const handleDeviceReset = (): void => {
      Object.assign(deviceSearchForm, DEFAULT_SEARCH_FORM);
      devicePagination.pageNumber = 1;
      getDeviceList();
    };

    /**
     * 设备选择变化（多选）
     */
    const handleDeviceSelect = (keys: (string | number)[]): void => {
      deviceSelectKeys.value = keys as string[];
      const selected = deviceDataSource.value.filter((item) => keys.includes(item.id));
      deviceSelectValue.value = selected;
    };

    /**
     * 属性选择变化（多选）
     */
    const handlePropSelect = (keys: (string | number)[]): void => {
      propSelectKeys.value = keys as string[];
      const selected = propList.value.filter((item) => keys.includes(item.id));
      propSelectValue.value = selected;
    };

    /**
     * 第一步：设备选择确认（多选设备，属性使用第一个设备的属性）
     */
    const handleDeviceStepOk = (): void => {
      if (deviceSelectValue.value.length === 0) {
        message.warning("请先选择设备");
        return;
      }
      selectedDevices.value = [...deviceSelectValue.value];
      const firstDevice = selectedDevices.value[0];
      if (firstDevice?.id) {
        getPropList(firstDevice.id);
        currentStep.value = 1;
      }
    };

    /**
     * 第二步：属性选择确认
     */
    const handlePropStepOk = (): void => {
      if (propSelectValue.value.length === 0) {
        message.warning("请先选择需要关联的属性");
        return;
      }
      selectedProps.value = propSelectValue.value;
      currentStep.value = 2;
    };

    /**
     * 第三步：确认提交（多设备）
     */
    const handleConfirmStepOk = (): void => {
      if (selectedDevices.value.length === 0 || selectedProps.value.length === 0) {
        message.warning("请完成设备及属性的选择");
        return;
      }
      emit("ok", {
        devices: selectedDevices.value,
        props: selectedProps.value,
        sourcePropCode: props.propCode,
        sourcePropName: props.propName,
        sourcePropId: props.propId,
      });
      handleCancel();
    };

    /**
     * 上一步
     */
    const handlePrev = (): void => {
      if (currentStep.value > 0) {
        currentStep.value--;
        // 如果返回第一步，清空属性选择
        if (currentStep.value === 0) {
          propSelectKeys.value = [];
          propSelectValue.value = [];
          selectedProps.value = [];
        }
      }
    };

    /**
     * 取消/关闭弹窗
     */
    const handleCancel = (): void => {
      modalVisible.value = false;
      currentStep.value = 0;
      selectedDevices.value = [];
      selectedProps.value = [];
      deviceSelectKeys.value = [];
      deviceSelectValue.value = [];
      propSelectKeys.value = [];
      propSelectValue.value = [];
      propList.value = [];
      deviceDataSource.value = [];
    };

    /**
     * 重置所有状态（含请求数据与选中数据）
     */
    const resetState = (): void => {
      handleCancel();
      Object.assign(devicePagination, DEFAULT_PAGINATION);
      Object.assign(deviceSearchForm, DEFAULT_SEARCH_FORM);
    };

    /**
     * 打开弹窗（不自动查询设备，需用户选择所属产品后点击查询）
     */
    const openModal = (): void => {
      resetState();
      modalVisible.value = true;
    };

    // ==================== 生命周期 ====================
    onMounted(async () => {
      cubeDeviceCenterService.getProductListAll().then((res) => {
        productOptions.value = res;
      });
    });

    expose({
      openModal,
    });

    // ==================== 渲染函数 ====================
    /**
     * 渲染第一步：设备选择
     */
    const renderDeviceStep = (): JSX.Element => (
      <div>
        <Form layout="inline" class={styles["search-form"]}>
          {deviceSearch.value.map((e) => {
            const Component = e.component;
            return (
              <FormItem label={e.label} key={e.key} class={styles["form-item"]}>
                <Component
                  {...e.componentProps}
                  value={deviceSearchForm[e.key as keyof typeof deviceSearchForm] || ""}
                  onUpdate:value={(val: string | number) => {
                    deviceSearchForm[e.key as keyof typeof deviceSearchForm] = val as string;
                  }}
                />
              </FormItem>
            );
          })}
          <FormItem>
            <Button type="primary" onClick={handleDeviceSearch}>
              查询
            </Button>
            <Button class={styles["button-spacing"]} onClick={handleDeviceReset}>
              重置
            </Button>
          </FormItem>
        </Form>
        <Table
          columns={deviceColumns}
          loading={deviceLoading.value}
          dataSource={deviceDataSource.value}
          pagination={false}
          size="small"
          rowSelection={{
            type: "checkbox",
            selectedRowKeys: deviceSelectKeys.value,
            onChange: handleDeviceSelect,
            // getCheckboxProps: (record: DeviceInfo) => ({
            //   disabled: props.currentDeviceId === record.id,
            // }),
          }}
          rowKey="id"
          scrollY={TABLE_SCROLL_Y}
        />
        <div class={styles["pagination-container"]}>
          <div></div>
          <Page
            syncToUrl={false}
            v-model:current={devicePagination.pageNumber}
            v-model:pageSize={devicePagination.pageSize}
            v-model:total={devicePagination.total}
            onPageChange={handleDevicePageChange}
          />
        </div>
        <div class={styles["button-container"]}>
          <Button onClick={handleCancel}>取消</Button>
          <Button type="primary" class={styles["button-spacing"]} onClick={handleDeviceStepOk}>
            下一步
          </Button>
        </div>
      </div>
    );

    /**
     * 渲染第二步：属性选择（属性来自选中设备中的第一个设备）
     */
    const renderPropStep = (): JSX.Element => (
      <div>
        {selectedDevices.value.length > 0 && (
          <div class={styles["selected-device-info"]}>
            <span class={styles["selected-device-label"]}>已选设备（共 {selectedDevices.value.length} 个），属性列表来自：</span>
            <span>
              {selectedDevices.value[0].name} ({selectedDevices.value[0].deviceNumber})
            </span>
          </div>
        )}
        <Spin spinning={propLoading.value}>
          <Table
            columns={propColumns}
            loading={propLoading.value}
            dataSource={propList.value}
            pagination={false}
            size="small"
            rowSelection={{
              type: "checkbox",
              selectedRowKeys: propSelectKeys.value,
              onChange: handlePropSelect,
              getCheckboxProps: (record: PropInfo) => {
                // 限制条件1：属性类型(dataType)不一样不能选择
                const dataTypeMatch = !props.propDataType || record.dataType === props.propDataType;
                // 限制条件2：已经关联过的属性不能再次选择
                const notRelated = !relatedPropIds.value.has(record.id);
                return {
                  disabled: !dataTypeMatch || !notRelated,
                };
              },
            }}
            rowKey={(record: PropInfo) => record.id || ""}
            scrollY={TABLE_SCROLL_Y}
          />
          <div class={styles["selected-count"]}>
            <div>
              <span>已选：{propSelectValue.value.length} 条数据</span>
            </div>
          </div>
        </Spin>
        <div class={styles["button-container"]}>
          <Button onClick={handlePrev}>上一步</Button>
          <Button onClick={handleCancel} class={styles["button-spacing"]}>
            取消
          </Button>
          <Button type="primary" class={styles["button-spacing"]} onClick={handlePropStepOk}>
            下一步
          </Button>
        </div>
      </div>
    );

    /**
     * 渲染第三步：确认信息
     */
    const renderConfirmStep = (): JSX.Element => (
      <div>
        <div class={styles["confirm-content"]}>
          {/* 源属性信息 */}
          <div class={styles["info-card"]}>
            <div class={styles["info-title"]}>源属性信息</div>
            <div class={styles["info-item"]}>
              <div>
                <span class={styles["info-label"]}>属性标识：</span>
                <span>{props.propCode}</span>
              </div>
              <div>
                <span class={styles["info-label"]}>属性名称：</span>
                <span>{props.propName}</span>
              </div>
            </div>
          </div>

          {/* 已选设备信息（多选） */}
          {selectedDevices.value.length > 0 && (
            <div class={styles["info-card"]}>
              <div class={styles["info-title"]}>已选设备（共 {selectedDevices.value.length} 个）</div>
              <Table
                columns={deviceColumns}
                dataSource={selectedDevices.value}
                pagination={false}
                size="small"
                rowKey="id"
                scrollY={CONFIRM_TABLE_SCROLL_Y}
              />
            </div>
          )}

          {/* 已选属性列表 */}
          {selectedProps.value.length > 0 && (
            <div class={styles["info-card"]}>
              <div class={styles["info-title"]}>已选属性（共 {selectedProps.value.length} 个）</div>
              <Table
                columns={propColumns}
                dataSource={selectedProps.value}
                pagination={false}
                size="small"
                rowKey={(record: PropInfo) => record.id || ""}
                scrollY={CONFIRM_TABLE_SCROLL_Y}
              />
            </div>
          )}
        </div>

        <div class={styles["button-container"]}>
          <Button onClick={handlePrev}>上一步</Button>
          <Button onClick={handleCancel} class={styles["button-spacing"]}>
            取消
          </Button>
          <Button type="primary" class={styles["button-spacing"]} onClick={handleConfirmStepOk}>
            确认
          </Button>
        </div>
      </div>
    );

    return (): JSX.Element => (
      <Modal
        visible={modalVisible.value}
        title={`属性关联 - ${props.propName || props.propCode}`}
        width="1300px"
        destroyOnClose
        onCancel={handleCancel}
        footer={null}
      >
        <Steps current={currentStep.value}>
          {STEPS_CONFIG.map((step, index) => (
            <Step key={index} title={step.title} description={step.description} />
          ))}
        </Steps>
        <div style={{ height: "20px" }} />
        {currentStep.value === 0 && renderDeviceStep()}
        {currentStep.value === 1 && renderPropStep()}
        {currentStep.value === 2 && renderConfirmStep()}
      </Modal>
    );
  },
});
