import { RightOutlined } from "@ant-design/icons-vue";
import { computed, defineComponent, onMounted, ref, watch } from "vue";

import { CubeLayout, InspectItemContentTable } from "@ghcloud/cube-app-design";
import type { InspectItemContent } from "@ghcloud/cube-app-design/src/business-components/inspect-components/inspect-item-content-table/type";
import {
  InspectBusinessType,
  type BatchInspectStandard,
  type InspectResultItem,
  type StandardItem,
} from "@ghcloud/cube-daily-inspection-service";
import {
  Button,
  Empty,
  Input,
  InputSearch,
  Modal,
  PopConfirm,
  PopOver,
  Spin,
  Switch,
  TabPane,
  Tabs,
  Textarea,
  message,
} from "@ghcloud/cube-ui";
import { usePageName } from "@ghcloud/cube-utils";

import {
  cubeAiApplicationLiteService,
  cubeAssetManagementService,
  cubeDailyInspectionService,
  cubeDeviceCenterService,
  cubeDictionaryLiteService,
  cubeMaintainService,
  cubeMdataService,
  cubeRiskTypeService,
  cubeSmallEngineeringService,
} from "@/api/server";
import type { InspectAiStandardPayload } from "@/types/inspect";

import styles from "./inspect-standard-ai.module.less";

type TargetCategory = "DEVICE" | "STALL" | "PROPERTY" | "SITE_POINT" | "RISK_SOURCE" | "SMALL_ENGINEERING";

interface ObjectNode {
  id: string;
  name: string;
  children?: ObjectNode[];
}

interface SourceNode {
  id?: string | number;
  name?: string;
  categoryName?: string;
  categoryCode?: string;
  categoryCodeConcat?: string;
  children?: SourceNode[];
  nextList?: SourceNode[];
}

interface AiGeneratedItem extends InspectItemContent {
  id: string;
  isResultItem: boolean;
}

interface AiGeneratedStandard {
  id: string;
  name?: string;
  safetyTip?: string;
  defaultStandard: boolean;
  expanded: boolean;
  items: AiGeneratedItem[];
  nameError?: string;
}

const AI_FLOW_DICTIONARY_ITEM_CODE = "BUSINESS_AI_FLOW";
const AI_FLOW_DICTIONARY_CODE = "INSPECTION_AI_FLOW";
const INSPECT_STANDARD_FLOW_KEY = "inspectStandGenerate";

const tabList: { key: TargetCategory; name: string }[] = [
  { key: "DEVICE", name: "设备" },
  { key: "STALL", name: "档位" },
  { key: "PROPERTY", name: "资产" },
  { key: "SITE_POINT", name: "现场点" },
  { key: "RISK_SOURCE", name: "风险源" },
  { key: "SMALL_ENGINEERING", name: "小散工程" },
];

const loadingTextMap = new Map<TargetCategory, string>([
  ["DEVICE", "AI 正在分析设备特征..."],
  ["STALL", "AI 正在分析档位特征..."],
  ["PROPERTY", "AI 正在分析资产特征..."],
  ["SITE_POINT", "AI 正在分析现场点特征..."],
  ["RISK_SOURCE", "AI 正在分析风险源特征..."],
  ["SMALL_ENGINEERING", "AI 正在分析小散工程特征..."],
]);

const mapNodes = (list: SourceNode[] = [], childrenField: "children" | "nextList" = "children"): ObjectNode[] => {
  return list
    .map((item) => {
      const children = item[childrenField]?.length ? mapNodes(item[childrenField], childrenField) : [];
      return {
        id: String(item.id ?? item.categoryCodeConcat ?? item.categoryCode ?? ""),
        name: item.name ?? item.categoryName ?? "--",
        ...(children.length ? { children } : {}),
      };
    })
    .filter((item) => item.id);
};

