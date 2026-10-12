/**
 * 设计器核心类型定义
 */

/** Select 选项 */
export interface SelectOption {
  label: string;
  value: string | number | boolean;
}

/** 字段显示条件：当指定字段的值等于/包含指定值时显示 */
export interface ShowIfCondition {
  /** 依赖的字段名 */
  field: string;
  /** 期望的值（严格相等） */
  equals?: string | number | boolean;
  /** 期望的值列表（任一匹配） */
  in?: (string | number | boolean)[];
}

/** 解析后的 itemType 字段定义 */
export interface ParsedField {
  type: "string" | "number" | "boolean" | "array" | "object";
  optional: boolean;
  label: string;
  /** 当 type === 'array' 时，嵌套数组的 itemType */
  arrayItemType?: string | Record<string, PropSchema>;
  /** 当 type === 'object' 时，嵌套对象的字段定义 */
  fields?: Record<string, ParsedField>;
  /** 字段使用的编辑器类型 */
  editor?: EditorType;
  /** select 编辑器的选项 */
  options?: SelectOption[];
  placeholder?: string;
  /** 条件显示规则 */
  showIf?: ShowIfCondition;
}

/** 解析后的 itemType 整体定义 */
export interface ParsedItemType {
  kind: "primitive" | "object";
  /** primitive 类型时的具体类型 */
  primitiveType?: "string" | "number" | "boolean";
  /** object 类型时的字段定义 */
  fields?: Record<string, ParsedField>;
}

/** schema 中单个 prop 的定义 */
export interface PropSchema {
  type: "string" | "number" | "boolean" | "array" | "object";
  required: boolean;
  label: string;
  defaultValue?: unknown;
  itemType?: string | Record<string, PropSchema>;
  /** 显式指定编辑器类型，优先级高于 inferEditorType 推断 */
  editor?: EditorType;
  /** select 编辑器的选项列表 */
  options?: readonly SelectOption[];
  placeholder?: string;
  /** 是否为系统字段（数据由后台管理，设计器中只读显示） */
  system?: boolean;
  /** 条件显示规则 */
  showIf?: ShowIfCondition;
}

/** 组件 schema 定义 */
export interface ComponentSchema {
  name: string;
  title: string;
  description: string;
  interactive: boolean;
  props: Record<string, PropSchema>;
}

/** 组件实例（页面/布局配置中的组件描述） */
export interface ComponentInstance {
  name: string;
  props: Record<string, unknown>;
}

/** 组件注册项（包含 schema 信息） */
export interface ComponentRegistryItem {
  name: string;
  title: string;
  description: string;
  category?: string;
  interactive: boolean;
  schema: ComponentSchema;
}

/** 页面内容配置 */
export interface PageContentConfig {
  path: string;
  layout: string;
  meta?: {
    title?: string;
    description?: string;
    keywords?: string;
    navStyle?: string;
    ogImage?: string;
  };
  components: ComponentInstance[];
}

/** 布局配置 */
export interface LayoutConfig {
  name: string;
  slot: string;
  components: ComponentInstance[];
}

/** 设计器模式 */
export type DesignerMode = "page" | "layout";

/** 设计器内部状态 */
export interface DesignerState {
  components: ComponentInstance[];
  selectedIndex: number | null;
}

/** 表单编辑器类型 */
export type EditorType = "input" | "textarea" | "number" | "switch" | "json" | "array" | "select" | "color" | "image" | "object";

/** 推断的 prop 编辑器配置 */
export interface PropEditorConfig {
  type: EditorType;
  label: string;
  required: boolean;
  defaultValue?: unknown;
}
