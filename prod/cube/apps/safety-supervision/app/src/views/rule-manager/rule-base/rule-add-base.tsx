import { Cascader, Input, message, Popconfirm, Select, Spin, Table, type FormInstance } from "ant-design-vue";
import type { ChangeEvent } from "ant-design-vue/es/_util/EventInterface";
import type { DefaultOptionType } from "ant-design-vue/es/select";
import { defineComponent, ref, reactive, computed, onMounted, watch } from "vue";

import type { addRuleLibraries } from "@ghcloud/cube-safety-management-service";
import type { Libraries } from "@ghcloud/cube-safety-management-service";
import { Button, Form, FormItem, Modal, Switch, Textarea } from "@ghcloud/cube-ui";
import { Layout } from "@ghcloud/generic-component";

import type { MetricOption, TableData } from "./rule-base";
import { cubeSafetyManagementAnalysisService } from "@/api/server";

import styles from "./rule-base.module.less";
interface ConditionItem {
  key: number;
  min: string;
  max: string;
  score: string;
  error: boolean;
}

interface Props {
  viewTitle: string;
  selectOption: MetricOption[];
  selectLoading?: boolean;
  displayMetricOptions?: MetricOption[];
  addKay: string;
  viewReportData: TableData;
}
// 定义表单数据的接口
interface QuotaFormState {
  id?: string;
  ruleName: string;
  rule: string;
  ruleContentTemplateEnabled: boolean;
  displayMetricsEnabled: boolean;
  displayMetrics: DisplayMetricsConfig;
  weight: number | null;
  formula: string | null;
}
interface DisplayMetricsConfig {
  displayType?: "chart" | "text";
  metricId?: string;
  metricName?: string;
  dataPath?: string;
  dataName?: string;
  chartType?: string;
  groupDimension?: string;
  groupDimensionName?: string;
  groupValue?: string;
  groupValueName?: string;
  sort?: string;
  topN?: number | null;
  textMetrics?: TextMetricConfig[];
}
interface TextMetricConfig {
  metricId: string;
  metricName: string;
  displayName?: string;
  valuePath?: string[];
  valueName?: string;
  displayItems?: TextMetricDisplayItem[];
}
interface TextMetricDisplayItem {
  key: number;
  displayName: string;
  valuePath: string[];
  valueName: string;
  unit?: string;
}
interface JsonSchemaNode {
  type?: string | string[];
  description?: string;
  properties?: Record<string, JsonSchemaNode>;
  items?: JsonSchemaNode;
}
interface ValuePathOption {
  label: string;
  value: string;
  children?: ValuePathOption[];
  disabled?: boolean;
}
interface SchemaContextOption {
  label: string;
  value: string;
  properties: Record<string, JsonSchemaNode>;
}
const primitiveSchemaTypes = ["string", "number", "integer", "boolean"];
const defaultConditions: ConditionItem[] = [
  { key: 1, min: "60", max: "", score: "1", error: false },
  { key: 2, min: "", max: "60", score: "0", error: false },
  // { key: 3, min: '70', max: '80', score: '0.5', error: false },
  // { key: 4, min: '60', max: '70', score: '0.25', error: false },
  // { key: 5, min: '', max: '60', score: '0', error: false },
];
export const RuleAddBase = defineComponent({
  emits: ["cancel", "submit"],
  props: ["viewTitle", "selectOption", "selectLoading", "displayMetricOptions", "addKay", "viewReportData"],
  setup: (props: Props, { emit }) => {
    const formState = reactive<QuotaFormState>({
      ruleName: "",
      rule: "",
      ruleContentTemplateEnabled: true,
      displayMetricsEnabled: false,
      displayMetrics: {
        displayType: "chart",
        metricId: "",
        metricName: "",
        dataPath: "",
        dataName: "",
        chartType: "",
        groupDimension: "",
        groupDimensionName: "",
        groupValue: "",
        groupValueName: "",
        sort: "",
        topN: null,
        textMetrics: [],
      },
      weight: null,
      formula: null,
    });
    const buttonLoading = ref(false);
    const cursorPosition = ref(0);
    const rules = {
      ruleName: [{ required: true, message: "请输入指标名称", trigger: "blur" }],
      rule: [
        {
          trigger: "blur",
          validator: async () => {
            if (formState.ruleContentTemplateEnabled && !formState.rule) {
              return Promise.reject(new Error("请输入规则内容"));
            }
            return Promise.resolve();
          },
        },
      ],
      weight: [{ required: true, message: "请输入计算权重", trigger: "blur" }],
      formula: [{ required: true, message: "请选择规则计算接口", trigger: "blur" }],
    };
    const conditions = ref<ConditionItem[]>(defaultConditions);
    const formRef = ref<FormInstance>();
    const modalVisible = ref<boolean>(false);
    const metricOptionCache = ref<MetricOption[]>([]);
    const displayMetricOptions = ref<MetricOption[]>(props.displayMetricOptions ?? []);
    const displayMetricLoading = ref(false);
    const handleAdd = (): void => {
      const newKey = Date.now();
      const lastIndex = conditions.value.length - 1;
      let max = "";
      if (conditions.value.length === 2) {
        max = conditions.value[0].min;
      } else {
        max = conditions.value[lastIndex - 1].min;
      }
      conditions.value[lastIndex].max = String(Number(max) > 10 ? Number(max) - 10 : 0);
      const newItem: ConditionItem = {
        key: newKey,
        min: String(Number(max) > 10 ? Number(max) - 10 : 0),
        max,
        score: "0",
        error: false,
      };

      conditions.value.splice(lastIndex, 0, newItem);
      detectionError();
    };

    const textAreHandleChange = (value: string): void => {
      formState.rule = value;
    };
    const handleDelete = (key: number): void => {
      conditions.value = conditions.value.filter((item) => item.key !== key);
      // 更新相邻区间的逻辑
      for (let i = 0; i < conditions.value.length - 1; i++) {
        conditions.value[i + 1].max = conditions.value[i].min;
      }
      detectionError();
    };
    const onMinValueChange = (value: string): void => {
      conditions.value[0].min = value;
      conditions.value[1].max = value;
      detectionError();
    };
    const onMaxValueChange = (value: string, index: number): void => {
      conditions.value[index].max = value;

      conditions.value[index - 1].min = value ?? 0;

      detectionError();
    };
    const onScoreValueChange = (value: string, index: number): void => {
      conditions.value[index].score = value;
    };
    const detectionError = (): void => {
      const newConditions = conditions.value.map((item: ConditionItem) => ({
        ...item,
        error: false,
      }));
      newConditions.map((item: ConditionItem, key: number) => {
        if (key === 0) {
          return;
        }
        if (key === conditions.value.length - 1) {
          return;
        }
        if (Number(item.max) > Number(conditions.value[key - 1].min)) {
          item.error = true;
        }
        if (Number(item.max) < Number(conditions.value[key + 1].max)) {
          item.error = true;
        }
        if (Number(item.max) <= Number(item.min)) {
          item.error = true;
        }
      });
      conditions.value = newConditions;
    };
    /**
     * @description: 检测区间是否存在空隙
     */
    const detectionClick = (): boolean => {
      const errItem = conditions.value.filter((value) => value.error);
      if (errItem.length) {
        message.error("保存失败，请检查取分条件");
        return false;
      }
      const min = Number(conditions.value[conditions.value.length - 1].max);
      const max = Number(conditions.value[0].min);
      const newConditions = [...conditions.value].splice(1, conditions.value.length - 2);
      if (!newConditions.length && min === max) {
        return true;
      }
      if (min === max) {
        message.error("保存失败，请检查取分条件");
        return false;
      }
      let needList: number[] = [];
      for (let i = min; i <= max; i++) {
        needList.push(i);
      }
      newConditions.map((item) => {
        const existList: number[] = [];
        for (let i = Number(item.min); i <= Number(item.max); i++) {
          existList.push(Number(i));
        }
        needList = needList.filter((item) => !existList.includes(item));
      });
      if (!needList.length) {
        return true;
      }
      message.error(`值【${needList.join(",")}】未被覆盖`);
      return false;
    };
    const addRule = (): void => {
      inputValue.value = "";
      modalVisible.value = true;
    };
    const columns = [
      {
        title: "最小值",
        dataIndex: "min",
        customRender: ({ record, index }: { record: ConditionItem; index: number }): JSX.Element => (
          <>
            {index === conditions.value.length - 1 ? (
              <div></div>
            ) : (
              <Input
                value={record.min ?? ""}
                type="number"
                disabled={index > 0}
                onChange={(val: { target: { value: any } }) => onMinValueChange(val.target.value ?? "")}
                style={{ width: "100%" }}
              />
            )}
          </>
        ),
      },
      {
        title: "最大值",
        dataIndex: "max",
        customRender: ({ record, index }: { record: ConditionItem; index: number }): JSX.Element => (
          <>
            {index === 0 ? (
              <div></div>
            ) : (
              <Input
                value={record.max ?? ""}
                type="number"
                onChange={(val: { target: { value: any } }) => onMaxValueChange(val.target.value ?? "", index)}
                style={{ width: "100%", borderColor: conditions.value[index].error ? "red" : "" }}
                class={conditions.value[index].error ? styles["input-max-value"] : ""}
              />
            )}
          </>
        ),
      },
      {
        title: "得分系数",
        dataIndex: "score",
        customRender: ({ record, index }: { record: ConditionItem; index: number }): JSX.Element => (
          <Input
            value={record.score ?? ""}
            type="number"
            onChange={(val: { target: { value: any } }) => onScoreValueChange(val.target.value ?? "", index)}
            style={{ width: "100%" }}
          />
        ),
      },
      {
        title: "操作",
        dataIndex: "action",
        customRender: ({ record, index }: { record: ConditionItem; index: number }): JSX.Element => {
          if (index === 0 || index === conditions.value.length - 1) {
            return <div></div>;
          }
          return (
            <Popconfirm title="确定删除吗?" onConfirm={() => handleDelete(record.key)}>
              <Button type="link" danger>
                删除
              </Button>
            </Popconfirm>
          );
        },
      },
    ];
    const chartTypeOptions = [
      { label: "横向柱状图", value: "horizontalBar" },
      { label: "纵向柱状图", value: "verticalBar" },
      { label: "折线图", value: "line" },
      { label: "饼图", value: "pie" },
    ];
    const sortOptions = [
      { label: "从高到低", value: "desc" },
      { label: "从低到高", value: "asc" },
    ];
    const displayTypeOptions = [
      { label: "图形展示", value: "chart" },
      { label: "文本展示", value: "text" },
    ];
    const hasSchemaType = (node: JsonSchemaNode | undefined, expectedTypes: string[]): boolean => {
      const type = node?.type;
      if (!type) {
        return false;
      }
      return Array.isArray(type) ? type.some((item) => expectedTypes.includes(item)) : expectedTypes.includes(type);
    };
    const parseMetricSchema = (schema?: string): JsonSchemaNode | undefined => {
      if (!schema) {
        return undefined;
      }
      try {
        return JSON.parse(schema) as JsonSchemaNode;
      } catch {
        return undefined;
      }
    };
    const isPrimitiveSchema = (node?: JsonSchemaNode): boolean => (node ? hasSchemaType(node, primitiveSchemaTypes) : false);
    const isDirectSchema = (node?: JsonSchemaNode): boolean =>
      isPrimitiveSchema(node) || (hasSchemaType(node, ["array"]) && isPrimitiveSchema(node?.items));
    const isArrayMetricOption = (option: MetricOption): boolean => {
      const schema = parseMetricSchema(option.resultJsonSchema);
      return hasSchemaType(schema, ["array"]) && !!schema?.items?.properties;
    };
    const getSchemaProperties = (node?: JsonSchemaNode): Record<string, JsonSchemaNode> => {
      if (!node) {
        return {};
      }
      if (hasSchemaType(node, ["array"])) {
        return node.items?.properties ?? {};
      }
      return node.properties ?? {};
    };
    const getMetricSchema = (metricId: string): JsonSchemaNode | undefined => {
      const metric =
        displayMetricOptions.value.find((item) => item.value === metricId) ??
        metricOptionCache.value.find((item) => item.value === metricId);
      if (!metric?.resultJsonSchema) {
        return undefined;
      }
      return parseMetricSchema(metric.resultJsonSchema);
    };
    const isDirectTextMetric = (metricId: string): boolean => isDirectSchema(getMetricSchema(metricId));
    const buildValuePathOptions = (properties: Record<string, JsonSchemaNode>): ValuePathOption[] =>
      Object.entries(properties).flatMap(([key, value]) => {
        const label = value.description || key;
        if (isPrimitiveSchema(value)) {
          return [{ label, value: key }];
        }
        const children = buildValuePathOptions(getSchemaProperties(value));
        if (children.length === 0) {
          return [];
        }
        return [{ label, value: key, children, disabled: true }];
      });
    const getTextValueOptions = (metricId: string): ValuePathOption[] =>
      buildValuePathOptions(getSchemaProperties(getMetricSchema(metricId)));
    const findValuePathOption = (options: ValuePathOption[], path: string[]): ValuePathOption | undefined => {
      const [current, ...rest] = path;
      const option = options.find((item) => item.value === current);
      if (!option) {
        return undefined;
      }
      if (rest.length === 0) {
        return option;
      }
      return findValuePathOption(option.children ?? [], rest);
    };
    const toFieldOptions = (properties: Record<string, JsonSchemaNode>, expectedTypes: string[]): { label: string; value: string }[] =>
      Object.entries(properties)
        .filter(([, value]) => hasSchemaType(value, expectedTypes))
        .map(([key, value]) => ({
          label: value.description || key,
          value: key,
        }));
    const parseResultJsonSchema = (schema?: string): SchemaContextOption[] => {
      if (!schema) {
        return [];
      }
      try {
        const json = JSON.parse(schema) as JsonSchemaNode;
        if (hasSchemaType(json, ["array"]) && json.items?.properties) {
          return [
            {
              label: json.description || "默认数据",
              value: "",
              properties: json.items.properties,
            },
          ];
        }
        const contexts: SchemaContextOption[] = [];
        const rootProperties = json.properties ?? {};
        if (toFieldOptions(rootProperties, ["string"]).length && toFieldOptions(rootProperties, ["integer", "number"]).length) {
          contexts.push({
            label: json.description || "默认数据",
            value: "",
            properties: rootProperties,
          });
        }
        Object.entries(rootProperties).forEach(([key, value]) => {
          if (hasSchemaType(value, ["array"]) && value.items?.properties) {
            contexts.push({
              label: value.description || key,
              value: key,
              properties: value.items.properties,
            });
          }
        });
        return contexts;
      } catch {
        return [];
      }
    };
    const selectedDisplayMetric = computed(() =>
      displayMetricOptions.value.find((item) => item.value === formState.displayMetrics.metricId),
    );
    const chartDisplayMetricOptions = computed(() => displayMetricOptions.value.filter(isArrayMetricOption));
    const schemaContextOptions = computed(() => parseResultJsonSchema(selectedDisplayMetric.value?.resultJsonSchema));
    const selectedSchemaContext = computed(() => {
      if (!schemaContextOptions.value.length) {
        return "";
      }
      return (
        schemaContextOptions.value.find((item) => item.value === (formState.displayMetrics.dataPath ?? "")) ??
        (schemaContextOptions.value.length === 1 ? schemaContextOptions.value[0] : "")
      );
    });
    const groupDimensionOptions = computed(() =>
      selectedSchemaContext.value ? toFieldOptions(selectedSchemaContext.value.properties, ["string"]) : [],
    );
    const groupValueOptions = computed(() =>
      selectedSchemaContext.value ? toFieldOptions(selectedSchemaContext.value.properties, ["integer", "number"]) : [],
    );
    const isDisplayMetric = (item: Libraries): boolean => {
      if (typeof item.displayEnabled === "boolean") {
        return item.displayEnabled;
      }
      if (typeof item.usedForDisplay === "boolean") {
        return item.usedForDisplay;
      }
      if (typeof item.forDisplay === "boolean") {
        return item.forDisplay;
      }
      if (typeof item.display === "boolean") {
        return item.display;
      }
      if (typeof item.display === "number") {
        return item.display === 1;
      }
      if (typeof item.metricUsage === "string") {
        return item.metricUsage === "DISPLAY";
      }
      return true;
    };
    const toMetricOption = (item: Libraries): MetricOption => ({
      value: item.id,
      label: item.name,
      computeType: item.computeType,
      resultJsonSchema: item.resultJsonSchema,
    });
    const mergeDisplayMetricOptions = (options: MetricOption[]): void => {
      const optionMap = new Map(displayMetricOptions.value.map((item) => [item.value, item]));
      options.forEach((item) => optionMap.set(item.value, item));
      displayMetricOptions.value = Array.from(optionMap.values());
    };
    const mergeMetricOptionCache = (options: MetricOption[]): void => {
      const optionMap = new Map(metricOptionCache.value.map((item) => [item.value, item]));
      options.forEach((item) => optionMap.set(item.value, item));
      metricOptionCache.value = [...optionMap.values()];
    };
    const getSavedDisplayMetricOptions = (): MetricOption[] => {
      const { displayMetrics } = formState;
      const savedItems =
        displayMetrics.displayType === "text"
          ? (displayMetrics.textMetrics ?? []).map((item) => ({ id: item.metricId, name: item.metricName }))
          : displayMetrics.metricId
            ? [{ id: displayMetrics.metricId, name: displayMetrics.metricName ?? "" }]
            : [];
      return savedItems.map((item) => {
        const metric =
          displayMetricOptions.value.find((option) => option.value === item.id) ??
          metricOptionCache.value.find((option) => option.value === item.id);
        if (metric) {
          return metric;
        }
        return {
          value: item.id,
          label: item.name || item.id,
          computeType: "",
          resultJsonSchema: undefined,
        };
      });
    };
    const getDisplayMetricOptions = async (): Promise<void> => {
      if (displayMetricLoading.value) {
        return;
      }
      displayMetricLoading.value = true;
      try {
        const res = await cubeSafetyManagementAnalysisService.getLibrariesAllList();
        displayMetricOptions.value = res.filter(isDisplayMetric).map(toMetricOption);
      } catch {
        message.error("获取展示指标失败");
      } finally {
        displayMetricLoading.value = false;
      }
    };
    const handleDisplayMetricChange = (value: string): void => {
      const metric = displayMetricOptions.value.find((item) => item.value === value);
      const contexts = parseResultJsonSchema(metric?.resultJsonSchema);
      formState.displayMetrics.metricId = value;
      formState.displayMetrics.metricName = metric?.label ?? "";
      formState.displayMetrics.dataPath = contexts.length === 1 ? contexts[0].value : "";
      formState.displayMetrics.dataName = contexts.length === 1 ? contexts[0].label : "";
      formState.displayMetrics.groupDimension = "";
      formState.displayMetrics.groupDimensionName = "";
      formState.displayMetrics.groupValue = "";
      formState.displayMetrics.groupValueName = "";
    };
    const handleDataPathChange = (value: string, option: DefaultOptionType): void => {
      formState.displayMetrics.dataPath = value;
      formState.displayMetrics.dataName = String(option.label ?? value);
      formState.displayMetrics.groupDimension = "";
      formState.displayMetrics.groupDimensionName = "";
      formState.displayMetrics.groupValue = "";
      formState.displayMetrics.groupValueName = "";
    };
    const handleGroupDimensionChange = (value: string, option: DefaultOptionType): void => {
      formState.displayMetrics.groupDimension = value;
      formState.displayMetrics.groupDimensionName = String(option.label ?? value);
    };
    const handleGroupValueChange = (value: string, option: DefaultOptionType): void => {
      formState.displayMetrics.groupValue = value;
      formState.displayMetrics.groupValueName = String(option.label ?? value);
    };
    const createTextMetricDisplayItem = (): TextMetricDisplayItem => ({
      key: Date.now() + Math.floor(Math.random() * 1000),
      displayName: "",
      valuePath: [],
      valueName: "",
      unit: "",
    });
    const normalizeTextMetricDisplayItems = (item: TextMetricConfig): TextMetricDisplayItem[] => {
      if (item.displayItems && item.displayItems.length > 0) {
        return item.displayItems;
      }
      if (item.displayName || item.valuePath?.length || item.valueName) {
        return [
          {
            key: Date.now() + Math.floor(Math.random() * 1000),
            displayName: item.displayName ?? "",
            valuePath: item.valuePath ?? [],
            valueName: item.valueName ?? "",
            unit: "",
          },
        ];
      }
      return [createTextMetricDisplayItem()];
    };
    const syncTextMetrics = (metricIds: string[]): void => {
      const selectedMetrics = metricIds.map((metricId) => {
        const existing = formState.displayMetrics.textMetrics?.find((item) => item.metricId === metricId);
        if (existing) {
          existing.displayItems = normalizeTextMetricDisplayItems(existing);
          return existing;
        }
        const metric =
          displayMetricOptions.value.find((item) => item.value === metricId) ??
          metricOptionCache.value.find((item) => item.value === metricId);
        return {
          metricId,
          metricName: metric?.label ?? "",
          displayItems: [createTextMetricDisplayItem()],
        };
      });
      formState.displayMetrics.textMetrics = selectedMetrics;
    };
    const getTextMetricDisplayItems = (item: TextMetricConfig): TextMetricDisplayItem[] => {
      item.displayItems = normalizeTextMetricDisplayItems(item);
      return item.displayItems;
    };
    const addTextMetricDisplayItem = (metricId: string): void => {
      const item = formState.displayMetrics.textMetrics?.find((metric) => metric.metricId === metricId);
      if (item) {
        item.displayItems = [...getTextMetricDisplayItems(item), createTextMetricDisplayItem()];
      }
    };
    const removeTextMetricDisplayItem = (metricId: string, key: number): void => {
      const item = formState.displayMetrics.textMetrics?.find((metric) => metric.metricId === metricId);
      if (!item) {
        return;
      }
      const nextItems = getTextMetricDisplayItems(item).filter((displayItem) => displayItem.key !== key);
      item.displayItems = nextItems.length > 0 ? nextItems : [createTextMetricDisplayItem()];
    };
    const handleTextMetricDisplayNameChange = (metricId: string, key: number, value: string): void => {
      const item = formState.displayMetrics.textMetrics?.find((metric) => metric.metricId === metricId);
      if (item) {
        const displayItem = getTextMetricDisplayItems(item).find((valueItem) => valueItem.key === key);
        if (displayItem) {
          displayItem.displayName = value;
        }
      }
    };
    const handleTextMetricValuePathChange = (metricId: string, key: number, path: string[]): void => {
      const item = formState.displayMetrics.textMetrics?.find((metric) => metric.metricId === metricId);
      if (!item) {
        return;
      }
      const option = findValuePathOption(getTextValueOptions(metricId), path);
      const displayItem = getTextMetricDisplayItems(item).find((valueItem) => valueItem.key === key);
      if (displayItem) {
        displayItem.valuePath = path;
        displayItem.valueName = option?.label ?? path.at(-1) ?? "";
      }
    };
    const handleTextMetricUnitChange = (metricId: string, key: number, value: string): void => {
      const item = formState.displayMetrics.textMetrics?.find((metric) => metric.metricId === metricId);
      const displayItem = item ? getTextMetricDisplayItems(item).find((valueItem) => valueItem.key === key) : undefined;
      if (displayItem) {
        displayItem.unit = value;
      }
    };
    const handleDisplayTypeChange = (value: "chart" | "text"): void => {
      formState.displayMetrics.displayType = value;
      if (value === "chart") {
        clearInvalidChartMetric();
      }
    };
    const clearInvalidChartMetric = (): void => {
      if (formState.displayMetrics.displayType !== "chart" || !formState.displayMetrics.metricId) {
        return;
      }
      const metric = displayMetricOptions.value.find((item) => item.value === formState.displayMetrics.metricId);
      if (!metric || !isArrayMetricOption(metric)) {
        formState.displayMetrics.metricId = "";
        formState.displayMetrics.metricName = "";
        formState.displayMetrics.dataPath = "";
        formState.displayMetrics.dataName = "";
        formState.displayMetrics.groupDimension = "";
        formState.displayMetrics.groupDimensionName = "";
        formState.displayMetrics.groupValue = "";
        formState.displayMetrics.groupValueName = "";
      }
    };
    const parseDisplayMetrics = (value?: string): DisplayMetricsConfig => {
      if (!value) {
        return {};
      }
      try {
        return JSON.parse(value) as DisplayMetricsConfig;
      } catch {
        return {};
      }
    };
    const buildDisplayMetrics = (): string => {
      if (formState.displayMetrics.displayType === "text") {
        return JSON.stringify({
          displayType: "text",
          textMetrics:
            formState.displayMetrics.textMetrics?.map((item) => {
              const metric =
                displayMetricOptions.value.find((option) => option.value === item.metricId) ??
                metricOptionCache.value.find((option) => option.value === item.metricId);
              return {
                metricId: item.metricId,
                metricName: metric?.label ?? item.metricName,
                displayItems: normalizeTextMetricDisplayItems(item).map((displayItem) => ({
                  displayName: displayItem.displayName,
                  valuePath: isDirectTextMetric(item.metricId) ? [] : displayItem.valuePath,
                  valueName: isDirectTextMetric(item.metricId) ? (metric?.label ?? item.metricName) : displayItem.valueName,
                  unit: displayItem.unit ?? "",
                })),
              };
            }) ?? [],
        });
      }
      const metric = displayMetricOptions.value.find((item) => item.value === formState.displayMetrics.metricId);
      const dataContext = selectedSchemaContext.value as DefaultOptionType;
      const groupDimension = groupDimensionOptions.value.find((item) => item.value === formState.displayMetrics.groupDimension);
      const groupValue = groupValueOptions.value.find((item) => item.value === formState.displayMetrics.groupValue);
      return JSON.stringify({
        displayType: "chart",
        metricId: formState.displayMetrics.metricId,
        metricName: metric?.label ?? formState.displayMetrics.metricName,
        dataPath: formState.displayMetrics.dataPath ?? dataContext?.value,
        dataName: dataContext?.label ?? formState.displayMetrics.dataName,
        chartType: formState.displayMetrics.chartType,
        groupDimension: formState.displayMetrics.groupDimension,
        groupDimensionName: groupDimension?.label ?? formState.displayMetrics.groupDimensionName,
        groupValue: formState.displayMetrics.groupValue,
        groupValueName: groupValue?.label ?? formState.displayMetrics.groupValueName,
        sort: formState.displayMetrics.sort,
        topN: formState.displayMetrics.topN ? Math.min(Number(formState.displayMetrics.topN), 5) : "",
      });
    };
    const validateDisplayMetrics = (): boolean => {
      if (!formState.displayMetricsEnabled) {
        return true;
      }
      if (formState.displayMetrics.displayType === "text") {
        const textMetrics = formState.displayMetrics.textMetrics ?? [];
        if (textMetrics.length === 0) {
          message.error("请选择文本展示指标");
          return false;
        }
        const invalidName = textMetrics.find((item) =>
          normalizeTextMetricDisplayItems(item).some((displayItem) => !displayItem.displayName.trim()),
        );
        if (invalidName) {
          message.error("请输入文本展示名称");
          return false;
        }
        const invalidValue = textMetrics.find(
          (item) =>
            !isDirectTextMetric(item.metricId) &&
            normalizeTextMetricDisplayItems(item).some((displayItem) => displayItem.valuePath.length === 0),
        );
        if (invalidValue) {
          message.error("请选择文本展示值");
          return false;
        }
        return true;
      }
      if (!formState.displayMetrics.metricId) {
        message.error("请选择展示指标");
        return false;
      }
      if (!formState.displayMetrics.chartType) {
        message.error("请选择图表类型");
        return false;
      }
      if (schemaContextOptions.value.length > 1 && formState.displayMetrics.dataPath === "") {
        message.error("请选择分组数据");
        return false;
      }
      if (!formState.displayMetrics.groupDimension) {
        message.error("请选择分组维度");
        return false;
      }
      if (!formState.displayMetrics.groupValue) {
        message.error("请选择分组值");
        return false;
      }
      if (!formState.displayMetrics.sort) {
        message.error("请选择排序方式");
        return false;
      }
      if (!formState.displayMetrics.topN || Number(formState.displayMetrics.topN) <= 0) {
        message.error("请输入有效的取前N条");
        return false;
      }
      if (formState.displayMetrics.topN && Number(formState.displayMetrics.topN) > 5) {
        message.error("取前N条最大为5");
        return false;
      }
      return true;
    };

    const cancel = (): void => {
      emit("cancel");
    };
    /**
     * @description 确认事件
     */
    const handleModalOk = async (): Promise<void> => {
      try {
        await formRef.value?.validate();
        if (!validateDisplayMetrics()) {
          return;
        }
        const matches = formState.ruleContentTemplateEnabled ? formState.rule.match(/\[(.*?)\]/g) : [];
        const validLabels = metricOptionCache.value.map((opt) => `[${opt.label}]`);
        const errorItem = matches?.filter((match) => !validLabels.includes(match));
        if (errorItem && errorItem.length) {
          message.error(`${errorItem.join("、")}指标不存在`);
          return;
        }
        const ruleResult = detectionClick();
        if (!ruleResult) {
          return;
        }
        const labelToValueMap = new Map(metricOptionCache.value.map((opt) => [opt.label, opt.value]));

        const result =
          matches
            ?.map((match) => {
              const label = match.slice(1, -1);
              return labelToValueMap.get(label) || "";
            })
            .filter(Boolean) || [];

        let computeFormula = formState.ruleContentTemplateEnabled ? formState.rule : "";

        labelToValueMap.forEach((value, label) => {
          // 使用 replaceAll 和模板字符串来安全地替换所有出现的 label
          const searchStr = `[${label}]`;
          const replacementStr = `[${value}]`;
          computeFormula = computeFormula.split(searchStr).join(replacementStr);
        });

        const params = {
          itemName: formState.ruleName,
          parentId: props.addKay,
          itemType: "COMPUTE_RULE",
          weightAllot: formState.weight ?? 0,
          computeMetric: formState.formula ?? "",
          ruleContentTemplateEnabled: formState.ruleContentTemplateEnabled,
          templateMetricVariables: result.join(","),
          ruleContentTemplate: computeFormula,
          displayMetricsEnabled: formState.displayMetricsEnabled,
          displayMetrics: formState.displayMetricsEnabled ? buildDisplayMetrics() : "",
          coefficients: conditions.value.map((item) => ({
            greaterThan: item.min,
            lessThanOrEqual: item.max,
            scoreRatio: item.score,
          })),
        };

        if (formState.id) {
          // 编辑逻辑
          const newParam = {
            ...params,
            id: formState.id,
          };
          await editLibraries(newParam);
        } else {
          // 新增逻辑
          await addLibraries(params);
        }
        // ModalVisible.value = false;
        // GetTableData(); // 重新加载数据
      } catch {
        // Error handling
      }
    };

    const addLibraries = async (params: addRuleLibraries): Promise<void> => {
      buttonLoading.value = true;
      try {
        await cubeSafetyManagementAnalysisService.postRuleLibrariesList(params);
        message.success("保存成功");
        emit("submit");
      } catch {
        message.error("保存失败");
      } finally {
        buttonLoading.value = false;
      }
    };
    const editLibraries = async (params: addRuleLibraries): Promise<void> => {
      buttonLoading.value = true;
      try {
        await cubeSafetyManagementAnalysisService.editRuleLibrariesList(params);
        message.success("保存成功");
        emit("submit");
      } catch {
        message.error("保存失败");
      } finally {
        buttonLoading.value = false;
      }
    };
    const inputValue = ref<string>("");
    const computerSelectOption = computed(() =>
      props.selectOption.filter((item) => {
        try {
          const schema = JSON.parse(item.resultJsonSchema ?? "{}") as JsonSchemaNode;
          return hasSchemaType(schema, ["number", "integer"]);
        } catch {
          return false;
        }
      }),
    );
    const showAllSelectOption = computed(() =>
      props.selectOption.filter((item) => {
        try {
          const schema = JSON.parse(item.resultJsonSchema ?? "{}") as JsonSchemaNode;
          return hasSchemaType(schema, ["number", "integer", "array", "string"]);
        } catch {
          return false;
        }
      }),
    );
    const showSelectOption = computed(() => {
      if (inputValue.value === "") {
        return showAllSelectOption.value;
      }
      return showAllSelectOption.value.filter((item) => item.label.includes(inputValue.value));
    });
    const textMetricIds = computed(() => formState.displayMetrics.textMetrics?.map((item) => item.metricId) ?? []);

    const inputChange = (e: ChangeEvent): void => {
      inputValue.value = e.target.value ?? "";
    };
    const selectItem = (item: { value: string; label: string }): void => {
      modalVisible.value = false;
      const { rule } = formState;
      const position = cursorPosition.value;
      const newRule = rule.slice(0, position) + `[${item.label}]` + rule.slice(position);
      formState.rule = newRule;
      // 更新光标位置
      cursorPosition.value = position + `[${item.label}]`.length;
    };
    const handleTextareaBlur = (e: FocusEvent): void => {
      cursorPosition.value = (e.target as HTMLTextAreaElement).selectionStart;
    };
    const renderFormula = (name: string): string => {
      // Const labelToValueMap = new Map(selectOption.value.map(opt => [opt.label, opt.value]));
      let formula = name;
      metricOptionCache.value.forEach((item) => {
        const searchValue = `[${item.value}]`;
        const replaceValue = `[${item.label}]`;
        formula = formula.split(searchValue).join(replaceValue);
      });
      return formula;
    };
    watch(
      () => props.selectOption,
      (options) => {
        mergeMetricOptionCache(options);
      },
      { immediate: true },
    );
    onMounted(async () => {
      props.viewReportData;
      if (props.viewReportData) {
        const displayMetrics = parseDisplayMetrics(props.viewReportData.displayMetrics);
        formState.ruleName = props.viewReportData.name;
        formState.rule = renderFormula(props.viewReportData.content);
        formState.ruleContentTemplateEnabled = props.viewReportData.ruleContentTemplateEnabled ?? true;
        formState.displayMetricsEnabled = props.viewReportData.displayMetricsEnabled ?? false;
        formState.displayMetrics = {
          chartType: "",
          sort: "",
          topN: null,
          textMetrics: [],
          ...displayMetrics,
          displayType: displayMetrics.displayType ?? "chart",
        };
        conditions.value =
          props.viewReportData.coefficients?.map((item, key) => ({
            key,
            min: item.greaterThan,
            max: item.lessThanOrEqual,
            score: item.scoreRatio,
            error: false,
          })) ?? defaultConditions;
        formState.weight = Number(props.viewReportData.weight);
        formState.formula = props.viewReportData.computeMetric ?? null;
        formState.id = props.viewReportData.id ?? "";
      }
      await getDisplayMetricOptions();
      mergeDisplayMetricOptions(getSavedDisplayMetricOptions());
      clearInvalidChartMetric();
    });
    const addLayoutSlots = {
      "layout-content": (): JSX.Element => (
        <div style={{ padding: "20px" }}>
          <Form ref={formRef} model={formState} rules={rules} labelCol={{ span: 2 }} wrapperCol={{ span: 22 }}>
            <FormItem label="规则名称" name="ruleName">
              <Input v-model:value={formState.ruleName} style={{ width: "380px" }} placeholder={"请输入规则名称"} />
            </FormItem>
            <FormItem label="规则模版">
              <Switch v-model:checked={formState.ruleContentTemplateEnabled} />
            </FormItem>
            <FormItem label="规则内容" name="rule">
              {formState.ruleContentTemplateEnabled ? (
                <div>
                  <div>
                    {/* <Select options={props.selectOption} placeholder={'选择指标'} v-model:value={ruleList.value} style={{ marginBottom: '10px', width: '380px' }} onSelect={(value: RawValueType | LabelInValueType, option: DefaultOptionType) => handleSelect(value as string, option) } mode='multiple' maxTagCount={2} onDeselect={ (value: RawValueType | LabelInValueType, option: DefaultOptionType) => handleDeselect(value as string, option)}>

                  </Select> */}
                    <Button type="primary" onClick={addRule} style={{ marginBottom: "10px" }}>
                      插入指标
                    </Button>
                  </div>

                  <Textarea
                    v-model:value={formState.rule}
                    rows={4}
                    style={{ width: "380px" }}
                    placeholder={"请输入规则内容"}
                    onChange={textAreHandleChange}
                    onBlur={handleTextareaBlur}
                  />
                </div>
              ) : (
                <span style={{ color: "#999" }}>未启用</span>
              )}
            </FormItem>
            <FormItem label="展示指标">
              <Switch v-model:checked={formState.displayMetricsEnabled} />
            </FormItem>
            {formState.displayMetricsEnabled && (
              <FormItem label="指标配置">
                <div class={styles["display-metrics-form"]}>
                  <div class={styles["display-metrics-row"]}>
                    <div class={styles["display-metrics-full"]}>
                      <div class={[styles["display-metrics-label"], styles["display-metrics-required"]]}>展示方式</div>
                      <Select
                        options={displayTypeOptions}
                        v-model:value={formState.displayMetrics.displayType}
                        style={{ width: "100%" }}
                        placeholder="请选择"
                        onChange={(value: "chart" | "text") => handleDisplayTypeChange(value)}
                      />
                    </div>
                  </div>
                  {formState.displayMetrics.displayType === "text" ? (
                    <>
                      <div class={styles["display-metrics-row"]}>
                        <div class={styles["display-metrics-full"]}>
                          <div class={[styles["display-metrics-label"], styles["display-metrics-required"]]}>选择指标</div>
                          <Select
                            mode="multiple"
                            showSearch
                            options={displayMetricOptions.value}
                            value={textMetricIds.value}
                            style={{ width: "100%" }}
                            placeholder="请选择"
                            loading={displayMetricLoading.value}
                            onChange={(value: string[]) => syncTextMetrics(value)}
                            filterOption={(input: string, option: DefaultOptionType) =>
                              option?.label.toLowerCase().indexOf(input.toLowerCase()) >= 0
                            }
                          />
                          <div class={styles["display-metrics-tip"]}>可选择多个指标，每个指标需配置展示名称和值</div>
                        </div>
                      </div>
                      {formState.displayMetrics.textMetrics?.map((item) => {
                        const valueOptions = getTextValueOptions(item.metricId);
                        const directTextMetric = isDirectTextMetric(item.metricId);
                        return (
                          <div key={item.metricId} class={styles["text-metric-config"]}>
                            <div class={styles["text-metric-config-header"]}>
                              <div class={styles["text-metric-config-title"]}>{item.metricName}</div>
                              <Button type="link" onClick={() => addTextMetricDisplayItem(item.metricId)}>
                                新增展示项
                              </Button>
                            </div>
                            {getTextMetricDisplayItems(item).map((displayItem) => (
                              <div key={displayItem.key} class={styles["text-metric-display-item"]}>
                                <div>
                                  <div class={[styles["display-metrics-label"], styles["display-metrics-required"]]}>展示名称</div>
                                  <Input
                                    value={displayItem.displayName}
                                    style={{ width: "100%" }}
                                    placeholder="请输入"
                                    onChange={(event: ChangeEvent) =>
                                      handleTextMetricDisplayNameChange(item.metricId, displayItem.key, event.target.value ?? "")
                                    }
                                  />
                                </div>
                                <div>
                                  <div
                                    class={[styles["display-metrics-label"], directTextMetric ? "" : styles["display-metrics-required"]]}
                                  >
                                    展示值
                                  </div>
                                  {directTextMetric ? (
                                    <div class={styles["display-metrics-static-value"]}>直接使用指标结果</div>
                                  ) : (
                                    <Cascader
                                      options={valueOptions}
                                      value={displayItem.valuePath}
                                      style={{ width: "100%" }}
                                      placeholder="请选择"
                                      onChange={(value: string[]) => handleTextMetricValuePathChange(item.metricId, displayItem.key, value)}
                                    />
                                  )}
                                </div>
                                <div>
                                  <div class={styles["display-metrics-label"]}>单位</div>
                                  <Input
                                    value={displayItem.unit}
                                    style={{ width: "100%" }}
                                    placeholder="可选"
                                    onChange={(event: ChangeEvent) =>
                                      handleTextMetricUnitChange(item.metricId, displayItem.key, event.target.value ?? "")
                                    }
                                  />
                                </div>
                                <div class={styles["text-metric-display-action"]}>
                                  <Button
                                    type="link"
                                    danger
                                    disabled={getTextMetricDisplayItems(item).length <= 1}
                                    onClick={() => removeTextMetricDisplayItem(item.metricId, displayItem.key)}
                                  >
                                    删除
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        );
                      })}
                    </>
                  ) : (
                    <>
                      <div class={styles["display-metrics-row"]}>
                        <div class={styles["display-metrics-full"]}>
                          <div class={[styles["display-metrics-label"], styles["display-metrics-required"]]}>选择指标</div>
                          <Select
                            showSearch
                            options={chartDisplayMetricOptions.value}
                            value={formState.displayMetrics.metricId}
                            style={{ width: "100%" }}
                            placeholder="请选择"
                            loading={displayMetricLoading.value}
                            onChange={(value: string) => handleDisplayMetricChange(value as string)}
                            filterOption={(input: string, option: DefaultOptionType) =>
                              option?.label.toLowerCase().indexOf(input.toLowerCase()) >= 0
                            }
                          />
                          <div class={styles["display-metrics-tip"]}>图形展示仅支持返回类型为数组的展示指标</div>
                        </div>
                      </div>
                      <div class={styles["display-metrics-row"]}>
                        <div class={styles["display-metrics-full"]}>
                          <div class={[styles["display-metrics-label"], styles["display-metrics-required"]]}>图表类型</div>
                          <Select
                            options={chartTypeOptions}
                            v-model:value={formState.displayMetrics.chartType}
                            style={{ width: "100%" }}
                            placeholder="请选择"
                          />
                        </div>
                      </div>
                      {schemaContextOptions.value.length > 1 && (
                        <div class={styles["display-metrics-row"]}>
                          <div class={styles["display-metrics-full"]}>
                            <div class={[styles["display-metrics-label"], styles["display-metrics-required"]]}>分组数据</div>
                            <Select
                              options={schemaContextOptions.value.map((item) => ({ label: item.label, value: item.value }))}
                              value={formState.displayMetrics.dataPath}
                              style={{ width: "100%" }}
                              placeholder="请选择"
                              onChange={(value: string, option: DefaultOptionType) =>
                                handleDataPathChange(value as string, option as DefaultOptionType)
                              }
                            />
                          </div>
                        </div>
                      )}
                      <div class={styles["display-metrics-row"]}>
                        <div>
                          <div class={[styles["display-metrics-label"], styles["display-metrics-required"]]}>分组维度</div>
                          <Select
                            options={groupDimensionOptions.value}
                            value={formState.displayMetrics.groupDimension}
                            style={{ width: "100%" }}
                            placeholder="请选择"
                            onChange={(value: string, option: DefaultOptionType) =>
                              handleGroupDimensionChange(value as string, option as DefaultOptionType)
                            }
                          />
                        </div>
                        <div>
                          <div class={[styles["display-metrics-label"], styles["display-metrics-required"]]}>分组值</div>
                          <Select
                            options={groupValueOptions.value}
                            value={formState.displayMetrics.groupValue}
                            style={{ width: "100%" }}
                            placeholder="请选择"
                            onChange={(value: string, option: DefaultOptionType) =>
                              handleGroupValueChange(value as string, option as DefaultOptionType)
                            }
                          />
                        </div>
                        <div>
                          <div class={[styles["display-metrics-label"], styles["display-metrics-required"]]}>排序</div>
                          <Select
                            options={sortOptions}
                            v-model:value={formState.displayMetrics.sort}
                            style={{ width: "100%" }}
                            placeholder="请选择"
                          />
                        </div>
                        <div>
                          <div class={[styles["display-metrics-label"], styles["display-metrics-required"]]}>取前N条</div>
                          <Input
                            v-model:value={formState.displayMetrics.topN}
                            type="number"
                            min={1}
                            max={5}
                            style={{ width: "100%" }}
                            placeholder="请输入"
                          />
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </FormItem>
            )}
            <FormItem label="计分权重" name="weight">
              <Input v-model:value={formState.weight} style={{ width: "380px" }} placeholder={"请输入计分权重"} />
            </FormItem>
            <FormItem label="计分指标" name="formula">
              <Select
                showSearch
                options={computerSelectOption}
                v-model:value={formState.formula}
                loading={props.selectLoading}
                style={{ width: "380px" }}
                placeholder={"请选择规则计算接口"}
                filterOption={(input: string, option: DefaultOptionType) => option?.label.toLowerCase().indexOf(input.toLowerCase()) >= 0}
              />
            </FormItem>

            <FormItem label="取分条件" required>
              <Button type="primary" onClick={handleAdd} style={{ marginBottom: "16px" }}>
                新增
              </Button>
              <Table columns={columns} dataSource={conditions.value} pagination={false} bordered />
            </FormItem>
          </Form>
        </div>
      ),
      "footer-page": (): JSX.Element => (
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "16px", padding: "16px" }}>
          <Button onClick={cancel}>取消</Button>
          <Button type="primary" onClick={handleModalOk} loading={buttonLoading.value}>
            保存
          </Button>
        </div>
      ),
    };

    return (): JSX.Element => (
      <>
        <Layout title={props.viewTitle} v-slots={addLayoutSlots}></Layout>
        <Modal
          title={"插入指标"}
          visible={modalVisible.value}
          onCancel={() => (modalVisible.value = false)}
          footer={null}
          destroyOnCloserules
        >
          <div class={styles["modal-content-container"]}>
            <Input placeholder={"请输入指标名称查询"} onInput={inputChange}></Input>
            <div class={styles["item-container"]}>
              {showSelectOption.value.map((item: { value: string; label: string }, key) => (
                <span key={key} onClick={() => selectItem(item)}>
                  {item.label}
                </span>
              ))}
            </div>
          </div>
        </Modal>
        {props.selectLoading && (
          <div class={styles["rule-add-loading"]}>
            <Spin />
          </div>
        )}
      </>
    );
  },
});