const filterNodes = (list: ObjectNode[], keyword: string): ObjectNode[] => {
  if (!keyword) return list;
  return list
    .map((item) => {
      const children = item.children ? filterNodes(item.children, keyword) : [];
      if (item.name.includes(keyword) || children.length) {
        return { ...item, children };
      }
      return null;
    })
    .filter(Boolean) as ObjectNode[];
};

const findFirstNode = (list: ObjectNode[]): ObjectNode | undefined => {
  return list[0];
};

const createEmptyItem = (): AiGeneratedItem => ({
  id: `${Date.now()}-${Math.random()}`,
  name: undefined,
  isResultItem: true,
  resultId: undefined,
  resultItemValue: undefined,
  imageResult: undefined,
  remarkResult: undefined,
  itemTag: undefined,
  options: undefined,
});

const createEmptyStandard = (): AiGeneratedStandard => ({
  id: `${Date.now()}-${Math.random()}`,
  defaultStandard: true,
  expanded: true,
  items: [createEmptyItem()],
});

const safeJsonParse = (value: string): unknown => {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};

const parseJsonFromText = (text: string): unknown => {
  const trimmed = text.trim();
  if (!trimmed) return null;
  const direct = safeJsonParse(trimmed);
  if (direct != null) return direct;
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i)?.[1];
  if (fenced) {
    const parsed = safeJsonParse(fenced.trim());
    if (parsed != null) return parsed;
  }
  const start = Math.min(...[trimmed.indexOf("{"), trimmed.indexOf("[")].filter((index) => index >= 0));
  if (Number.isFinite(start)) {
    const end = Math.max(trimmed.lastIndexOf("}"), trimmed.lastIndexOf("]"));
    if (end > start) {
      return safeJsonParse(trimmed.slice(start, end + 1));
    }
  }
  return null;
};

const readRecord = (value: unknown): Record<string, unknown> | null => {
  return value != null && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : null;
};

const readDictionaryVariable = (value: unknown): string => {
  if (Array.isArray(value)) {
    return value.map(readDictionaryVariable).find(Boolean) ?? "";
  }
  const record = readRecord(value);
  if (!record) return "";
  if (typeof record.variable === "string") return record.variable;
  return readDictionaryVariable(record.data);
};

const readJsonStringLiteral = (value: string): string => {
  const parsed = safeJsonParse(value);
  return typeof parsed === "string" ? parsed : "";
};

const readStringValueFromJsonText = (jsonText: string, key: string): string => {
  const keyPattern = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = jsonText.match(new RegExp(`"${keyPattern}"\\s*:\\s*("(?:\\\\.|[^"\\\\])*"|-?\\d+)`));
  if (!match) return "";
  const raw = match[1];
  if (!raw) return "";
  if (raw.startsWith('"')) {
    return readJsonStringLiteral(raw);
  }
  return raw;
};

const looksLikeStandardPayload = (value: unknown): boolean => {
  const record = readRecord(value);
  return Boolean(record && ("items" in record || "standardItems" in record || "safetyTip" in record || "safetyTips" in record));
};

const extractStandardsPayload = (value: unknown): InspectAiStandardPayload[] => {
  if (Array.isArray(value)) {
    if (value.some(looksLikeStandardPayload)) {
      return value.filter(looksLikeStandardPayload) as InspectAiStandardPayload[];
    }
    for (const item of value) {
      const nested = extractStandardsPayload(item);
      if (nested.length) return nested;
    }
    return [];
  }
  const record = readRecord(value);
  if (!record) return [];
  for (const key of ["standards", "standardList", "data", "result", "output", "raw", "outputs"]) {
    const candidate = record[key];
    const nested = extractStandardsPayload(candidate);
    if (nested.length) return nested;
  }
  return [];
};

const extractAiText = (value: unknown): string => {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) {
    return value.map(extractAiText).find(Boolean) ?? "";
  }
  const record = readRecord(value);
  if (!record) return "";
  for (const key of ["text", "message", "content", "output", "result", "response", "raw", "outputs"]) {
    const text = extractAiText(record[key]);
    if (text) return text;
  }
  return "";
};

