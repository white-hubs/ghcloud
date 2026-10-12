import { computed, defineComponent, onMounted, ref, reactive, h } from "vue";

import type { ProductState } from "@ghcloud/cube-iot-center-service";
import { Button, Modal, PopOver, Steps, Step, message, Table, Form, FormItem, Input, Select, Tag, Page, Spin } from "@ghcloud/cube-ui";

import { cubeDeviceCenterInternalService, cubeDeviceCenterService } from "@/api/service";
import { statusOptions } from "@/types/device-type";

import styles from "./event-relation-modal.module.less";

// ==================== 类型定义 ====================
interface Props {
  eventId: string;
  eventCode: string;
  eventName: string;
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

interface EventInfo {
  id: string;
  eventCode: string;
  name: string;
  categoryName?: string;
  statusName?: string;
  remark: string;
  eventConfig?: {
    triggerType: string;
  };
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
  { title: "选择事件", description: "需要关联的事件" },
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
export const EventRelationModal = defineComponent({
  props: {
    eventId: {
      type: String,
      default: "",
    },
    eventCode: {
      type: String,
      default: "",
    },
    eventName: {
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

    // 事件选择相关状态
    const eventLoading = ref(false);
    const selectedEvents = ref<EventInfo[]>([]);
    const eventSelectKeys = ref<string[]>([]);
    const eventSelectValue = ref<EventInfo[]>([]);
    const eventList = ref<EventInfo[]>([]);

    // 已关联的事件ID列表（用于禁用已关联的事件）
    const relatedEventIds = ref<Set<string>>(new Set());

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

    const eventColumns = [
      createTextColumn("事件标识", "eventCode", 180),
      createTextColumn("事件名称", "name", 180),
      createTextColumn("事件分类", "categoryName", 180),
      {
        title: "触发类型",
        dataIndex: "eventConfig",
        ellipsis: true,
        width: 180,
        customRender: ({ text }: { text: { triggerType: string } }): JSX.Element => {
          const triggerMap = new Map([
            ["SIMPLE", "设备属性事件"],
            ["SETTING", "设备阈值事件"],
            ["NATURE", "设备原生事件"],
          ]);
          const txt = text?.triggerType ? triggerMap.get(text.triggerType) || "--" : "--";
          return h(PopOver, { content: txt }, txt);
        },
      },
      createTextColumn("事件描述", "remark", 180),
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
     * 获取已关联的事件ID列表
     */
    const getRelatedEventIds = async (): Promise<void> => {
      try {
        if (!props.currentDeviceId) {
          return;
        }

        const res = await cubeDeviceCenterInternalService.getDeviceDataShare(props.currentDeviceId);
        if (res && Array.isArray(res)) {
          // 获取当前源事件已关联的所有目标事件ID（sourceDataType === 2 且 sourceDataId === props.eventId）
          const relatedIds = res
            .filter((item) => item.sourceDataType === 2 && item.sourceDataId === props.eventId)
            .map((item) => item.targetDataId);
          relatedEventIds.value = new Set(relatedIds);
        }
      } catch {
        // 静默失败
      }
    };

    /**
     * 获取设备事件列表
     */
    const getEventList = async (deviceId: string): Promise<void> => {
      try {
        eventLoading.value = true;
        const deviceDetail = await cubeDeviceCenterInternalService.getDeviceDetail({ deviceId });
        const productId = (deviceDetail as { productId?: string })?.productId;

        if (!productId) {
          message.error("该设备未关联产品，无法获取事件列表");
          return;
        }

        const res = await cubeDeviceCenterService.getProductEventList({ prodId: productId });
        if (res) {
          eventList.value = res as unknown as EventInfo[];
          // 获取已关联的事件ID列表
          await getRelatedEventIds();
        }
      } catch (error) {
        message.error("获取事件列表失败");
      } finally {
        eventLoading.value = false;
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
     * 设备搜索
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
     * 设备选择变化
     */
    const handleDeviceSelect = (keys: (string | number)[]): void => {
      deviceSelectKeys.value = keys as string[];
      const selected = deviceDataSource.value.filter((item) => keys.includes(item.id));
      deviceSelectValue.value = selected;
    };

    /**
     * 事件选择变化（多选）
     */
    const handleEventSelect = (keys: (string | number)[]): void => {
      eventSelectKeys.value = keys as string[];
      const selected = eventList.value.filter((item) => keys.includes(item.id));
      eventSelectValue.value = selected;
    };

    /**
     * 第一步：设备选择确认（多选设备，事件列表使用第一个设备的事件）
     */
    const handleDeviceStepOk = (): void => {
      if (deviceSelectValue.value.length === 0) {
        message.warning("请先选择设备");
        return;
      }
      selectedDevices.value = [...deviceSelectValue.value];
      const firstDevice = selectedDevices.value[0];
      if (firstDevice?.id) {
        getEventList(firstDevice.id);
        currentStep.value = 1;
      }
    };

    /**
     * 第二步：事件选择确认
     */
    const handleEventStepOk = (): void => {
      if (eventSelectValue.value.length === 0) {
        message.warning("请先选择需要关联的事件");
        return;
      }
      selectedEvents.value = eventSelectValue.value;
      currentStep.value = 2;
    };

    /**
     * 第三步：确认提交（多设备）
     */
    const handleConfirmStepOk = (): void => {
      if (selectedDevices.value.length === 0 || selectedEvents.value.length === 0) {
        message.warning("请完成设备及事件的选择");
        return;
      }
      emit("ok", {
        devices: selectedDevices.value,
        events: selectedEvents.value,
        sourceEventCode: props.eventCode,
        sourceEventName: props.eventName,
        sourceEventId: props.eventId,
      });
      handleCancel();
    };

    /**
     * 上一步
     */
    const handlePrev = (): void => {
      if (currentStep.value > 0) {
        currentStep.value--;
        // 如果返回第一步，清空事件选择
        if (currentStep.value === 0) {
          eventSelectKeys.value = [];
          eventSelectValue.value = [];
          selectedEvents.value = [];
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
      selectedEvents.value = [];
      deviceSelectKeys.value = [];
      deviceSelectValue.value = [];
      eventSelectKeys.value = [];
      eventSelectValue.value = [];
      eventList.value = [];
      deviceDataSource.value = [];
    };

    /**
     * 重置所有状态
     */
    const resetState = (): void => {
      handleCancel();
      Object.assign(devicePagination, DEFAULT_PAGINATION);
      Object.assign(deviceSearchForm, DEFAULT_SEARCH_FORM);
    };

    /**
     * 打开弹窗（不自动查询设备，需用户选择所属产品后点击查询或使用自动查询）
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
            const key = e.key as keyof typeof deviceSearchForm;
            return (
              <FormItem label={e.label} key={e.key} class={styles["form-item"]}>
                <Component
                  {...e.componentProps}
                  value={deviceSearchForm[key] || ""}
                  onUpdate:value={(val: string | number) => {
                    deviceSearchForm[key] = val as string;
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
            getCheckboxProps: (record: DeviceInfo) => ({
              disabled: props.currentDeviceId === record.id,
            }),
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
     * 渲染第二步：事件选择（事件列表来自选中设备中的第一个设备）
     */
    const renderEventStep = (): JSX.Element => (
      <div>
        {selectedDevices.value.length > 0 && (
          <div class={styles["selected-device-info"]}>
            <span class={styles["selected-device-label"]}>已选设备（共 {selectedDevices.value.length} 个），事件列表来自：</span>
            <span>
              {selectedDevices.value[0].name} ({selectedDevices.value[0].deviceNumber})
            </span>
          </div>
        )}
        <Spin spinning={eventLoading.value}>
          <Table
            columns={eventColumns}
            loading={eventLoading.value}
            dataSource={eventList.value}
            pagination={false}
            size="small"
            rowSelection={{
              type: "checkbox",
              selectedRowKeys: eventSelectKeys.value,
              onChange: handleEventSelect,
              getCheckboxProps: (record: EventInfo) => {
                // 限制条件1：已经关联过的事件不能再次选择
                const notRelated = !relatedEventIds.value.has(record.id);
                // 限制条件2：triggerType 为 NATURE
                const triggerType = record.eventConfig?.triggerType;
                const triggerTypeValid = triggerType === "NATURE";
                return {
                  disabled: !notRelated || !triggerTypeValid,
                };
              },
            }}
            rowKey={(record: EventInfo) => record.id || ""}
            scrollY={TABLE_SCROLL_Y}
          />
          <div class={styles["selected-count"]}>
            <div>
              <span>已选：{eventSelectValue.value.length} 条数据</span>
            </div>
          </div>
        </Spin>
        <div class={styles["button-container"]}>
          <Button onClick={handlePrev}>上一步</Button>
          <Button onClick={handleCancel} class={styles["button-spacing"]}>
            取消
          </Button>
          <Button type="primary" class={styles["button-spacing"]} onClick={handleEventStepOk}>
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
          {/* 源事件信息 */}
          <div class={styles["info-card"]}>
            <div class={styles["info-title"]}>源事件信息</div>
            <div class={styles["info-item"]}>
              <div>
                <span class={styles["info-label"]}>事件标识：</span>
                <span>{props.eventCode}</span>
              </div>
              <div>
                <span class={styles["info-label"]}>事件名称：</span>
                <span>{props.eventName}</span>
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

          {/* 已选事件列表 */}
          {selectedEvents.value.length > 0 && (
            <div class={styles["info-card"]}>
              <div class={styles["info-title"]}>已选事件（共 {selectedEvents.value.length} 个）</div>
              <Table
                columns={eventColumns}
                dataSource={selectedEvents.value}
                pagination={false}
                size="small"
                rowKey={(record: EventInfo) => record.id || ""}
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
        title={`事件关联 - ${props.eventName || props.eventCode}`}
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
        {currentStep.value === 1 && renderEventStep()}
        {currentStep.value === 2 && renderConfirmStep()}
      </Modal>
    );
  },
});
