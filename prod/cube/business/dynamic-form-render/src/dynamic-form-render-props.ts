import type { Component } from "vue";

export interface DynamicFormRenderOptionProps {
  /** 表单布局宽度 */
  width?: number;
  /** 表单标题 */
  title: string;
  /** 表单键 */
  key: string | number;
  /** 表单组件名称 */
  componentName?: string;
  /** 表单组件属性 */
  componentProps?: any;
  /** 只读属性 */
  readonly?: boolean;
  /** 隐藏属性 */
  hidden?: boolean;
  /** 必填属性 */
  required?: boolean;
  /** 自定义注入组件 */
  customComponent?: Component | undefined;
  /** 自定义外层样式 */
  customClass?: string;
  /** 隐藏label */
  hiddenLabel?: boolean;
  /** 移除label */
  removeLabel?: boolean;
  /** 依赖参数 */
  dependentParams?: string[];
  /** 数据类型 */
  dataType?: string;
}