const getOptionValueSet = (value: unknown): string[] => {
  if (Array.isArray(value)) return value.map((item) => String(item)).filter(Boolean);
  if (typeof value === "string")
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  return [];
};

const normalizeAiStandards = (response: unknown, resultList: InspectResultItem[]): AiGeneratedStandard[] => {
  const payloads = extractStandardsPayload(response);
  const parsedText = payloads.length ? null : parseJsonFromText(extractAiText(response));
  const source = payloads.length ? payloads : extractStandardsPayload(parsedText);
  const fallbackResult = resultList[0];
  const fallbackValue = fallbackResult?.options?.[0]?.itemValue;
  const fallbackErrorValues = fallbackResult?.options?.filter((item) => item.errorFlag).map((item) => item.itemValue);
  return source
    .map((standard, standardIndex) => {
      const items = standard.items ?? standard.standardItems ?? [];
      const nextStandard: AiGeneratedStandard = {
        id: `${Date.now()}-${standardIndex}`,
        defaultStandard: standard.defaultStandard ?? true,
        expanded: standardIndex === 0,
        items: items.map((item, itemIndex) => {
          const isResultItem = item.isResultItem ?? true;
          return {
            id: `${Date.now()}-${standardIndex}-${itemIndex}`,
            name: item.name,
            isResultItem,
            resultId: item.resultId ?? fallbackResult?.id,
            resultItemValue: item.resultItemValue ?? item.defaultResult ?? fallbackValue,
            imageResult: isResultItem
              ? getOptionValueSet(item.imageResult).length
                ? getOptionValueSet(item.imageResult)
                : fallbackErrorValues
              : item.imageResult === true || item.imageResult === "true",
            remarkResult: isResultItem
              ? getOptionValueSet(item.remarkResult).length
                ? getOptionValueSet(item.remarkResult)
                : fallbackErrorValues
              : item.remarkResult === true || item.remarkResult === "true",
            itemTag: item.itemTag ?? undefined,
            options: fallbackResult?.options,
          };
        }),
      };
      if (standard.name != null) {
        nextStandard.name = standard.name;
      }
      const safetyTip = standard.safetyTip ?? standard.safetyTips;
      if (safetyTip != null) {
        nextStandard.safetyTip = safetyTip;
      }
      return nextStandard;
    })
    .filter((item) => item.name || item.items.length);
};

const getInspectStandardFlowId = async (): Promise<string> => {
  const dictionary = await cubeDictionaryLiteService.getDataDictionaryByItemAndCode({
    itemCode: AI_FLOW_DICTIONARY_ITEM_CODE,
    code: AI_FLOW_DICTIONARY_CODE,
  });
  const variable = readDictionaryVariable(dictionary);
  const flowId = readStringValueFromJsonText(variable, INSPECT_STANDARD_FLOW_KEY);
  if (!flowId.trim()) {
    throw new Error("未配置 AI 巡检标准生成流程");
  }
  return flowId.trim();
};

const buildAiInput = (input: { targetName: string; supplement: string }): string => {
  const supplementText = input.supplement.trim();
  if (!supplementText) {
    return input.targetName;
  }
  return `${input.targetName}\n${supplementText}`;
};

