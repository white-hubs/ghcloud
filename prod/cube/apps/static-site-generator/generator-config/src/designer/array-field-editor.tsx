import { defineComponent, ref, computed, type PropType } from "vue";

import { Button, PopConfirm, Empty } from "@ghcloud/cube-ui";
import { UpOutlined, DownOutlined, DeleteOutlined, PlusOutlined } from "@ghcloud/cube-ui";

import { FieldControl } from "./field-control";
import { parseItemTypeString, convertStructuredToParsed, createDefaultItem } from "./schema-utils";
import type { PropSchema, ParsedItemType, ParsedField, EditorType } from "./types";

import styles from "./array-field-editor.module.less";

function inferEditorFromParsedField(field: ParsedField): EditorType {
  if (field.editor) {
    return field.editor;
  }
  switch (field.type) {
    case "string":
      return "input";
    case "number":
      return "number";
    case "boolean":
      return "switch";
    case "array":
      return "array";
    case "object":
      return "object";
    default:
      return "input";
  }
}

export const ArrayFieldEditor = defineComponent({
  name: "ArrayFieldEditor",
  props: {
    value: {
      type: Array as PropType<unknown[]>,
      default: () => [],
    },
    itemType: {
      type: [String, Object] as PropType<string | Record<string, PropSchema>>,
      default: undefined,
    },
    label: {
      type: String,
      default: "",
    },
  },
  emits: ["update"],
  setup(props, { emit }) {
    // 解析 itemType 为统一的 ParsedItemType
    const parsedItemType = computed<ParsedItemType | null>(() => {
      if (typeof props.itemType === "object" && props.itemType !== null) {
        return convertStructuredToParsed(props.itemType);
      }
      if (typeof props.itemType === "string") {
        return parseItemTypeString(props.itemType);
      }
      return null;
    });

    // 展开的项索引（默认全部折叠）
    const expandedIndices = ref<Set<number>>(new Set());

    const expandAll = (): void => {
      expandedIndices.value = new Set(props.value.map((_, i) => i));
    };

    const collapseAll = (): void => {
      expandedIndices.value = new Set();
    };

    const toggleExpand = (index: number): void => {
      const newSet = new Set(expandedIndices.value);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      expandedIndices.value = newSet;
    };

    const addItem = (): void => {
      const newItem = createDefaultItem(parsedItemType.value);
      const newArr = [...props.value, newItem];
      emit("update", newArr);
      expandedIndices.value = new Set([...expandedIndices.value, props.value.length]);
    };

    const removeItem = (index: number): void => {
      const newArr = [...props.value];
      newArr.splice(index, 1);
      emit("update", newArr);
      // 同步更新展开状态：删除位置之后的索引前移
      const newSet = new Set<number>();
      for (const idx of expandedIndices.value) {
        if (idx < index) {
          newSet.add(idx);
        } else if (idx > index) {
          newSet.add(idx - 1);
        }
      }
      expandedIndices.value = newSet;
    };

    const moveItem = (index: number, direction: -1 | 1): void => {
      const newIndex = index + direction;
      if (newIndex < 0 || newIndex >= props.value.length) {
        return;
      }
      const newArr = [...props.value];
      [newArr[index], newArr[newIndex]] = [newArr[newIndex], newArr[index]];
      emit("update", newArr);
      // 同步更新展开状态：交换两个位置的展开状态
      const newSet = new Set(expandedIndices.value);
      const isIndexExpanded = newSet.has(index);
      const isNewIndexExpanded = newSet.has(newIndex);
      if (isIndexExpanded && !isNewIndexExpanded) {
        newSet.delete(index);
        newSet.add(newIndex);
      } else if (!isIndexExpanded && isNewIndexExpanded) {
        newSet.add(index);
        newSet.delete(newIndex);
      }
      expandedIndices.value = newSet;
    };

    const updatePrimitiveItem = (index: number, value: unknown): void => {
      const newArr = [...props.value];
      newArr[index] = value;
      emit("update", newArr);
    };

    const updateObjectItemField = (index: number, fieldName: string, value: unknown): void => {
      const newArr = [...props.value];
      const item = newArr[index];
      if (typeof item === "object" && item !== null && !Array.isArray(item)) {
        newArr[index] = { ...(item as Record<string, unknown>), [fieldName]: value };
      }
      emit("update", newArr);
    };

    /** 判断字段是否满足 showIf 条件 */
    const shouldShowField = (field: ParsedField, itemValue: Record<string, unknown>): boolean => {
      if (!field.showIf) {
        return true;
      }
      const depValue = itemValue[field.showIf.field];
      if (field.showIf.equals !== undefined) {
        return depValue === field.showIf.equals;
      }
      if (field.showIf.in !== undefined) {
        return field.showIf.in.includes(depValue as string | number | boolean);
      }
      return true;
    };

    // 获取列表项摘要文本
    const getItemSummary = (item: unknown, index: number): string => {
      const parsed = parsedItemType.value;
      if (!parsed) {
        return `${index + 1}. 项`;
      }
      if (parsed.kind === "primitive") {
        const text = String(item ?? "").slice(0, 40);
        return `${index + 1}. ${text || "（空）"}`;
      }
      // object: 取第一个简单类型（非 object/array）且有值的字段作为摘要
      const obj = item as Record<string, unknown>;
      const fieldNames = Object.keys(parsed.fields || {});
      for (const name of fieldNames) {
        const val = obj?.[name];
        if (val !== undefined && val !== "" && val !== null && typeof val !== "object") {
          const text = String(val).slice(0, 40);
          return `${index + 1}. ${text}`;
        }
      }
      return `${index + 1}. 新项`;
    };

    /**
     * 渲染单个表单控件（支持递归，优先使用 field.editor）
     */
    const renderControl = (field: ParsedField, value: unknown, onUpdate: (v: unknown) => void): JSX.Element => {
      const editorType = inferEditorFromParsedField(field);
      const placeholder = field.placeholder || `请输入${field.label}`;

      // 基础控件走 FieldControl
      switch (editorType) {
        case "textarea":
        case "number":
        case "switch":
        case "select":
        case "color":
        case "image":
        case "input":
          return (
            <FieldControl
              editor={editorType}
              value={value}
              label={field.label}
              placeholder={placeholder}
              options={field.options}
              onUpdate={onUpdate}
            />
          );
        case "array": {
          const arrVal = Array.isArray(value) ? value : [];
          if (!field.arrayItemType) {
            return <div style={{ color: "#ff4d4f", fontSize: "12px" }}>缺少数组项类型定义，无法编辑</div>;
          }
          return (
            <ArrayFieldEditor
              value={arrVal}
              itemType={field.arrayItemType}
              label={field.label}
              onUpdate={(newArr: unknown[]) => onUpdate(newArr)}
            />
          );
        }
        case "object": {
          const objVal = typeof value === "object" && value !== null && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
          return (
            <div
              style={{
                marginTop: "4px",
                padding: "8px",
                background: "#fafafa",
                borderRadius: "4px",
                border: "1px solid #f0f0f0",
              }}
            >
              <div style={{ fontSize: "12px", color: "#666", marginBottom: "8px", fontWeight: 500 }}>{field.label}</div>
              {Object.entries(field.fields || {}).map(([subName, subField]) => (
                <div key={subName} style={{ marginBottom: "8px" }}>
                  <div style={{ fontSize: "12px", color: "#555", marginBottom: "2px" }}>
                    {subField.label}
                    {!subField.optional && <span style={{ color: "#ff4d4f" }}> *</span>}
                  </div>
                  {renderControl(subField, objVal[subName], (v) => {
                    onUpdate({ ...objVal, [subName]: v });
                  })}
                </div>
              ))}
            </div>
          );
        }
        default:
          return <FieldControl editor="input" value={value} label={field.label} placeholder={placeholder} onUpdate={onUpdate} />;
      }
    };

    // 渲染数组项对象中的单个字段
    const renderFieldEditor = (
      fieldName: string,
      field: ParsedField,
      itemValue: Record<string, unknown>,
      itemIndex: number,
    ): JSX.Element => {
      const val = itemValue[fieldName];
      return renderControl(field, val, (v) => updateObjectItemField(itemIndex, fieldName, v));
    };

    // 渲染 primitive 数组项的编辑器
    const renderPrimitiveEditor = (item: unknown, index: number): JSX.Element => {
      const parsed = parsedItemType.value;
      const pType = parsed?.primitiveType;

      switch (pType) {
        case "number":
          return (
            <FieldControl editor="number" value={typeof item === "number" ? item : 0} onUpdate={(v) => updatePrimitiveItem(index, v)} />
          );
        case "boolean":
          return <FieldControl editor="switch" value={Boolean(item)} onUpdate={(v) => updatePrimitiveItem(index, v)} />;
        case "string":
        default:
          return <FieldControl editor="input" value={String(item ?? "")} onUpdate={(v) => updatePrimitiveItem(index, v)} />;
      }
    };

    return (): JSX.Element => {
      const parsed = parsedItemType.value;
      const arr = props.value;

      return (
        <div class={styles.container}>
          {arr.length > 0 && (
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginBottom: "8px" }}>
              <Button type="link" size="small" onClick={expandAll}>
                展开全部
              </Button>
              <Button type="link" size="small" onClick={collapseAll}>
                折叠全部
              </Button>
            </div>
          )}
          {arr.length === 0 ? (
            <Empty description="暂无数据" style={{ margin: "12px 0" }} />
          ) : (
            arr.map((item, index) => {
              const isExpanded = expandedIndices.value.has(index);
              return (
                <div key={index} class={styles.itemCard}>
                  {/* Header */}
                  <div class={styles.itemHeader} onClick={() => toggleExpand(index)}>
                    <span class={styles.itemSummary}>{getItemSummary(item, index)}</span>
                    <div class={styles.itemActions} onClick={(e: MouseEvent) => e.stopPropagation()}>
                      <Button
                        type="text"
                        size="small"
                        disabled={index === 0}
                        onClick={() => moveItem(index, -1)}
                        v-slots={{ icon: () => <UpOutlined /> }}
                      />
                      <Button
                        type="text"
                        size="small"
                        disabled={index === arr.length - 1}
                        onClick={() => moveItem(index, 1)}
                        v-slots={{ icon: () => <DownOutlined /> }}
                      />
                      <PopConfirm title="确认删除此项？" onConfirm={() => removeItem(index)}>
                        <Button type="text" size="small" danger v-slots={{ icon: () => <DeleteOutlined /> }} />
                      </PopConfirm>
                    </div>
                  </div>

                  {/* Body */}
                  {isExpanded && (
                    <div class={styles.itemBody}>
                      {parsed === null ? (
                        <div style={{ color: "#ff4d4f", fontSize: "12px", padding: "4px 0" }}>字段定义解析失败，无法编辑此项</div>
                      ) : parsed?.kind === "primitive" ? (
                        <div style={{ padding: "4px 0" }}>{renderPrimitiveEditor(item, index)}</div>
                      ) : parsed?.kind === "object" ? (
                        Object.entries(parsed.fields || {})
                          .filter(([_, field]) => shouldShowField(field, item as Record<string, unknown>))
                          .map(([fieldName, field]) => (
                            <div key={fieldName} class={styles.fieldRow}>
                              <div class={styles.fieldLabel}>
                                {field.label}
                                {!field.optional && <span class={styles.requiredMark}> *</span>}
                              </div>
                              {renderFieldEditor(fieldName, field, item as Record<string, unknown>, index)}
                            </div>
                          ))
                      ) : null}
                    </div>
                  )}
                </div>
              );
            })
          )}

          <Button type="dashed" block onClick={addItem} class={styles.addButton}>
            <PlusOutlined /> 添加项
          </Button>
        </div>
      );
    };
  },
});
