import { defineComponent, ref, watch, type PropType } from "vue";
import { Button, message } from "@ghcloud/cube-ui";
import type { ComponentSchema, ComponentInstance, PropSchema } from "./types";
import { formatArrayForEdit, inferEditorType, tryParseJson, parseItemTypeString } from "./schema-utils";
import { ArrayFieldEditor } from "./array-field-editor";
import { FieldControl } from "./field-control";

export const DynamicForm = defineComponent({
  props: {
    instance: {
      type: Object as PropType<ComponentInstance | null>,
      default: null,
    },
    schema: {
      type: Object as PropType<ComponentSchema | null>,
      default: null,
    },
  },
  emits: ["update"],
  setup(props, { emit }) {
    // 本地编辑状态，用于 json 类型的 textarea
    const localArrayValues = ref<Record<string, string>>({});

    watch(
      () => props.instance,
      (newInstance) => {
        if (newInstance && props.schema) {
          const newLocal: Record<string, string> = {};
          for (const [key, propSchema] of Object.entries(props.schema.props)) {
            if (propSchema.type === "array") {
              const val = newInstance.props[key];
              newLocal[key] = formatArrayForEdit(Array.isArray(val) ? val : []);
            }
          }
          localArrayValues.value = newLocal;
        }
      },
      { immediate: true },
    );

    const updateProp = (key: string, value: unknown): void => {
      if (!props.instance) {
        return;
      }
      const newProps = { ...props.instance.props, [key]: value };
      emit("update", newProps);
    };

    const handleArrayBlur = (key: string): void => {
      const text = localArrayValues.value[key] ?? "";
      const parsed = tryParseJson(text);
      if (parsed === null && text.trim() !== "") {
        message.error(`字段 ${key} 的 JSON 格式不正确`);
        return;
      }
      updateProp(key, parsed ?? []);
    };

    /**
     * 渲染单个字段的编辑器控件（支持递归：object 类型会递归渲染子字段）
     */
    const renderFieldControl = (
      fieldName: string,
      propSchema: PropSchema,
      value: unknown,
      onUpdate: (val: unknown) => void,
    ): JSX.Element => {
      const editorType = inferEditorType(fieldName, propSchema);
      const placeholder = propSchema.placeholder || `请输入 ${propSchema.label}`;

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
              label={propSchema.label}
              placeholder={placeholder}
              options={propSchema.options}
              onUpdate={onUpdate}
            />
          );
        case "array": {
          const arrValue = Array.isArray(value) ? value : [];
          return (
            <ArrayFieldEditor
              value={arrValue}
              itemType={propSchema.itemType}
              label={propSchema.label}
              onUpdate={(val: unknown[]) => onUpdate(val)}
            />
          );
        }
        case "object": {
          const objValue =
            typeof value === "object" && value !== null && !Array.isArray(value)
              ? (value as Record<string, unknown>)
              : {};
          let objSchema: unknown = propSchema.itemType;

          // 如果 itemType 是字符串，尝试解析为结构化对象
          if (typeof objSchema === "string") {
            const parsed = parseItemTypeString(objSchema);
            if (parsed && parsed.kind === "object" && parsed.fields) {
              const structured: Record<string, PropSchema> = {};
              for (const [k, v] of Object.entries(parsed.fields)) {
                structured[k] = {
                  type: v.type,
                  required: !v.optional,
                  label: v.label,
                  editor: v.editor,
                  options: v.options,
                  placeholder: v.placeholder,
                };
              }
              objSchema = structured;
            } else {
              return <div style={{ color: "#999", fontSize: "12px" }}>（字段定义无法解析）</div>;
            }
          }

          if (typeof objSchema !== "object" || objSchema === null) {
            return <div style={{ color: "#999", fontSize: "12px" }}>（缺少字段定义）</div>;
          }
          return (
            <div
              style={{
                padding: "12px",
                background: "#fafafa",
                borderRadius: "4px",
                border: "1px solid #f0f0f0",
              }}
            >
              {Object.entries(objSchema as Record<string, PropSchema>).map(([subKey, subSchema]) => (
                <div key={subKey} style={{ marginBottom: "12px" }}>
                  <div style={{ marginBottom: "4px", fontSize: "12px", color: "#555" }}>
                    {subSchema.label}
                    {subSchema.required && <span style={{ color: "#ff4d4f" }}> *</span>}
                  </div>
                  {renderFieldControl(subKey, subSchema, objValue[subKey], (v) => {
                    onUpdate({ ...objValue, [subKey]: v });
                  })}
                </div>
              ))}
            </div>
          );
        }
        case "json":
          return (
            <textarea
              class="ant-input"
              value={localArrayValues.value[fieldName] ?? "[]"}
              onInput={(e: Event) => {
                localArrayValues.value = { ...localArrayValues.value, [fieldName]: (e.target as HTMLTextAreaElement).value };
              }}
              onBlur={() => {
                const text = localArrayValues.value[fieldName] ?? "";
                const parsed = tryParseJson(text);
                if (parsed === null && text.trim() !== "") {
                  message.error(`字段 ${fieldName} 的 JSON 格式不正确`);
                  return;
                }
                onUpdate(parsed ?? []);
              }}
              rows={6}
              placeholder={`请输入 JSON 数组格式`}
            />
          );
        default:
          return (
            <FieldControl
              editor="input"
              value={value}
              label={propSchema.label}
              placeholder={placeholder}
              onUpdate={onUpdate}
            />
          );
      }
    };

    return (): JSX.Element => {
      const { instance, schema } = props;
      if (!instance || !schema) {
        return <div style={{ padding: "20px", color: "#999", textAlign: "center" }}>请选择一个组件进行配置</div>;
      }

      return (
        <div>
          {Object.entries(schema.props).map(([key, propSchema]) => {
            const value = instance.props[key];
            const editorType = inferEditorType(key, propSchema);

            // 系统字段：只读提示，不渲染编辑器
            if (propSchema.system) {
              return (
                <div key={key} style={{ marginBottom: "16px" }}>
                  <div style={{ marginBottom: "4px", fontSize: "13px", color: "#333" }}>
                    {propSchema.label}
                    {propSchema.required && <span style={{ color: "#ff4d4f" }}> *</span>}
                    <span style={{ color: "#999", fontSize: "11px", marginLeft: "6px" }}>(系统字段)</span>
                  </div>
                  <div style={{ padding: "8px 12px", background: "#f5f5f5", borderRadius: "4px", fontSize: "12px", color: "#888" }}>
                    {propSchema.description || "此字段数据由后台管理，请在对应模块中配置"}
                  </div>
                </div>
              );
            }

            // switch 类型的 label 放在左侧，其他放在上方
            if (editorType === "switch") {
              return (
                <div key={key} style={{ marginBottom: "16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: "13px", color: "#333" }}>
                    {propSchema.label}
                    {propSchema.required && <span style={{ color: "#ff4d4f" }}> *</span>}
                  </span>
                  {renderFieldControl(key, propSchema, value, (val) => updateProp(key, val))}
                </div>
              );
            }

            return (
              <div key={key} style={{ marginBottom: "16px" }}>
                <div style={{ marginBottom: "4px", fontSize: "13px", color: "#333" }}>
                  {propSchema.label}
                  {propSchema.required && <span style={{ color: "#ff4d4f" }}> *</span>}
                  {editorType === "json" && (
                    <span style={{ color: "#999", fontSize: "11px", marginLeft: "4px" }}>(JSON 数组格式)</span>
                  )}
                </div>
                {renderFieldControl(key, propSchema, value, (val) => updateProp(key, val))}
              </div>
            );
          })}
        </div>
      );
    };
  },
});
