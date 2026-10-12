// oxlint-disable complexity
import { useCubeModal } from "../../../base-components/cube-modal/use-modal";
import { TagAreaTreeSelectTable } from "../../business-tag/tag-area-tree-select-tabe/tag-area-tree-select-tabe";
import { TagDeviceSelectTable } from "../../business-tag/tag-device-select-table/tag-device-select-table";
import { TagInspectPointSelectTable } from "../../business-tag/tag-inspect-point-select-table/tag-inspect-point-select-table";
import { TagPatrolPointSelectTable } from "../../business-tag/tag-patrol-point-select-table/tag-patrol-point-select-table";
import { TagPropertySelectTable } from "../../business-tag/tag-property-select-table/tag-property-select-table";
import { TagRiskSelectTable } from "../../business-tag/tag-risk-select-table/tag-risk-select-table";
import { TagSmallEngineeringSelectTable } from "../../business-tag/tag-small-engineering-select-table/tag-small-engineering-select-table";
import { TagStallSelectTable } from "../../business-tag/tag-stall-select-table/tag-stall-select-table";
import { DailyTaskResponsibleObjectSelect, type ResponsibleValidateResult } from "../daily-task-responsible-object-select";
import { ParticipateType } from "../daily-task-responsible-object-select/constant";
import type { ParticipateItem } from "@ghcloud/cube-daily-task-service";
import { PopOver } from "@ghcloud/cube-ui";
import { TabPane, Tabs, Button, Space, Popconfirm, Input, Select, Table, message } from "ant-design-vue";
import type { Key } from "ant-design-vue/es/_util/type";
import { defineComponent, ref, reactive, watch, computed, type ComponentPublicInstance } from "vue";

