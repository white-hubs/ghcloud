import { cubeBusinessTagService } from "@/api/server";
import { useCubeModal } from "@ghcloud/cube-app-design";
import { DeviceSelectTable } from "@ghcloud/cube-app-design";
import { PropertySelectTable } from "@ghcloud/cube-app-design";
import { StallSelectTable } from "@ghcloud/cube-app-design";
import { InspectPointSelectTable } from "@ghcloud/cube-app-design";
import { PatrolPointSelectTable } from "@ghcloud/cube-app-design";
import { RiskSelectTable } from "@ghcloud/cube-app-design";
import { SmallEngineeringSelectTable } from "@ghcloud/cube-app-design";
import { AreaTreeSelectTable } from "@ghcloud/cube-app-design";
import "./tag-associated-object-select-modal.less";
import { TabPane, Tabs, Button, Space, Popconfirm, Table } from "ant-design-vue";
import type { Key } from "ant-design-vue/es/_util/type";
import { defineComponent, ref, reactive, watch, computed } from "vue";

export enum AssociatedObjectType {
  AREA = "AREA",
  DEVICE = "DEVICE",
  PROPERTY = "PROPERTY",
  STALL = "STALL",
  SITE_POINT = "SITE_POINT",
  PATROL_POINT = "PATROL_POINT",
  RISK_SOURCE = "RISK_SOURCE",
  SMALL_ENGINEERING = "SMALL_ENGINEERING",
}

// 获取类型标签
export const getAssociatedObjectTypeLabel = (type: AssociatedObjectType): string => {
  const typeLabels = {
    [AssociatedObjectType.AREA]: "区域",
    [AssociatedObjectType.DEVICE]: "设备",
    [AssociatedObjectType.PROPERTY]: "资产",
    [AssociatedObjectType.STALL]: "档位",
    [AssociatedObjectType.SITE_POINT]: "现场点",
    [AssociatedObjectType.PATROL_POINT]: "巡更点",
    [AssociatedObjectType.RISK_SOURCE]: "风险源",
    [AssociatedObjectType.SMALL_ENGINEERING]: "小散工程",
  };
  return typeLabels[type] || type;
};

interface SelectOption {
  id: string;
  name: string;
  type: AssociatedObjectType;
}

interface Props {
  title: string;
  multiple?: boolean;
  value?: SelectOption[]; // 禁止选择的对象
  defaultTab?: AssociatedObjectType; // 默认选中的tab
  showTabs?: AssociatedObjectType[]; // 显示的tab集合，默认全部
}

