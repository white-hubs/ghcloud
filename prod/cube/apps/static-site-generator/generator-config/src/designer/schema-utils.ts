import type { PropSchema, ComponentSchema, ComponentInstance, EditorType, PropEditorConfig, ParsedItemType, ParsedField } from "./types";

/**
 * 将字符串 itemType 解析为结构化定义
 * 支持：'string' | 'number' | 'boolean' | '{a: string, b?: number}' | '{items: string[]}'
 * 不支持：'[][]'（二维数组）、无法解析的字符串 → 返回 null
 */
export function parseItemTypeString(itemType: string): ParsedItemType | null {
  const trimmed = itemType.trim();

  // 不支持二维数组
  if (trimmed.includes("[][]")) {
    return null;
  }

  // Primitive types: string | number | boolean (optional trailing [])
  const primitiveMatch = trimmed.match(/^(string|number|boolean)(\[\])?$/);
  if (primitiveMatch) {
    return {
      kind: "primitive",
      primitiveType: primitiveMatch[1] as "string" | "number" | "boolean",
    };
  }

  // Object type: { field1: type1, field2?: type2 }
  const objMatch = trimmed.match(/^\{(.+)\}$/s);
  if (!objMatch) {
    return null;
  }

  const inner = objMatch[1].trim();
  const fields: Record<string, ParsedField> = {};

  const fieldStrs = splitByTopLevelCommas(inner);
  for (const fieldStr of fieldStrs) {
    const parsed = parseField(fieldStr.trim());
    if (!parsed) {
      return null;
    }
    fields[parsed.name] = parsed.schema;
  }

  return { kind: "object", fields };
}

/** 按顶层逗号分割（忽略嵌套花括号/方括号/引号内的逗号） */
function splitByTopLevelCommas(str: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let current = "";
  let inString = false;
  let stringChar = "";

  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    const prevChar = i > 0 ? str[i - 1] : "";

    if (!inString && (char === '"' || char === "'")) {
      inString = true;
      stringChar = char;
      current += char;
    } else if (inString && char === stringChar && prevChar !== "\\") {
      inString = false;
      stringChar = "";
      current += char;
    } else if (!inString) {
      if (char === "{" || char === "[") {
        depth++;
        current += char;
      } else if (char === "}" || char === "]") {
        depth--;
        current += char;
      } else if (char === "," && depth === 0) {
        parts.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    } else {
      current += char;
    }
  }

  if (current.trim()) {
    parts.push(current.trim());
  }

  return parts;
}