export enum TargetType {
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
export const getTargetTypeLabel = (type: TargetType): string => {
  const typeLabels = {
    [TargetType.AREA]: "区域",
    [TargetType.DEVICE]: "设备",
    [TargetType.PROPERTY]: "资产",
    [TargetType.STALL]: "档位",
    [TargetType.SITE_POINT]: "现场点",
    [TargetType.PATROL_POINT]: "巡更点",
    [TargetType.RISK_SOURCE]: "风险源",
    [TargetType.SMALL_ENGINEERING]: "小散工程",
  };
  return typeLabels[type] || type;
};

interface SelectOption {
  id: string;
  name: string;
  code: string;
  type: TargetType;
  tagIds: string[];
  tagNames: string;
}

export interface AdvancedPassOption {
  targetId: string;
  targetName: string;
  targetCode: string;
  targetCategory: TargetType;
  tagIds: string[];
  tagNames: string;
}

interface OptionItem {
  id: string;
  name: string;
}

interface ResponsibleConfig {
  type: "USER" | "CONDITION";
  userIds: string[];
  exceptionUserIds: string[];
  deptIds: string[];
  postIds: string[];
  roleIds: string[];
  gridAreaIds: string[];
  userOptions: OptionItem[];
  exceptionUserOptions: OptionItem[];
  deptOptions: OptionItem[];
  postOptions: OptionItem[];
  roleOptions: OptionItem[];
  gridAreaOptions: OptionItem[];
}

export interface AdvancedResultItem extends AdvancedPassOption {
  participateCondition: ParticipateItem;
}

interface Props {
  title: string;
  multiple?: boolean;
  /** 历史已选数据（所有类型），用于禁用再次选择 */
  historySelected?: Record<TargetType, AdvancedPassOption[]>;
  /** 初始已选（用于编辑场景回显，本次弹窗内视为已存在，不可再次选择） */
  value?: Record<TargetType, AdvancedPassOption[]>;
  defaultTab?: TargetType;
  showTabs?: TargetType[];
}

/** 新版：对象选择 + 责任对象配置 两步弹窗组件 */
export const DailyObjectSelectModal = defineComponent({
  props: ["title", "multiple", "historySelected", "value", "defaultTab", "showTabs"],
  emits: ["enter", "cancel"],
  setup(props: Props, { emit, expose }) {
    const showTabs = props.showTabs && props.showTabs.length ? props.showTabs : Object.values(TargetType);
    const defaultTab = props.defaultTab && showTabs.includes(props.defaultTab) ? props.defaultTab : showTabs[0];
    const activeKey = ref<TargetType>(defaultTab);

    /** 历史已选 + 当前弹窗已选合并，用于禁用勾选 */
    const disabledMap = reactive<Record<TargetType, Map<string, boolean>>>({
      [TargetType.AREA]: new Map(),
      [TargetType.DEVICE]: new Map(),
      [TargetType.PROPERTY]: new Map(),
      [TargetType.STALL]: new Map(),
      [TargetType.SITE_POINT]: new Map(),
      [TargetType.PATROL_POINT]: new Map(),
      [TargetType.RISK_SOURCE]: new Map(),
      [TargetType.SMALL_ENGINEERING]: new Map(),
    });

    const mapPassToSelect = (type: TargetType, list?: AdvancedPassOption[]): SelectOption[] =>
      (list || []).map((v) => ({
        id: v.targetId,
        name: v.targetName,
        code: v.targetCode,
        type,
        tagIds: v.tagIds || [],
        tagNames: v.tagNames || "--",
      }));

    const initialSelected = reactive<Record<TargetType, SelectOption[]>>({
      [TargetType.AREA]: mapPassToSelect(TargetType.AREA, props.value?.[TargetType.AREA]),
      [TargetType.DEVICE]: mapPassToSelect(TargetType.DEVICE, props.value?.[TargetType.DEVICE]),
      [TargetType.PROPERTY]: mapPassToSelect(TargetType.PROPERTY, props.value?.[TargetType.PROPERTY]),
      [TargetType.STALL]: mapPassToSelect(TargetType.STALL, props.value?.[TargetType.STALL]),
      [TargetType.SITE_POINT]: mapPassToSelect(TargetType.SITE_POINT, props.value?.[TargetType.SITE_POINT]),
      [TargetType.PATROL_POINT]: mapPassToSelect(TargetType.PATROL_POINT, props.value?.[TargetType.PATROL_POINT]),
      [TargetType.RISK_SOURCE]: mapPassToSelect(TargetType.RISK_SOURCE, props.value?.[TargetType.RISK_SOURCE]),
      [TargetType.SMALL_ENGINEERING]: mapPassToSelect(TargetType.SMALL_ENGINEERING, props.value?.[TargetType.SMALL_ENGINEERING]),
    });

    const historySelected = reactive<Record<TargetType, SelectOption[]>>({
      [TargetType.AREA]: mapPassToSelect(TargetType.AREA, props.historySelected?.[TargetType.AREA]),
      [TargetType.DEVICE]: mapPassToSelect(TargetType.DEVICE, props.historySelected?.[TargetType.DEVICE]),
      [TargetType.PROPERTY]: mapPassToSelect(TargetType.PROPERTY, props.historySelected?.[TargetType.PROPERTY]),
      [TargetType.STALL]: mapPassToSelect(TargetType.STALL, props.historySelected?.[TargetType.STALL]),
      [TargetType.SITE_POINT]: mapPassToSelect(TargetType.SITE_POINT, props.historySelected?.[TargetType.SITE_POINT]),
      [TargetType.PATROL_POINT]: mapPassToSelect(TargetType.PATROL_POINT, props.historySelected?.[TargetType.PATROL_POINT]),
      [TargetType.RISK_SOURCE]: mapPassToSelect(TargetType.RISK_SOURCE, props.historySelected?.[TargetType.RISK_SOURCE]),
      [TargetType.SMALL_ENGINEERING]: mapPassToSelect(TargetType.SMALL_ENGINEERING, props.historySelected?.[TargetType.SMALL_ENGINEERING]),
    });

    const updateDisabledMap = (): void => {
      const allTypes = Object.values(TargetType) as TargetType[];
      allTypes.forEach((type) => {
        const map = disabledMap[type];
        map.clear();
        (historySelected[type] || []).forEach((item) => {
          map.set(item.id, true);
        });
        (initialSelected[type] || []).forEach((item) => {
          map.set(item.id, true);
        });
      });
    };
    updateDisabledMap();

    watch(
      () => props.value,
      (newVal) => {
        (Object.values(TargetType) as TargetType[]).forEach((type) => {
          initialSelected[type] = mapPassToSelect(type, newVal?.[type]);
        });
        updateDisabledMap();
      },
    );

    watch(
      () => props.historySelected,
      (newVal) => {
        (Object.values(TargetType) as TargetType[]).forEach((type) => {
          historySelected[type] = mapPassToSelect(type, newVal?.[type]);
        });
        updateDisabledMap();
      },
    );

    const step = ref<1 | 2>(1);

    const stepOneSelectValues = reactive<Record<TargetType, SelectOption[]>>({
      [TargetType.AREA]: [],
      [TargetType.DEVICE]: [],
      [TargetType.PROPERTY]: [],
      [TargetType.STALL]: [],
      [TargetType.SITE_POINT]: [],
      [TargetType.PATROL_POINT]: [],
      [TargetType.RISK_SOURCE]: [],
      [TargetType.SMALL_ENGINEERING]: [],
    });

    const stepTwoList = ref<SelectOption[]>([]);

    const handleStepOneValueUpdate = (type: TargetType, newValues: SelectOption[]): void => {
      const filtered = newValues.filter((v) => !disabledMap[type].get(v.id));
      if (props.multiple) {
        stepOneSelectValues[type] = filtered.map((v) => ({ ...v, type }));
      } else {
        (Object.keys(stepOneSelectValues) as TargetType[]).forEach((key) => {
          stepOneSelectValues[key] = [];
        });
        stepOneSelectValues[type] = filtered.length > 0 ? [{ ...filtered[0], type }] : [];
      }
    };

    // 构建参与参数
    const buildParticipateParams = (item: ResponsibleConfig): { participateType: string; targetId: string; targetName: string }[] => {
      if (item.type === "USER") {
        return item.userOptions.map((item) => ({ participateType: ParticipateType.USER, targetId: item.id, targetName: item.name }));
      }
      if (item.type === "CONDITION") {
        return [
          ...item.deptOptions.map((item) => ({ participateType: ParticipateType.DEPT, targetId: item.id, targetName: item.name })),
          ...item.postOptions.map((item) => ({ participateType: ParticipateType.POST, targetId: item.id, targetName: item.name })),
          ...item.roleOptions.map((item) => ({ participateType: ParticipateType.ROLE, targetId: item.id, targetName: item.name })),
          ...item.gridAreaOptions.map((item) => ({ participateType: ParticipateType.GRID_AREA, targetId: item.id, targetName: item.name })),
        ];
      }
      return [];
    };

    const [CubeModal, modalApi] = useCubeModal({
      title: `${props.title}`,
      width: "1200px",
      wrapperClass: "object-select-modal-warpper",
      onClosed: () => {
        responsibleConfig.value = {
          type: "USER",
          userIds: [],
          exceptionUserIds: [],
          deptIds: [],
          postIds: [],
          roleIds: [],
          gridAreaIds: [],
          userOptions: [],
          exceptionUserOptions: [],
          deptOptions: [],
          postOptions: [],
          roleOptions: [],
          gridAreaOptions: [],
        };
      },
      onConfirm: async () => {
        if (step.value === 1) {
          const selected: SelectOption[] = [];
          (Object.values(TargetType) as TargetType[]).forEach((type) => {
            selected.push(...(stepOneSelectValues[type] || []));
          });
          if (selected.length === 0) {
            message.error("请选择对象");
            return;
          }
          stepTwoList.value = selected;
          step.value = 2;
          return;
        }

        if (stepTwoList.value.length === 0) {
          message.error("请选择对象");
          step.value = 1;
          return;
        }

        // 验证责任对象配置
        if (responsibleSelectRef.value?.validate) {
          const validateResult = responsibleSelectRef.value.validate();
          if (!validateResult.valid) {
            return;
          }
        }

        const resultTargets: AdvancedResultItem[] = stepTwoList.value.map((item) => ({
          targetId: item.id,
          targetName: item.name,
          targetCode: item.code,
          targetCategory: item.type,
          tagIds: item.tagIds || [],
          tagNames: item.tagNames || "--",
          participateCondition: {
            conditionType: responsibleConfig.value.type,
            participateParams: buildParticipateParams(responsibleConfig.value),
            abnormalUserList: responsibleConfig.value.exceptionUserOptions.map((item) => ({
              participateType: ParticipateType.USER,
              targetId: item.id,
              targetName: item.name,
            })),
          },
        }));

        emit("enter", resultTargets);
        modalApi.close();
      },
    });

    const openModal = (defaultTab?: TargetType): void => {
      activeKey.value = defaultTab || TargetType.AREA;
      step.value = 1;
      (Object.values(TargetType) as TargetType[]).forEach((type) => {
        stepOneSelectValues[type] = [];
      });
      stepTwoList.value = [];
      modalApi.open();
    };

    expose({
      openModal,
    });

    const responsibleConfig = ref<ResponsibleConfig>({
      type: "USER",
      userIds: [],
      exceptionUserIds: [],
      deptIds: [],
      postIds: [],
      roleIds: [],
      gridAreaIds: [],
      userOptions: [],
      exceptionUserOptions: [],
      deptOptions: [],
      postOptions: [],
      roleOptions: [],
      gridAreaOptions: [],
    });

    // 责任对象选择组件 ref
    type ResponsibleSelectInstance = ComponentPublicInstance & { validate: () => ResponsibleValidateResult };
    const responsibleSelectRef = ref<ResponsibleSelectInstance>();

    const filter = reactive<{
      name: string;
      tagIds: string[];
      type?: TargetType;
    }>({
      name: "",
      tagIds: [],
      type: undefined,
    });

    const filteredStepTwoList = computed(() =>
      (stepTwoList.value || []).filter((item) => {
        const matchName = !filter.name || item.name.toLowerCase().includes(filter.name.toLowerCase());
        const matchType = !filter.type || item.type === filter.type;
        const matchTag = !filter.tagIds.length || filter.tagIds.some((tagId) => (item.tagIds || []).includes(tagId));
        return matchName && matchType && matchTag;
      }),
    );

    const selectedRowKeysStep2 = ref<Key[]>([]);

    const stepTwoColumns = [
      {
        title: "对象名称",
        dataIndex: "name",
        key: "name",
        ellipsis: true,
      },
      {
        title: "对象类型",
        dataIndex: "type",
        key: "type",
        ellipsis: true,
        customRender: ({ text }: { text: TargetType }): JSX.Element => {
          const label = getTargetTypeLabel(text);
          return <PopOver content={label || ""}>{label || "--"}</PopOver>;
        },
      },
      {
        title: "操作",
        key: "action",
        width: 80,
        customRender: ({ record }: { record: SelectOption }): JSX.Element => (
          <Popconfirm
            title="确定要移除该项吗？"
            onConfirm={() => {
              // 从第二步列表中移除
              stepTwoList.value = stepTwoList.value.filter((item) => item.id !== record.id);
              selectedRowKeysStep2.value = selectedRowKeysStep2.value.filter((k) => k !== record.id);
              // 同步更新第一步的选中状态
              stepOneSelectValues[record.type] = stepOneSelectValues[record.type].filter((item) => item.id !== record.id);
            }}
          >
            <Button type="link" danger size="small">
              移除
            </Button>
          </Popconfirm>
        ),
      },
    ];

    const batchRemoveStep2 = (): void => {
      if (!selectedRowKeysStep2.value.length) {
        return;
      }
      // 获取要移除的项
      const removeIds = new Set(selectedRowKeysStep2.value);
      const removeItems = stepTwoList.value.filter((item) => removeIds.has(item.id));
      // 从第二步列表中移除
      stepTwoList.value = stepTwoList.value.filter((item) => !removeIds.has(item.id));
      selectedRowKeysStep2.value = [];
      // 同步更新第一步的选中状态
      removeItems.forEach((item) => {
        stepOneSelectValues[item.type] = stepOneSelectValues[item.type].filter((v) => v.id !== item.id);
      });
    };

    const clearAllStep2 = (): void => {
      // 同步清空第一步的所有选中状态
      (Object.keys(stepOneSelectValues) as TargetType[]).forEach((type) => {
        stepOneSelectValues[type] = [];
      });
      stepTwoList.value = [];
      selectedRowKeysStep2.value = [];
    };

    const getDisabledList = (type: TargetType): SelectOption[] => [...(historySelected[type] || []), ...(initialSelected[type] || [])];

    type TagSelectTableComponent =
      | typeof TagAreaTreeSelectTable
      | typeof TagDeviceSelectTable
      | typeof TagPropertySelectTable
      | typeof TagStallSelectTable
      | typeof TagInspectPointSelectTable
      | typeof TagPatrolPointSelectTable
      | typeof TagRiskSelectTable
      | typeof TagSmallEngineeringSelectTable;

    const targetTypeComponentMap: Record<TargetType, TagSelectTableComponent> = {
      [TargetType.AREA]: TagAreaTreeSelectTable,
      [TargetType.DEVICE]: TagDeviceSelectTable,
      [TargetType.PROPERTY]: TagPropertySelectTable,
      [TargetType.STALL]: TagStallSelectTable,
      [TargetType.SITE_POINT]: TagInspectPointSelectTable,
      [TargetType.PATROL_POINT]: TagPatrolPointSelectTable,
      [TargetType.RISK_SOURCE]: TagRiskSelectTable,
      [TargetType.SMALL_ENGINEERING]: TagSmallEngineeringSelectTable,
    };

    const tabConfigs = showTabs.map((type) => ({
      type,
      label: getTargetTypeLabel(type),
      component: targetTypeComponentMap[type],
    }));

    const stepOneSlots = {
      default: (): JSX.Element => (
        <div style={{ display: "flex" }}>
          <div style={{ width: "100%", paddingRight: "10px", overflow: "hidden" }}>
            <Tabs v-model:activeKey={activeKey.value} destroyInactiveTabPane={false}>
              {tabConfigs.map(({ type, label, component: Comp }) => (
                <TabPane key={type} tab={label}>
                  <Comp
                    value={stepOneSelectValues[type]}
                    multiple={props.multiple}
                    unSelectedData={getDisabledList(type)}
                    onUpdate:value={(v: SelectOption[]) => handleStepOneValueUpdate(type, v)}
                  />
                </TabPane>
              ))}
            </Tabs>
          </div>
        </div>
      ),
    };

    const stepTwoSlots = {
      default: (): JSX.Element => (
        <div style={{ display: "flex", height: "100%", minHeight: "500px" }}>
          <div style={{ width: "55%", display: "flex", flexDirection: "column", paddingRight: "16px" }}>
            <div style={{ marginBottom: "8px", display: "flex", gap: "8px" }}>
              <Input
                allowClear
                placeholder="按名称筛选"
                v-model:value={filter.name}
                style={{ width: showTabs.length === 1 ? "50%" : "34%" }}
              />
              {showTabs.length > 1 && (
                <Select
                  allowClear
                  placeholder="按对象类型筛选"
                  v-model:value={filter.type}
                  style={{ width: "32%" }}
                  options={showTabs.map((t) => ({
                    label: getTargetTypeLabel(t),
                    value: t,
                  }))}
                />
              )}
            </div>

            <div style={{ marginBottom: "8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h4 style={{ margin: 0 }}>已选对象 ({filteredStepTwoList.value.length})</h4>
              <Space>
                {selectedRowKeysStep2.value.length > 0 && (
                  <Popconfirm title={`确定要移除选中的 ${selectedRowKeysStep2.value.length} 个对象吗？`} onConfirm={batchRemoveStep2}>
                    <Button size="small" danger>
                      批量移除 ({selectedRowKeysStep2.value.length})
                    </Button>
                  </Popconfirm>
                )}
                {filteredStepTwoList.value.length > 0 && (
                  <Popconfirm title="确定要清空所有已选对象吗？" onConfirm={clearAllStep2}>
                    <Button size="small">全部清空</Button>
                  </Popconfirm>
                )}
              </Space>
            </div>

            <div style={{ flex: 1, overflow: "hidden" }}>
              <Table
                columns={stepTwoColumns}
                dataSource={filteredStepTwoList.value}
                rowKey="id"
                size="small"
                pagination={false}
                scroll={{ y: "calc(70vh)" }}
                rowSelection={{
                  selectedRowKeys: selectedRowKeysStep2.value,
                  onChange: (keys: Key[]) => {
                    selectedRowKeysStep2.value = keys;
                  },
                }}
                locale={{
                  emptyText: "暂无已选对象",
                }}
              />
            </div>
          </div>

          <div
            style={{
              width: "1px",
              backgroundColor: "#f0f0f0",
              margin: "0 16px",
              alignSelf: "stretch",
            }}
          />

          <div style={{ flex: 1, display: "flex", alignItems: "top", minWidth: 0 }}>
            <div style={{ width: "100%" }}>
              <DailyTaskResponsibleObjectSelect
                ref={responsibleSelectRef}
                type={responsibleConfig.value.type}
                userIds={responsibleConfig.value.userIds}
                exceptionUserIds={responsibleConfig.value.exceptionUserIds}
                deptIds={responsibleConfig.value.deptIds}
                postIds={responsibleConfig.value.postIds}
                roleIds={responsibleConfig.value.roleIds}
                gridAreaIds={responsibleConfig.value.gridAreaIds}
                userOptions={responsibleConfig.value.userOptions}
                exceptionUserOptions={responsibleConfig.value.exceptionUserOptions}
                deptOptions={responsibleConfig.value.deptOptions}
                postOptions={responsibleConfig.value.postOptions}
                roleOptions={responsibleConfig.value.roleOptions}
                gridAreaOptions={responsibleConfig.value.gridAreaOptions}
                onUpdate:type={(v: "USER" | "CONDITION") => {
                  responsibleConfig.value.type = v;
                }}
                onUpdate:userIds={(v: string[]) => {
                  responsibleConfig.value.userIds = v;
                }}
                onUpdate:exceptionUserIds={(v: string[]) => {
                  responsibleConfig.value.exceptionUserIds = v;
                }}
                onUpdate:deptIds={(v: string[]) => {
                  responsibleConfig.value.deptIds = v;
                }}
                onUpdate:postIds={(v: string[]) => {
                  responsibleConfig.value.postIds = v;
                }}
                onUpdate:roleIds={(v: string[]) => {
                  responsibleConfig.value.roleIds = v;
                }}
                onUpdate:gridAreaIds={(v: string[]) => {
                  responsibleConfig.value.gridAreaIds = v;
                }}
                onUpdate:userOptions={(v: OptionItem[]) => {
                  responsibleConfig.value.userOptions = v;
                }}
                onUpdate:exceptionUserOptions={(v: OptionItem[]) => {
                  responsibleConfig.value.exceptionUserOptions = v;
                }}
                onUpdate:deptOptions={(v: OptionItem[]) => {
                  responsibleConfig.value.deptOptions = v;
                }}
                onUpdate:postOptions={(v: OptionItem[]) => {
                  responsibleConfig.value.postOptions = v;
                }}
                onUpdate:roleOptions={(v: OptionItem[]) => {
                  responsibleConfig.value.roleOptions = v;
                }}
                onUpdate:gridAreaOptions={(v: OptionItem[]) => {
                  responsibleConfig.value.gridAreaOptions = v;
                }}
              />
            </div>
          </div>
        </div>
      ),
    };

    const modalSlots = {
      default: (): JSX.Element => (
        <div>
          {/* 步骤1：对象选择 */}
          <div v-show={step.value === 1}>{stepOneSlots.default()}</div>
          {/* 步骤2：责任对象配置 */}
          <div v-show={step.value === 2}>{stepTwoSlots.default()}</div>
        </div>
      ),
    };

    return (): JSX.Element => <CubeModal v-slots={modalSlots} />;
  },
});