export const InspectStandardAi = defineComponent({
  setup: () => {
    const { pageTitle } = usePageName();
    const targetCategory = ref<TargetCategory>("DEVICE");
    const targetType = ref("");
    const targetName = ref("");
    const leftKeyword = ref("");
    const objectData = ref<ObjectNode[]>([]);
    const leftLoading = ref(false);
    const expandedKeys = ref<Set<string>>(new Set());
    const askVisible = ref(false);
    const supplement = ref("");
    const generating = ref(false);
    const saveLoading = ref(false);
    const generated = ref(false);
    const tableKeyword = ref("");
    const standards = ref<AiGeneratedStandard[]>([]);
    const resultList = ref<InspectResultItem[]>([]);

    const categoryName = computed(() => tabList.find((item) => item.key === targetCategory.value)?.name ?? "对象");
    const loadingText = computed(() => loadingTextMap.get(targetCategory.value) ?? "AI 正在分析对象特征...");
    const filteredStandards = computed(() => {
      const keyword = tableKeyword.value.trim();
      if (!keyword) return standards.value;
      return standards.value.filter((item) => item.name?.includes(keyword));
    });

    const setDefaultSelected = (): void => {
      const first = findFirstNode(objectData.value);
      targetType.value = first?.id ?? "";
      targetName.value = first?.name ?? "";
      expandedKeys.value = new Set(first ? [first.id] : []);
    };

    const queryObjectData = async (resetSelected = false): Promise<void> => {
      leftLoading.value = true;
      try {
        switch (targetCategory.value) {
          case "DEVICE": {
            const res = await cubeDeviceCenterService.getIotProductCategoryTree();
            objectData.value = filterNodes(mapNodes(res as unknown as SourceNode[], "children"), leftKeyword.value);
            break;
          }
          case "STALL": {
            const res = await cubeMdataService.stallTypeList({ enabled: true });
            objectData.value = filterNodes(mapNodes(res as unknown as SourceNode[]), leftKeyword.value);
            break;
          }
          case "PROPERTY": {
            const res = await cubeAssetManagementService.getAssemblyClassifyPage({ pageNumber: 1, pageSize: 1000, type: "assetType" });
            objectData.value = filterNodes(mapNodes((res?.records ?? []) as SourceNode[]), leftKeyword.value);
            break;
          }
          case "SITE_POINT": {
            const res = await cubeMaintainService.inspectPointTypeList();
            objectData.value = filterNodes(mapNodes(res as unknown as SourceNode[]), leftKeyword.value);
            break;
          }
          case "RISK_SOURCE": {
            const res = await cubeRiskTypeService.getRiskSourceType({ itemCode: "risk-source-type", pageNumber: 1, pageSize: 1000 });
            objectData.value = filterNodes(mapNodes(res as unknown as SourceNode[], "nextList"), leftKeyword.value);
            break;
          }
          case "SMALL_ENGINEERING": {
            const res = await cubeSmallEngineeringService.getProjectTypeList({ name: leftKeyword.value });
            objectData.value = filterNodes(mapNodes(res as unknown as SourceNode[]), leftKeyword.value);
            break;
          }
        }
        if (resetSelected || !targetType.value) {
          setDefaultSelected();
        }
      } catch {
        objectData.value = [];
        setDefaultSelected();
      } finally {
        leftLoading.value = false;
      }
    };

    const getResultList = async (): Promise<void> => {
      resultList.value = await cubeDailyInspectionService.getInspectResultList(InspectBusinessType.DAILY_INSPECTION);
    };

    watch(targetCategory, () => {
      leftKeyword.value = "";
      targetType.value = "";
      targetName.value = "";
      queryObjectData(true);
    });

    watch(leftKeyword, () => {
      queryObjectData(false);
    });

    onMounted(() => {
      queryObjectData(true);
      getResultList();
    });

    const handleSelectObject = (item: ObjectNode): void => {
      targetType.value = item.id;
      targetName.value = item.name;
    };

    const toggleExpand = (id: string): void => {
      const next = new Set(expandedKeys.value);
      next.has(id) ? next.delete(id) : next.add(id);
      expandedKeys.value = next;
    };

    const renderObjectNodes = (items: ObjectNode[], level = 0): JSX.Element => (
      <ul class={styles["object-list"]}>
        {items.map((item) => {
          const hasChildren = Boolean(item.children?.length);
          const expanded = expandedKeys.value.has(item.id);
          return (
            <li key={item.id}>
              <div
                class={[styles["object-item"], targetType.value === item.id && styles.active]}
                style={{ paddingLeft: `${4 + level * 12}px` }}
                onClick={() => handleSelectObject(item)}
              >
                <Button
                  type="link"
                  size="small"
                  class={styles["expand-btn"]}
                  onClick={(event: Event) => {
                    event.stopPropagation();
                    hasChildren && toggleExpand(item.id);
                  }}
                >
                  {hasChildren ? <RightOutlined class={[styles["collapse-icon"], expanded && styles.expanded]} /> : null}
                </Button>
                <span class={styles["object-name"]} title={item.name}>
                  {item.name}
                </span>
              </div>
              {hasChildren && expanded ? renderObjectNodes(item.children ?? [], level + 1) : null}
            </li>
          );
        })}
      </ul>
    );

    const openGenerateModal = (): void => {
      if (generating.value) return;
      if (!targetType.value) {
        message.warning("请选择左侧对象");
        return;
      }
      askVisible.value = true;
    };

    const handleGenerate = async (): Promise<void> => {
      if (generating.value) return;
      generating.value = true;
      askVisible.value = false;
      try {
        if (!resultList.value.length) {
          await getResultList();
        }
        const flowId = await getInspectStandardFlowId();
        const response = await cubeAiApplicationLiteService.runFlow(flowId, {
          input: buildAiInput({
            targetName: targetName.value,
            supplement: supplement.value,
          }),
          inputType: "chat",
          outputType: "chat",
        });
        const nextStandards = normalizeAiStandards(response, resultList.value);
        if (!nextStandards.length) {
          throw new Error("AI 未返回可识别的巡检标准");
        }
        standards.value = nextStandards;
        generated.value = true;
        message.success("巡检标准生成成功");
      } catch (error) {
        message.error((error as { errorMessage?: string; message?: string })?.errorMessage ?? (error as Error)?.message ?? "生成失败");
      } finally {
        generating.value = false;
      }
    };

    const handleAddStandard = (): void => {
      standards.value = [...standards.value, createEmptyStandard()];
      generated.value = true;
    };

    const handleDeleteStandard = (id: string): void => {
      standards.value = standards.value.filter((item) => item.id !== id);
    };

    const handleAddItem = (standard: AiGeneratedStandard): void => {
      standard.expanded = true;
      standard.items.push(createEmptyItem());
    };

    const handleDeleteItem = (standard: AiGeneratedStandard, id: string): void => {
      standard.items = standard.items.filter((item) => item.id !== id);
    };

    const validateStandards = (): boolean => {
      if (!targetType.value) {
        message.warning("请选择左侧对象");
        return false;
      }
      if (!standards.value.length) {
        message.warning("请先生成巡检标准");
        return false;
      }
      for (const standard of standards.value) {
        standard.nameError = standard.name?.trim() ? "" : "请输入标准名称";
        if (standard.nameError) {
          standard.expanded = true;
          message.warning("请输入标准名称");
          return false;
        }
        if (!standard.items.length) {
          standard.expanded = true;
          message.warning("请添加巡检内容");
          return false;
        }
        for (const item of standard.items) {
          item.nameError = !item.name?.trim();
          item.nameErrorMsg = item.nameError ? "请输入巡检项内容" : "";
          if (item.nameError) {
            standard.expanded = true;
            message.warning("请输入巡检项内容");
            return false;
          }
          if (item.isResultItem && (!item.resultId || !item.resultItemValue)) {
            standard.expanded = true;
            message.warning("请选择巡检结果和默认结果");
            return false;
          }
        }
      }
      return true;
    };

    const transformStandardItem = (item: AiGeneratedItem): StandardItem => {
      if (!item.isResultItem) {
        return {
          name: item.name,
          resultId: null,
          resultItemValue: null,
          imageResult: item.imageResult === true,
          remarkResult: item.remarkResult === true,
          itemTag: null,
          isResultItem: false,
          referType: InspectBusinessType.DAILY_INSPECTION,
        };
      }
      return {
        name: item.name,
        resultId: item.resultId,
        resultItemValue: item.resultItemValue,
        imageResult: Array.isArray(item.imageResult) && item.imageResult.length ? item.imageResult.join(",") : null,
        remarkResult: Array.isArray(item.remarkResult) && item.remarkResult.length ? item.remarkResult.join(",") : null,
        itemTag: item.itemTag ?? null,
        isResultItem: true,
        referType: InspectBusinessType.DAILY_INSPECTION,
      };
    };

    const buildSavePayload = (): BatchInspectStandard[] => {
      return standards.value.map((standard) => ({
        name: standard.name,
        safetyTips: standard.safetyTip,
        enable: true,
        standardItems: standard.items.map(transformStandardItem),
        standardTypeRefers: [
          {
            targetCategory: targetCategory.value,
            targetTypeDetails: [
              {
                targetType: targetType.value,
                defaultStandard: standard.defaultStandard,
              },
            ],
          },
        ],
      }));
    };

    const handleSave = async (): Promise<void> => {
      if (!validateStandards()) return;
      try {
        saveLoading.value = true;
        await cubeDailyInspectionService.batchAddInspectStandard({ standards: buildSavePayload() });
        message.success("保存成功");
        window.setTimeout(() => {
          history.back();
        }, 500);
      } catch (error) {
        message.error((error as { errorMessage?: string })?.errorMessage ?? "保存失败");
      } finally {
        saveLoading.value = false;
      }
    };

    const renderItemRows = (standard: AiGeneratedStandard): JSX.Element => (
      <div class={styles["item-table"]}>
        {standard.items.map((item) => (
          <div class={styles["item-table-row"]} key={item.id}>
            <InspectItemContentTable
              key={`${item.id}-${item.isResultItem ? "result" : "normal"}`}
              value={[item]}
              businessType={InspectBusinessType.DAILY_INSPECTION}
              action="add"
              readonly
              columnTitles={{
                isResultItem: "结果项",
                resultItemValue: "巡检结果默认值",
                imageResult: "必须拍照",
                remarkResult: "必须备注",
              }}
              columnWidths={{
                name: 460,
                isResultItem: 90,
                resultId: 96,
                resultItemValue: 150,
                imageResult: 140,
                remarkResult: 140,
                itemTag: 110,
                action: 100,
              }}
              compactRowResultColumns
            />
            <PopConfirm title="确认删除该项？" onConfirm={() => handleDeleteItem(standard, item.id)}>
              <Button type="link" size="small" danger class={styles["item-delete-btn"]}>
                删除
              </Button>
            </PopConfirm>
          </div>
        ))}
      </div>
    );

    const renderStandards = (): JSX.Element => (
      <div class={styles["standard-list"]}>
        <div class={styles["standard-header"]}>
          <div></div>
          <div>标准名称</div>
          <div>安全提示</div>
          <div>设为默认</div>
          <div>操作</div>
        </div>
        {filteredStandards.value.map((standard) => (
          <div class={styles["standard-card"]} key={standard.id}>
            <div class={styles["standard-row"]}>
              <Button
                type="link"
                size="small"
                onClick={() => {
                  standard.expanded = !standard.expanded;
                }}
              >
                <RightOutlined class={[styles["collapse-icon"], standard.expanded && styles.expanded]} />
              </Button>
              <div class={styles["input-wrap"]}>
                <Input
                  v-model:value={standard.name}
                  placeholder="请输入巡检标准名称"
                  onChange={() => {
                    standard.nameError = standard.name ? "" : "请输入巡检项";
                  }}
                />
                {standard.nameError && <span class={styles.error}>{standard.nameError}</span>}
              </div>
              <div class={styles["input-wrap"]}>
                <PopOver content={standard.safetyTip || ""}>
                  <Input v-model:value={standard.safetyTip} class={styles["safety-input"]} placeholder="请输入安全提示" />
                </PopOver>
              </div>
              <Switch v-model:checked={standard.defaultStandard} class={styles["default-switch"]} />
              <div class={styles.actions}>
                <Button type="link" size="small" onClick={() => handleAddItem(standard)}>
                  新增
                </Button>
                <PopConfirm title="确认删除该巡检标准？" onConfirm={() => handleDeleteStandard(standard.id)}>
                  <Button type="link" size="small" danger>
                    删除
                  </Button>
                </PopConfirm>
              </div>
            </div>
            {standard.expanded ? renderItemRows(standard) : null}
          </div>
        ))}
        {!filteredStandards.value.length && <Empty />}
      </div>
    );

    const slots = {
      "layout-header": (): JSX.Element => <Button onClick={() => history.back()}>返回</Button>,
      "layout-content": (): JSX.Element => (
        <>
          <div class={styles["page-flex"]}>
            <div class={styles["page-left"]}>
              <div class={styles["object-panel"]}>
                <InputSearch v-model:value={leftKeyword.value} allowClear placeholder="请输入关键字" class={styles["left-search"]} />
                <Tabs v-model:activeKey={targetCategory.value} class={styles["object-tabs"]}>
                  {tabList.map((item) => (
                    <TabPane key={item.key} tab={item.name}>
                      <Spin spinning={leftLoading.value}>{objectData.value.length ? renderObjectNodes(objectData.value) : <Empty />}</Spin>
                    </TabPane>
                  ))}
                </Tabs>
              </div>
            </div>
            <div class={styles["page-right"]}>
              <div class={styles["section-title"]}>
                <div>
                  <span class={styles["title-text"]}>AI巡检标准</span>
                  <span class={styles["current-object"]}>当前对象：{targetName.value || "--"}</span>
                </div>
                <Button
                  type="primary"
                  class={styles["generate-btn"]}
                  loading={generating.value}
                  disabled={generating.value}
                  onClick={openGenerateModal}
                >
                  生成巡检标准
                </Button>
              </div>
              {generated.value ? (
                <>
                  <div class={styles.toolbar}>
                    <div class={styles["toolbar-left"]}>
                      <InputSearch v-model:value={tableKeyword.value} allowClear placeholder="请输入巡检标准项" />
                      <Button type="primary" class={styles["add-standard-btn"]} onClick={handleAddStandard}>
                        新增巡检标准
                      </Button>
                    </div>
                    <Button type="primary" loading={saveLoading.value} onClick={handleSave}>
                      保存
                    </Button>
                  </div>
                  {renderStandards()}
                </>
              ) : (
                <div class={styles.empty}>
                  <Empty description="请选择左侧对象，点击“生成巡检标准”" />
                </div>
              )}
              {generating.value && (
                <div class={styles["loading-mask"]}>
                  <Spin tip={loadingText.value} />
                </div>
              )}
            </div>
          </div>
          <Modal
            title="AI 智能追问"
            v-model:visible={askVisible.value}
            okText="确认补充"
            cancelText="取消生成"
            confirmLoading={generating.value}
            okButtonProps={{ disabled: generating.value }}
            cancelButtonProps={{ disabled: generating.value }}
            closable={!generating.value}
            maskClosable={!generating.value}
            onOk={handleGenerate}
          >
            <div class={styles["ask-tip"]}>
              检测到您选择了{categoryName.value}「{targetName.value}
              」，系统数据库中该对象的特征信息尚不完整。为了生成更精准的巡检标准，请补充以下信息：
            </div>
            <Textarea v-model:value={supplement.value} rows={5} placeholder="请补充该类型的关键特征、使用环境或特殊要求" />
          </Modal>
        </>
      ),
    };

    return (): JSX.Element => <CubeLayout title={pageTitle} v-slots={slots} />;
  },
});