/** 解析单个字段：name: type 或 name?: type */
function parseField(fieldStr: string): { name: string; schema: ParsedField } | null {
  // 匹配：name: type 或 name?: type
  const match = fieldStr.match(/^([a-zA-Z_$][a-zA-Z0-9_$]*)\??:\s*(.+)$/);
  if (!match) {
    return null;
  }

  const name = match[1];
  const typeStr = match[2].trim();
  const optional = fieldStr.includes("?:");

  // Check if it's an array type: xxx[]
  const arrayMatch = typeStr.match(/^(.+)\[\]$/);
  if (arrayMatch) {
    const innerType = arrayMatch[1].trim();
    return {
      name,
      schema: {
        type: "array",
        optional,
        label: capitalize(name),
        arrayItemType: innerType,
      },
    };
  }

  // Nested object type: { a: string, b: number }
  if (typeStr.startsWith("{") && typeStr.endsWith("}")) {
    const nested = parseItemTypeString(typeStr);
    if (nested && nested.kind === "object" && nested.fields) {
      return {
        name,
        schema: {
          type: "object",
          optional,
          label: capitalize(name),
          fields: nested.fields,
        },
      };
    }
    // 嵌套对象解析失败 → 降级为 string
    return {
      name,
      schema: {
        type: "string",
        optional,
        label: capitalize(name),
      },
    };
  }

  // Simple types
  if (typeStr === "string" || typeStr === "number" || typeStr === "boolean") {
    return {
      name,
      schema: {
        type: typeStr,
        optional,
        label: capitalize(name),
      },
    };
  }

  // Literal union like "dark" | "light" → treat as string
  if (typeStr.includes('"') || typeStr.includes("'")) {
    return {
      name,
      schema: {
        type: "string",
        optional,
        label: capitalize(name),
      },
    };
  }

  // Unknown type → fallback to string
  return {
    name,
    schema: {
      type: "string",
      optional,
      label: capitalize(name),
    },
  };
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * 将结构化 itemType（Record<string, PropSchema>）转为 ParsedItemType
 */
export function convertStructuredToParsed(structured: Record<string, PropSchema>): ParsedItemType {
  const fields: Record<string, ParsedField> = {};
  for (const [name, schema] of Object.entries(structured)) {
    const field: ParsedField = {
      type: schema.type,
      optional: !schema.required,
      label: schema.label || capitalize(name),
      editor: schema.editor,
      options: schema.options,
      placeholder: schema.placeholder,
      showIf: schema.showIf,
    };
    if (schema.type === "array" && schema.itemType !== undefined) {
      field.arrayItemType = schema.itemType;
    }
    if (schema.type === "object" && schema.itemType !== undefined) {
      if (typeof schema.itemType === "object" && schema.itemType !== null) {
        const nested = convertStructuredToParsed(schema.itemType as Record<string, PropSchema>);
        field.fields = nested.fields;
      } else {
        field.arrayItemType = schema.itemType;
      }
    }
    fields[name] = field;
  }
  return { kind: "object", fields };
}

/**
 * 根据 ParsedItemType 创建默认数组项
 */
export function createDefaultItem(parsed: ParsedItemType | null): unknown {
  if (!parsed) {
    return {};
  }

  if (parsed.kind === "primitive") {
    switch (parsed.primitiveType) {
      case "string":
        return "";
      case "number":
        return 0;
      case "boolean":
        return false;
    }
  }

  // object
  return createDefaultObject(parsed.fields || {});
}

/**
 * 根据 ParsedField 映射创建默认对象
 */
function createDefaultObject(fields: Record<string, ParsedField>): Record<string, unknown> {
  const obj: Record<string, unknown> = {};
  for (const [name, field] of Object.entries(fields)) {
    if (field.type === "array") {
      obj[name] = [];
    } else if (field.type === "string") {
      obj[name] = "";
    } else if (field.type === "number") {
      obj[name] = 0;
    } else if (field.type === "boolean") {
      obj[name] = false;
    } else if (field.type === "object" && field.fields) {
      obj[name] = createDefaultObject(field.fields);
    }
  }
  return obj;
}

/**
 * 根据单个 prop schema 获取默认值
 */
export function getPropDefaultValue(propSchema: PropSchema): unknown {
  if ("defaultValue" in propSchema && propSchema.defaultValue !== undefined) {
    return propSchema.defaultValue;
  }

  switch (propSchema.type) {
    case "string":
      return "";
    case "number":
      return 0;
    case "boolean":
      return false;
    case "array":
      return [];
    case "object":
      return {};
    default:
      return undefined;
  }
}

/**
 * 根据组件 schema 生成完整的默认 props 对象
 */
export function getDefaultProps(schema: ComponentSchema): Record<string, unknown> {
  const props: Record<string, unknown> = {};
  for (const [key, propSchema] of Object.entries(schema.props)) {
    props[key] = getPropDefaultValue(propSchema);
  }
  return props;
}

/**
 * 创建组件实例
 */
export function createComponentInstance(name: string, schema: ComponentSchema, overrides?: Record<string, unknown>): ComponentInstance {
  const instance: ComponentInstance = {
    name,
    props: { ...getDefaultProps(schema), ...overrides },
  };
  return instance;
}

/**
 * 判断字符串字段是否应该使用 Textarea
 */
function isLongTextField(fieldName: string): boolean {
  const textareaKeywords = ["content", "html", "description", "script", "code", "text", "detail", "summary"];
  const lower = fieldName.toLowerCase();
  return textareaKeywords.some((kw) => lower.includes(kw));
}

/**
 * 推断 prop 应该使用哪种表单编辑器
 * 优先使用 schema 中显式指定的 editor，无则走启发式推断
 */
export function inferEditorType(fieldName: string, propSchema: PropSchema): EditorType {
  // 如果 schema 显式指定了 editor，直接使用
  if (propSchema.editor) {
    return propSchema.editor;
  }

  switch (propSchema.type) {
    case "string":
      return isLongTextField(fieldName) ? "textarea" : "input";
    case "number":
      return "number";
    case "boolean":
      return "switch";
    case "array": {
      const itemType = propSchema.itemType;
      if (typeof itemType === "object" && itemType !== null) {
        return "array";
      }
      if (typeof itemType === "string") {
        const parsed = parseItemTypeString(itemType);
        if (parsed !== null) {
          return "array";
        }
      }
      return "json";
    }
    case "object":
      return "object";
    default:
      return "input";
  }
}

/**
 * 获取 prop 的编辑器配置
 */
export function getPropEditorConfig(fieldName: string, propSchema: PropSchema): PropEditorConfig {
  return {
    type: inferEditorType(fieldName, propSchema),
    label: propSchema.label,
    required: propSchema.required,
    defaultValue: getPropDefaultValue(propSchema),
  };
}

/**
 * 尝试将值解析为 JSON（用于 array 类型的 textarea 编辑）
 * 返回解析结果或 null
 */
export function tryParseJson(value: string): unknown[] | null {
  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * 将数组格式化为可读的 JSON 字符串（用于 textarea 展示）
 */
export function formatArrayForEdit(value: unknown[]): string {
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return JSON.stringify(value);
  }
}

/**
 * 深拷贝组件实例
 */
export function cloneComponentInstance(instance: ComponentInstance): ComponentInstance {
  return {
    name: instance.name,
    props: deepClone(instance.props),
  };
}

/**
 * 简单的深拷贝
 */
function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== "object") {
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map(deepClone) as unknown as T;
  }
  const cloned: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
    cloned[key] = deepClone(value);
  }
  return cloned as T;
}

/**
 * 校验组件实例的 props 是否符合 schema（基础校验）
 * 返回缺失的必填字段列表
 */
export function validateInstanceProps(instance: ComponentInstance, schema: ComponentSchema): string[] {
  const missing: string[] = [];
  for (const [key, propSchema] of Object.entries(schema.props)) {
    if (propSchema.required) {
      const value = instance.props[key];
      if (value === undefined || value === null || value === "") {
        missing.push(propSchema.label || key);
      }
    }
  }
  return missing;
}