/** 关联对象选择弹窗 */
export const TagAssociatedObjectSelectModal = defineComponent({
  props: ["title", "multiple", "value", "unSelectedData", "defaultTab", "showTabs"],
  emits: ["enter", "cancel"],
  setup(props: Props, { emit, expose }) {
    const showTabs = props.showTabs && props.showTabs.length ? props.showTabs : Object.values(AssociatedObjectType);
    const defaultTab = props.defaultTab && showTabs.includes(props.defaultTab) ? props.defaultTab : showTabs[0];
    const activeKey = ref<AssociatedObjectType>(defaultTab);
    const selectedRowKeys = ref<string[]>([]);
    const associateIdsLoading = ref(false);

    const filterByType = (list: SelectOption[] | undefined, type: AssociatedObjectType): SelectOption[] =>
      (list || []).filter((v) => v.type === type);
    const selectValues = reactive<Record<AssociatedObjectType, SelectOption[]>>({
      [AssociatedObjectType.AREA]: filterByType(props.value, AssociatedObjectType.AREA),
      [AssociatedObjectType.DEVICE]: filterByType(props.value, AssociatedObjectType.DEVICE),
      [AssociatedObjectType.PROPERTY]: filterByType(props.value, AssociatedObjectType.PROPERTY),
      [AssociatedObjectType.STALL]: filterByType(props.value, AssociatedObjectType.STALL),
      [AssociatedObjectType.SITE_POINT]: filterByType(props.value, AssociatedObjectType.SITE_POINT),
      [AssociatedObjectType.PATROL_POINT]: filterByType(props.value, AssociatedObjectType.PATROL_POINT),
      [AssociatedObjectType.RISK_SOURCE]: filterByType(props.value, AssociatedObjectType.RISK_SOURCE),
      [AssociatedObjectType.SMALL_ENGINEERING]: filterByType(props.value, AssociatedObjectType.SMALL_ENGINEERING),
    });

    watch(
      () => props.value,
      (newVal) => {
        selectValues[AssociatedObjectType.AREA] = filterByType(newVal, AssociatedObjectType.AREA);
        selectValues[AssociatedObjectType.DEVICE] = filterByType(newVal, AssociatedObjectType.DEVICE);
        selectValues[AssociatedObjectType.PROPERTY] = filterByType(newVal, AssociatedObjectType.PROPERTY);
        selectValues[AssociatedObjectType.STALL] = filterByType(newVal, AssociatedObjectType.STALL);
        selectValues[AssociatedObjectType.SITE_POINT] = filterByType(newVal, AssociatedObjectType.SITE_POINT);
        selectValues[AssociatedObjectType.PATROL_POINT] = filterByType(newVal, AssociatedObjectType.PATROL_POINT);
        selectValues[AssociatedObjectType.RISK_SOURCE] = filterByType(newVal, AssociatedObjectType.RISK_SOURCE);
        selectValues[AssociatedObjectType.SMALL_ENGINEERING] = filterByType(newVal, AssociatedObjectType.SMALL_ENGINEERING);
        activeKey.value = newVal && newVal.length > 0 ? newVal[0].type : defaultTab;
      },
    );

    const unAreaSelect = ref<
      {
        id: string;
        type: AssociatedObjectType;
      }[]
    >([]);
    const unSitePointSelect = ref<
      {
        id: string;
        type: AssociatedObjectType;
      }[]
    >([]);
    const unPropertySelect = ref<
      {
        id: string;
        type: AssociatedObjectType;
      }[]
    >([]);
    const unStallSelect = ref<
      {
        id: string;
        type: AssociatedObjectType;
      }[]
    >([]);
    const unDeviceSelect = ref<
      {
        id: string;
        type: AssociatedObjectType;
      }[]
    >([]);
    const unRiskSourceSelect = ref<
      {
        id: string;
        type: AssociatedObjectType;
      }[]
    >([]);
    const unPatrolPointSelect = ref<
      {
        id: string;
        type: AssociatedObjectType;
      }[]
    >([]);
    const unSmallEngineeringSelect = ref<
      {
        id: string;
        type: AssociatedObjectType;
      }[]
    >([]);

    // 当前tab的已选数据
    const currentTabSelected = computed(() => selectValues[activeKey.value] || []);

    // 单个移除
    const removeItem = (id: string): void => {
      selectValues[activeKey.value] = selectValues[activeKey.value].filter((item) => item.id !== id);
      selectedRowKeys.value = selectedRowKeys.value.filter((key) => key !== id);
    };

    // 批量移除
    const batchRemove = (): void => {
      selectValues[activeKey.value] = selectValues[activeKey.value].filter((item) => !selectedRowKeys.value.includes(item.id));
      selectedRowKeys.value = [];
    };

    // 清空当前tab的选择
    const clearCurrentTab = (): void => {
      selectValues[activeKey.value] = [];
      selectedRowKeys.value = [];
    };

    // 切换tab时清空选中状态
    watch(activeKey, () => {
      selectedRowKeys.value = [];
    });

    // 已选列表表格列定义
    const selectedColumns = [
      {
        title: "名称",
        dataIndex: "name",
        key: "name",
        ellipsis: true,
      },
      {
        title: "操作",
        key: "action",
        width: 80,
        customRender: ({ record }: { record: SelectOption }): JSX.Element => (
          <Popconfirm title="确定要移除该项吗？" onConfirm={() => removeItem(record.id)}>
            <Button type="link" danger size="small">
              移除
            </Button>
          </Popconfirm>
        ),
      },
    ];

    const clearAllSelections = (): void => {
      Object.keys(selectValues).forEach((key) => {
        selectValues[key as AssociatedObjectType] = [];
      });
      selectedRowKeys.value = [];
    };

    const [CubeModal, modalApi] = useCubeModal({
      title: `${props.title}`,
      width: "1200px",
      wrapperClass: "object-select-modal-warpper",
      onConfirm: async () => {
        const allSelected = Object.values(selectValues).flat();
        emit("enter", allSelected);
        modalApi.close();
      },
      onCancel: () => {
        emit("cancel");
        modalApi.close();
      },
      onClosed: () => {
        // 弹窗完全关闭后清空选择数据
        clearAllSelections();
      },
    });
    const currentTagId = ref<string | undefined>(undefined);
    const getStoreByType = (type: AssociatedObjectType): { ref: typeof unAreaSelect } => {
      const map: Record<AssociatedObjectType, typeof unAreaSelect> = {
        [AssociatedObjectType.AREA]: unAreaSelect,
        [AssociatedObjectType.SITE_POINT]: unSitePointSelect,
        [AssociatedObjectType.PROPERTY]: unPropertySelect,
        [AssociatedObjectType.STALL]: unStallSelect,
        [AssociatedObjectType.DEVICE]: unDeviceSelect,
        [AssociatedObjectType.RISK_SOURCE]: unRiskSourceSelect,
        [AssociatedObjectType.PATROL_POINT]: unPatrolPointSelect,
        [AssociatedObjectType.SMALL_ENGINEERING]: unSmallEngineeringSelect,
      };
      return { ref: map[type] };
    };
    const ensureAssociateIds = async (type: AssociatedObjectType): Promise<void> => {
      const store = getStoreByType(type).ref;
      if (!currentTagId.value) {
        return;
      }
      if (store.value.length > 0) {
        return;
      }
      try {
        associateIdsLoading.value = true;
        const ids = await getTagAssociateIdsByType(currentTagId.value, type);
        store.value = ids.map((id) => ({ id, type }));
      } finally {
        associateIdsLoading.value = false;
      }
    };
    const openModal = async (tagId?: string, defaultTab?: AssociatedObjectType): Promise<void> => {
      currentTagId.value = tagId;
      modalApi.open();
      activeKey.value = defaultTab || showTabs[0];
      await ensureAssociateIds(activeKey.value);
    };
    expose({
      openModal,
    });

    const handleValueUpdate = (type: AssociatedObjectType, newValues: SelectOption[]): void => {
      if (props.multiple) {
        selectValues[type] = newValues.map((v) => ({ ...v, type }));
      } else {
        // 单选模式：清空其他类型的选择，只保留当前类型的一个选择
        Object.keys(selectValues).forEach((key) => {
          selectValues[key as AssociatedObjectType] = [];
        });
        selectValues[type] = newValues.length > 0 ? [{ ...newValues[0], type }] : [];
      }
    };

    // 移除全量预取，改为按需加载

    const getTagAssociateIdsByType = async (tagId: string, type: AssociatedObjectType): Promise<string[]> => {
      try {
        const resp = await cubeBusinessTagService.getTagAssociateIds({ tagId, refType: type });
        return resp || [];
      } catch {
        return [];
      }
    };

    const modalSlots = {
      default: (): JSX.Element => (
        // 改为可覆盖的容器，加载时显示遮罩阻止交互
        <div style={{ position: "relative", display: "flex", gap: "16px" }}>
          {associateIdsLoading.value && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "rgba(255,255,255,0.6)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 10,
                pointerEvents: "auto",
                fontSize: "14px",
                color: "#666",
              }}
            >
              加载已选数据中...
            </div>
          )}
          {/* 左侧选择区域 */}
          <div style={{ width: "800px", borderRight: "1px solid #f0f0f0", paddingRight: "10px", overflow: "hidden" }}>
            <Tabs
              v-model:activeKey={activeKey.value}
              destroyInactiveTabPane={false}
              onChange={async () => {
                await ensureAssociateIds(activeKey.value);
              }}
            >
              <TabPane
                tab={getAssociatedObjectTypeLabel(AssociatedObjectType.AREA)}
                key={AssociatedObjectType.AREA}
                disabled={!showTabs.includes(AssociatedObjectType.AREA)}
              >
                <AreaTreeSelectTable
                  checkStrictly={false}
                  value={selectValues[AssociatedObjectType.AREA]}
                  multiple={props.multiple}
                  filterParentNode={true}
                  unSelectedData={unAreaSelect.value}
                  onUpdate:value={(v) => {
                    handleValueUpdate(AssociatedObjectType.AREA, v);
                  }}
                />
              </TabPane>
              <TabPane
                tab={getAssociatedObjectTypeLabel(AssociatedObjectType.DEVICE)}
                key={AssociatedObjectType.DEVICE}
                disabled={!showTabs.includes(AssociatedObjectType.DEVICE)}
              >
                <DeviceSelectTable
                  value={selectValues[AssociatedObjectType.DEVICE]}
                  unSelectedData={unDeviceSelect.value}
                  multiple={props.multiple}
                  onUpdate:value={(v) => {
                    handleValueUpdate(AssociatedObjectType.DEVICE, v);
                  }}
                />
              </TabPane>
              <TabPane
                tab={getAssociatedObjectTypeLabel(AssociatedObjectType.PROPERTY)}
                key={AssociatedObjectType.PROPERTY}
                disabled={!showTabs.includes(AssociatedObjectType.PROPERTY)}
              >
                <PropertySelectTable
                  value={selectValues[AssociatedObjectType.PROPERTY]}
                  unSelectedData={unPropertySelect.value}
                  multiple={props.multiple}
                  onUpdate:value={(v) => {
                    handleValueUpdate(AssociatedObjectType.PROPERTY, v);
                  }}
                />
              </TabPane>
              <TabPane
                tab={getAssociatedObjectTypeLabel(AssociatedObjectType.STALL)}
                key={AssociatedObjectType.STALL}
                disabled={!showTabs.includes(AssociatedObjectType.STALL)}
              >
                <StallSelectTable
                  value={selectValues[AssociatedObjectType.STALL]}
                  unSelectedData={unStallSelect.value}
                  multiple={props.multiple}
                  onUpdate:value={(v) => {
                    handleValueUpdate(AssociatedObjectType.STALL, v);
                  }}
                />
              </TabPane>
              <TabPane
                tab={getAssociatedObjectTypeLabel(AssociatedObjectType.SITE_POINT)}
                key={AssociatedObjectType.SITE_POINT}
                disabled={!showTabs.includes(AssociatedObjectType.SITE_POINT)}
              >
                <InspectPointSelectTable
                  value={selectValues[AssociatedObjectType.SITE_POINT]}
                  unSelectedData={unSitePointSelect.value}
                  multiple={props.multiple}
                  onUpdate:value={(v) => {
                    handleValueUpdate(AssociatedObjectType.SITE_POINT, v);
                  }}
                />
              </TabPane>
              <TabPane
                tab={getAssociatedObjectTypeLabel(AssociatedObjectType.PATROL_POINT)}
                key={AssociatedObjectType.PATROL_POINT}
                disabled={!showTabs.includes(AssociatedObjectType.PATROL_POINT)}
              >
                <PatrolPointSelectTable
                  value={selectValues[AssociatedObjectType.PATROL_POINT]}
                  unSelectedData={unPatrolPointSelect.value}
                  multiple={props.multiple}
                  onUpdate:value={(v) => {
                    handleValueUpdate(AssociatedObjectType.PATROL_POINT, v);
                  }}
                />
              </TabPane>
              <TabPane
                tab={getAssociatedObjectTypeLabel(AssociatedObjectType.RISK_SOURCE)}
                key={AssociatedObjectType.RISK_SOURCE}
                disabled={!showTabs.includes(AssociatedObjectType.RISK_SOURCE)}
              >
                <RiskSelectTable
                  value={selectValues[AssociatedObjectType.RISK_SOURCE]}
                  unSelectedData={unRiskSourceSelect.value}
                  multiple={props.multiple}
                  onUpdate:value={(v) => {
                    handleValueUpdate(AssociatedObjectType.RISK_SOURCE, v);
                  }}
                />
              </TabPane>
              <TabPane
                tab={getAssociatedObjectTypeLabel(AssociatedObjectType.SMALL_ENGINEERING)}
                key={AssociatedObjectType.SMALL_ENGINEERING}
                disabled={!showTabs.includes(AssociatedObjectType.SMALL_ENGINEERING)}
              >
                <SmallEngineeringSelectTable
                  value={selectValues[AssociatedObjectType.SMALL_ENGINEERING]}
                  unSelectedData={unSmallEngineeringSelect.value}
                  multiple={props.multiple}
                  onUpdate:value={(v) => {
                    handleValueUpdate(AssociatedObjectType.SMALL_ENGINEERING, v);
                  }}
                />
              </TabPane>
            </Tabs>
          </div>

          {/* 右侧已选列表 */}
          <div style={{ width: "350px", display: "flex", flexDirection: "column" }}>
            <div
              style={{ marginBottom: "10px", marginTop: "10px", display: "flex", justifyContent: "space-between", alignItems: "center" }}
            >
              <h4 style={{ margin: 0 }}>
                已选{getAssociatedObjectTypeLabel(activeKey.value)} ({currentTabSelected.value.length})
              </h4>
              <Space>
                {selectedRowKeys.value.length > 0 && (
                  <Popconfirm title={`确定要移除选中的 ${selectedRowKeys.value.length} 个对象吗？`} onConfirm={batchRemove}>
                    <Button size="small" danger>
                      批量移除 ({selectedRowKeys.value.length})
                    </Button>
                  </Popconfirm>
                )}
                {currentTabSelected.value.length > 0 && (
                  <Popconfirm title={`确定要清空所有已选${getAssociatedObjectTypeLabel(activeKey.value)}吗？`} onConfirm={clearCurrentTab}>
                    <Button size="small">清空</Button>
                  </Popconfirm>
                )}
              </Space>
            </div>

            <div style={{ flex: 1, overflow: "hidden" }}>
              <Table
                columns={selectedColumns}
                dataSource={currentTabSelected.value}
                rowKey="id"
                size="small"
                pagination={false}
                scroll={{ y: "calc(70vh)" }}
                rowSelection={{
                  selectedRowKeys: selectedRowKeys.value,
                  onChange: (keys: Key[]) => {
                    selectedRowKeys.value = keys as string[];
                  },
                }}
                locale={{
                  emptyText: `暂无已选${getAssociatedObjectTypeLabel(activeKey.value)}`,
                }}
              />
            </div>
          </div>
        </div>
      ),
    };
    return (): JSX.Element => <CubeModal v-slots={modalSlots} />;
  },
});
