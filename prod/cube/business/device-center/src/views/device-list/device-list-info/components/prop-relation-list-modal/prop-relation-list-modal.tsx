import styles from "./prop-relation-list-modal.module.less";
import { cubeDeviceCenterInternalService } from "@/api/service";
import { Button, Modal, PopOver, Table, message, Tag } from "@ghcloud/cube-ui";
import { defineComponent, ref } from "vue";

// ==================== 类型定义 ====================
interface DeviceDataShare {
  id: string;
  sourceDeviceId: string;
  sourceDeviceName: string;
  sourceProductId: string;
  sourceProductName: string;
  sourceDataType: number;
  sourceDataId: string;
  sourceDataCode: string;
  targetDeviceId: string;
  targetDeviceName?: string;
  targetProductId: string;
  targetProductName: string;
  targetDataId: string;
  targetDataCode?: string;
  shareMode: number;
}

interface Props {
  deviceId: string;
  propId: string;
}

// ==================== 组件 ====================
export const PropRelationListModal = defineComponent({
  props: {
    deviceId: {
      type: String,
      default: "",
    },
    propId: {
      type: String,
      default: "",
    },
  },
  emits: ["ok"],
  setup(_props: Props, { emit, expose }) {
    const modalVisible = ref(false);
    const loading = ref(false);
    const relationList = ref<DeviceDataShare[]>([]);
    const selectedRowKeys = ref<string[]>([]);
    const selectedRows = ref<DeviceDataShare[]>([]);

    // 接收外部传入的关联数据
    const setRelationList = (relations: DeviceDataShare[]): void => {
      relationList.value = relations;
    };

    // ==================== 表格列配置 ====================
    const columns = [
      {
        title: "目标设备名称",
        dataIndex: "targetDeviceName",
        ellipsis: true,
        width: 180,
        customRender: ({ record }: { record: DeviceDataShare }): JSX.Element => {
          const text = record.targetDeviceName || record.targetDeviceId || "--";
          return <PopOver content={text}>{text}</PopOver>;
        },
      },
      {
        title: "目标产品",
        dataIndex: "targetProductName",
        ellipsis: true,
        width: 180,
        customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text || "--"}>{text || "--"}</PopOver>,
      },
      {
        title: "目标属性标识",
        dataIndex: "targetDataCode",
        ellipsis: true,
        width: 180,
        customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text || "--"}>{text || "--"}</PopOver>,
      },
      {
        title: "共享模式",
        dataIndex: "shareMode",
        ellipsis: true,
        width: 120,
        align: "center" as const,
        customRender: ({ text }: { text: number }): JSX.Element => {
          const modeText = text === 1 ? "共享" : "转换";
          const modeColor = text === 1 ? "blue" : "green";
          return <Tag color={modeColor}>{modeText}</Tag>;
        },
      },
      {
        title: "操作",
        dataIndex: "action",
        width: 100,
        align: "center" as const,
        fixed: "right" as const,
        customRender: ({ record }: { record: DeviceDataShare }): JSX.Element => (
          <Button type="link" size="small" danger onClick={() => handleRemove(record)}>
            移除
          </Button>
        ),
      },
    ];

    // ==================== 事件处理 ====================
    /**
     * 单个移除关联
     */
    const handleRemove = async (record: DeviceDataShare): Promise<void> => {
      try {
        loading.value = true;
        await cubeDeviceCenterInternalService.removeDeviceDataShare(record.id);
        message.success("移除成功");
        // 从列表中移除该项
        relationList.value = relationList.value.filter((item) => item.id !== record.id);
        emit("ok");
      } catch (error) {
        message.error("移除失败");
      } finally {
        loading.value = false;
      }
    };

    /**
     * 批量移除关联
     */
    const handleBatchRemove = async (): Promise<void> => {
      if (selectedRowKeys.value.length === 0) {
        message.warning("请选择需要移除的关联数据");
        return;
      }

      try {
        loading.value = true;
        await cubeDeviceCenterInternalService.batchRemoveDeviceDataShare({
          ids: selectedRowKeys.value,
        });
        message.success(`成功移除 ${selectedRowKeys.value.length} 条关联数据`);
        selectedRowKeys.value = [];
        selectedRows.value = [];
        emit("ok");
      } catch (error) {
        message.error("批量移除失败");
      } finally {
        loading.value = false;
      }
    };

    /**
     * 取消/关闭弹窗
     */
    const handleCancel = (): void => {
      modalVisible.value = false;
      selectedRowKeys.value = [];
      selectedRows.value = [];
    };

    /**
     * 打开弹窗
     */
    const openModal = (relations: DeviceDataShare[]): void => {
      modalVisible.value = true;
      relationList.value = relations;
      selectedRowKeys.value = [];
      selectedRows.value = [];
    };

    /**
     * 行选择变化
     */
    const handleSelectChange = (keys: (string | number)[], rows: DeviceDataShare[]): void => {
      selectedRowKeys.value = keys as string[];
      selectedRows.value = rows;
    };

    expose({
      openModal,
      setRelationList,
    });

    return (): JSX.Element => (
      <Modal visible={modalVisible.value} title="关联数据列表" width="1000px" destroyOnClose onCancel={handleCancel} footer={null}>
        <div class={styles["relation-list-container"]}>
          {selectedRowKeys.value.length > 0 && (
            <div class={styles["batch-actions"]}>
              <span>已选：{selectedRowKeys.value.length} 条</span>
              <Button type="primary" danger onClick={handleBatchRemove}>
                批量移除
              </Button>
            </div>
          )}

          <Table
            columns={columns}
            loading={loading.value}
            dataSource={relationList.value}
            pagination={false}
            size="small"
            rowSelection={{
              type: "checkbox",
              selectedRowKeys: selectedRowKeys.value,
              onChange: handleSelectChange,
            }}
            rowKey="id"
            scrollY={400}
          />

          {relationList.value.length === 0 && !loading.value && <div class={styles["empty-tip"]}>暂无关联数据</div>}

          <div class={styles["button-container"]}>
            <Button onClick={handleCancel}>关闭</Button>
          </div>
        </div>
      </Modal>
    );
  },
});
