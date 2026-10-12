import { computed, defineComponent, h, type Component, type PropType, ref, watch } from "vue";

import {
  EquipmentAssociationFiled,
  EquipmentAssociationOperator,
  type DeviceInstancePage,
  type EquipmentAssociationRuleField,
} from "@ghcloud/cube-iot-center-service";
import { Button, Divider, Empty, MinusCircleOutlined, Page, PlusOutlined, PopOver, Select, Space, Tag } from "@ghcloud/cube-ui";

import { cubeDeviceCenterService } from "../../api/service";
import { useCubeModal } from "../../base-components/cube-modal/use-modal";
import { useCubeTable } from "../../base-components/cube-table/use-table";
import { AreaTreeSelect } from "../area-tree-select/area-tree-select";
import { EquipmentSelect } from "../equipment-select/equipment-select";
import { ProductSelect } from "../product-select/product-select";

import "./equipment-association-select-modal.less";

export type EquipmentAssociationSelectedDevice = DeviceInstancePage;

const deviceKey = (device: DeviceInstancePage): string => String(device.id ?? device.code ?? "");

const uniqueDevices = (devices: DeviceInstancePage[]): DeviceInstancePage[] => {
  const seen = new Set<string>();
  return devices.filter((device) => {
    const key = deviceKey(device);
    if (!key || seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
};

const displayText = (text?: string): string => text || "--";

const fieldOptions = [
  { label: "产品", value: EquipmentAssociationFiled.Product },
  { label: "区域", value: EquipmentAssociationFiled.Area },
  { label: "设备", value: EquipmentAssociationFiled.Equipment },
];

const operatorOptions = [
  { label: "包含", value: EquipmentAssociationOperator.In },
  { label: "不包含", value: EquipmentAssociationOperator.NotIn },
];

const ruleItemComponents: Record<EquipmentAssociationFiled, Component> = {
  [EquipmentAssociationFiled.Product]: ProductSelect,
  [EquipmentAssociationFiled.Area]: AreaTreeSelect,
  [EquipmentAssociationFiled.Equipment]: EquipmentSelect,
};

const createRule = (field: EquipmentAssociationFiled): EquipmentAssociationRuleField => ({
  field,
  operator: EquipmentAssociationOperator.In,
  value: [],
});

const cloneRules = (rules: EquipmentAssociationRuleField[][]): EquipmentAssociationRuleField[][] =>
  JSON.parse(JSON.stringify(rules)) as EquipmentAssociationRuleField[][];

const ruleHasValue = (rule: EquipmentAssociationRuleField): boolean => {
  if (!rule.field || !rule.operator) {
    return false;
  }
  const value = rule.value as unknown;
  if (value == null) {
    return false;
  }
  if (typeof value === "string") {
    return value.trim() !== "";
  }
  if (Array.isArray(value)) {
    return value.some((item) => item != null && (typeof item !== "string" || item.trim() !== ""));
  }
  if (typeof value === "object") {
    return Object.keys(value).length > 0;
  }
  return true;
};

const normalizeRules = (rules: EquipmentAssociationRuleField[][]): EquipmentAssociationRuleField[][] =>
  cloneRules(rules)
    .map((group) => group.filter(ruleHasValue))
    .filter((group) => group.length > 0);

export const EquipmentAssociationSelectModal = defineComponent({
  name: "EquipmentAssociationSelectModal",
  props: {
    visible: {
      type: Boolean,
      required: true,
    },
    multiple: {
      type: Boolean,
      default: true,
    },
    selectedDevices: {
      type: Array as PropType<DeviceInstancePage[]>,
      default: () => [],
    },
    title: {
      type: String,
      default: "关联设备",
    },
  },
  emits: ["update:visible", "confirm"],
  setup: (props, { emit }) => {
    const selected = ref<DeviceInstancePage[]>([]);
    const rules = ref<EquipmentAssociationRuleField[][]>([]);
    const defaultRules = ref<EquipmentAssociationRuleField[][]>([]);
    const rulesLoaded = ref(false);
    const pagination = ref({
      pageNumber: 1,
      pageSize: 10,
      total: 0,
    });

    const selectedKeys = computed(() => selected.value.map(deviceKey).filter(Boolean));
    const rulesChanged = computed(() => JSON.stringify(defaultRules.value) !== JSON.stringify(rules.value));

    const [CubeModal, modalApi] = useCubeModal({
      title: props.title,
      width: "980px",
      centered: true,
      closeOnClickModal: false,
      class: "equipment-association-select-modal",
      contentClass: "equipment-association-select-modal__content",
      footerClass: "equipment-association-select-modal__footer",
      cancelText: "取消",
      confirmText: "确认关联",
      onConfirm: () => {
        emit("confirm", [...selected.value]);
        emit("update:visible", false);
        modalApi.close();
      },
      onCancel: () => {
        emit("update:visible", false);
        modalApi.close();
      },
      onClosed: () => {
        emit("update:visible", false);
      },
    });

    const columns = [
      {
        title: "设备编码",
        dataIndex: "code",
        align: "center",
        customRender: ({ text }: { text?: string }): JSX.Element => <PopOver content={displayText(text)}>{displayText(text)}</PopOver>,
      },
      {
        title: "设备名称",
        dataIndex: "name",
        align: "center",
        customRender: ({ text }: { text?: string }): JSX.Element => <PopOver content={displayText(text)}>{displayText(text)}</PopOver>,
      },
      {
        title: "产品品类",
        align: "center",
        customRender: ({ record }: { record: DeviceInstancePage }): JSX.Element => {
          const text = displayText(record.productInfo?.productCategory?.name);
          return <PopOver content={text}>{text}</PopOver>;
        },
      },
      {
        title: "产品名称",
        align: "center",
        customRender: ({ record }: { record: DeviceInstancePage }): JSX.Element => {
          const text = displayText(record.productInfo?.name);
          return <PopOver content={text}>{text}</PopOver>;
        },
      },
      {
        title: "设备品牌",
        align: "center",
        customRender: ({ record }: { record: DeviceInstancePage }): JSX.Element => {
          const text = displayText(record.productInfo?.brandName);
          return <PopOver content={text}>{text}</PopOver>;
        },
      },
      {
        title: "所属区域",
        align: "center",
        customRender: ({ record }: { record: DeviceInstancePage }): JSX.Element => {
          const text = displayText(record.area?.pathName || record.area?.name);
          return <PopOver content={text}>{text}</PopOver>;
        },
      },
    ];

    const [CubeTable, tableApi] = useCubeTable({
      autoFetch: false,
      columns,
      rowKey: (record: DeviceInstancePage) => deviceKey(record),
      rowSelection: props.multiple ? "checkbox" : "radio",
      fetchApi: async () => {
        const queryRules = normalizeRules(rules.value);
        if (!rulesLoaded.value || queryRules.length === 0) {
          return { records: [], total: 0, pages: 0 };
        }
        return cubeDeviceCenterService.getEquipmentAssociationPage({
          pageNumber: pagination.value.pageNumber,
          pageSize: pagination.value.pageSize,
          rules: queryRules,
        });
      },
      fetchLoaded: (data) => {
        pagination.value.total = data.total;
      },
      rowSelectionChange: (keys, rows) => {
        const byKey = new Map(selected.value.map((device) => [deviceKey(device), device]));
        (rows as DeviceInstancePage[]).forEach((device) => {
          const key = deviceKey(device);
          if (key) {
            byKey.set(key, device);
          }
        });
        const nextSelected = keys.map((key) => byKey.get(String(key))).filter((device): device is DeviceInstancePage => device != null);
        selected.value = props.multiple ? uniqueDevices(nextSelected) : nextSelected.slice(0, 1);
        tableApi.setSelectedRowKeys(selected.value.map(deviceKey));
      },
    });

    const loadRules = async (): Promise<void> => {
      const appCode = getCurrentApplicationCode();
      if (!appCode) {
        rules.value = [];
        rulesLoaded.value = true;
        return;
      }
      try {
        const result = await cubeDeviceCenterService.getTagRule(`builtin.app::${appCode}`);
        const tagRules = result.rule.rules.map((item) => item.ruleFields);
        defaultRules.value = cloneRules(tagRules);
        rules.value = cloneRules(tagRules);
      } catch {
        defaultRules.value = [];
        rules.value = [];
      } finally {
        rulesLoaded.value = true;
      }
    };

    const getCurrentApplicationCode = (): string => {
      try {
        const rawStore = sessionStorage.getItem("GH-currentApplication");
        if (!rawStore) {
          return "";
        }
        const store = JSON.parse(rawStore) as { code?: string };
        return store.code ?? "";
      } catch {
        return "";
      }
    };

    const removeSelected = (device: DeviceInstancePage): void => {
      const key = deviceKey(device);
      selected.value = selected.value.filter((item) => deviceKey(item) !== key);
      tableApi.setSelectedRowKeys(selected.value.map(deviceKey));
    };

    const resetSelection = (): void => {
      selected.value = [];
      tableApi.setSelectedRowKeys([]);
    };

    const changePage = (pageNumber: number, pageSize: number): void => {
      pagination.value.pageNumber = pageNumber;
      pagination.value.pageSize = pageSize;
      tableApi.query();
    };

    const queryDevices = (): void => {
      pagination.value.pageNumber = 1;
      tableApi.query();
    };

    const availableFieldOptions = (group: EquipmentAssociationRuleField[], selfValue?: EquipmentAssociationFiled): typeof fieldOptions =>
      fieldOptions.filter((option) => !group.some((rule) => rule.field === option.value) || option.value === selfValue);

    const updateRule = (groupIndex: number, ruleIndex: number, patch: Partial<EquipmentAssociationRuleField>): void => {
      const nextRules = cloneRules(rules.value);
      nextRules[groupIndex][ruleIndex] = {
        ...nextRules[groupIndex][ruleIndex],
        ...patch,
      };
      rules.value = nextRules;
    };

    const removeRule = (groupIndex: number, ruleIndex: number): void => {
      const nextRules = cloneRules(rules.value);
      nextRules[groupIndex].splice(ruleIndex, 1);
      if (nextRules[groupIndex].length === 0) {
        nextRules.splice(groupIndex, 1);
      }
      rules.value = nextRules;
    };

    const addRule = (groupIndex: number): void => {
      const group = rules.value[groupIndex] ?? [];
      const field = fieldOptions.find((option) => !group.some((rule) => rule.field === option.value));
      if (!field) {
        return;
      }
      const nextRules = cloneRules(rules.value);
      nextRules[groupIndex].push(createRule(field.value));
      rules.value = nextRules;
    };

    const addGroup = (): void => {
      rules.value = [...cloneRules(rules.value), [createRule(EquipmentAssociationFiled.Product)]];
    };

    const resetRules = (): void => {
      rules.value = cloneRules(defaultRules.value);
      queryDevices();
    };

    const clearRules = (): void => {
      rules.value = [];
      queryDevices();
    };

    watch(
      () => props.visible,
      (visible) => {
        if (!visible) {
          modalApi.close();
          return;
        }
        selected.value = uniqueDevices(props.selectedDevices);
        tableApi.setSelectedRowKeys(selectedKeys.value);
        pagination.value.pageNumber = 1;
        rulesLoaded.value = false;
        defaultRules.value = [];
        rules.value = [];
        modalApi.setState({ title: props.title });
        modalApi.open();
        void loadRules().then(() => tableApi.query());
      },
    );

    watch(
      () => props.title,
      (title) => {
        modalApi.setState({ title });
      },
    );

    const modalSlots = {
      default: (): JSX.Element => (
        <div class="equipment-association-select-modal__wrap">
          <div class="equipment-association-select-modal__header">
            <Space>
              <Tag color="blue">{props.multiple ? "多选" : "单选"}</Tag>
              <span>已选 {selected.value.length} 台设备</span>
            </Space>
            <Button size="small" disabled={selected.value.length === 0} onClick={resetSelection}>
              清空
            </Button>
          </div>
          <div class="equipment-association-select-modal__filter">
            <div class="equipment-association-select-modal__filter-title">
              <b>筛选条件</b>
              <Space>
                <Button size="small" type="link" onClick={addGroup}>
                  添加条件组
                </Button>
                <Button size="small" disabled={!rulesChanged.value} onClick={resetRules}>
                  恢复默认条件
                </Button>
                <Button size="small" onClick={clearRules}>
                  清空条件
                </Button>
                <Button size="small" type="primary" onClick={queryDevices}>
                  查询
                </Button>
              </Space>
            </div>
            <div class="equipment-association-select-modal__condition-groups">
              {rules.value.length ? (
                rules.value.map((group, groupIndex) => (
                  <div class="equipment-association-select-modal__condition-group" key={groupIndex}>
                    {groupIndex > 0 ? <Divider>或</Divider> : null}
                    {group.map((rule, ruleIndex) => (
                      <div class="equipment-association-select-modal__condition-item" key={`${groupIndex}-${ruleIndex}`}>
                        <MinusCircleOutlined
                          class="equipment-association-select-modal__condition-remove"
                          onClick={() => removeRule(groupIndex, ruleIndex)}
                        />
                        <span class="equipment-association-select-modal__condition-prefix">{ruleIndex === 0 ? "当" : "且"}</span>
                        <Select
                          class="equipment-association-select-modal__condition-field"
                          placeholder="请选择"
                          options={availableFieldOptions(group, rule.field)}
                          value={rule.field}
                          onUpdate:value={(value: EquipmentAssociationFiled) =>
                            updateRule(groupIndex, ruleIndex, { field: value, value: [] })
                          }
                        />
                        <Select
                          class="equipment-association-select-modal__condition-operator"
                          placeholder="请选择"
                          options={operatorOptions}
                          value={rule.operator}
                          onUpdate:value={(value: EquipmentAssociationOperator) => updateRule(groupIndex, ruleIndex, { operator: value })}
                        />
                        {rule.field
                          ? h(ruleItemComponents[rule.field], {
                              class: "equipment-association-select-modal__condition-value",
                              multiple: true,
                              value: Array.isArray(rule.value) ? rule.value : [],
                              "onUpdate:value": (value: string[]) => updateRule(groupIndex, ruleIndex, { value }),
                            })
                          : null}
                      </div>
                    ))}
                    {group.length < fieldOptions.length ? (
                      <Button
                        type="link"
                        size="small"
                        class="equipment-association-select-modal__add-rule"
                        v-slots={{ icon: () => <PlusOutlined /> }}
                        onClick={() => addRule(groupIndex)}
                      >
                        添加规则
                      </Button>
                    ) : null}
                  </div>
                ))
              ) : (
                <Empty description="暂无筛选条件，请添加条件组后查询设备" />
              )}
            </div>
          </div>
          <div class="equipment-association-select-modal__body">
            <CubeTable />
          </div>
          <div class="equipment-association-select-modal__pagination">
            <Page
              current={pagination.value.pageNumber}
              pageSize={pagination.value.pageSize}
              total={pagination.value.total}
              onPageChange={changePage}
            />
          </div>
        </div>
      ),
    };

    return (): JSX.Element => <CubeModal v-slots={modalSlots} />;
  },
});
