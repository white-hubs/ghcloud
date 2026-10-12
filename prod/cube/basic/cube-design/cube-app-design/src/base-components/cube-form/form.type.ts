import type { Component, HtmlHTMLAttributes } from 'vue'
import type { RuleObject } from '@ghcloud/cube-ui'
import type { CubeQueryStateApi, CubeQueryState } from '../../hooks/use-cube-query-state'
export type CustomRenderType = (() => Component | string) | string
export type MaybeComponentPropKey =
  | 'options'
  | 'placeholder'
  | 'title'
  | keyof HtmlHTMLAttributes
  | (Record<never, never> & string)
  | 'onChange'
export type MaybeComponentProps = Partial<Record<MaybeComponentPropKey, unknown>>
type RenderComponentContentType = (
  value: Partial<Record<string, unknown>>,
) => Record<string, unknown>
export interface FormValueChangeMeta {
  fieldName: string;
  component: string;
  trigger: 'change' | 'enter';
  hasCustomOnChange?: boolean;
}
export interface SchemaProp {
  // 组件
  component: string | Component;
  // 字段名
  fieldName: string;
  label: string;
  /** 组件属性 */
  componentProps?: MaybeComponentProps;
  /** 默认值 */
  defaultValue?: unknown;
  /** 自定义组件内部渲染 */
  renderComponentContent?: RenderComponentContentType;
  /** 字段规则（与 ant-design-vue Form.Item 一致，可为单条或多条） */
  rules?: RuleObject | RuleObject[];
  /** 后缀 */
  suffix?: CustomRenderType;
  /** 前缀 */
  prefix?: CustomRenderType;
  style?: Record<string, unknown>;
}
export interface FormApiOptions extends FormState {
  handleSubmit: (values: Record<string, unknown>) => void;
  handleReset?: () => void;
  handleValuesChange?: (values: Record<string, unknown>, changedValues?: Record<string, unknown>, meta?: FormValueChangeMeta) => void;
  getValues?: (values: Record<string, unknown>) => Record<string, unknown>;
  listState?: {
    mode?: 'full' | 'restoreOnly';
    routeName: string;
    state: Record<string, string | number | boolean | null | undefined>;
    fields: string[];
    restore?: (state: Record<string, string | number | boolean | null | undefined>) => Record<string, unknown>;
  };
  cache?: boolean;
  cacheFields?: string[];
  cacheOnChange?: boolean;
  queryState?: CubeQueryStateApi<CubeQueryState>;
  queryStateFields?: string[];
  mapFormValuesToQueryState?: (values: Record<string, unknown>) => Partial<CubeQueryState>;
  mapQueryStateToFormValues?: (state: CubeQueryState) => Record<string, unknown>;
  syncStateRef?: Record<string, unknown>;
  syncStateFields?: string[];
  syncMap?: (formValues: Record<string, unknown>) => Record<string, unknown>;
  onHydratedQuery?: () => void;
  autoQueryPageNumberField?: string;
  autoQueryPageSizeField?: string;
  autoQueryDefaultPageNumber?: number;
  autoQueryDefaultPageSize?: number;
}
export interface FormState {
  layout: 'horizontal' | 'vertical' | 'inline';
  labelCol?: Record<string, unknown>;
  schema: SchemaProp[];
  submitText?: string;
  resetText?: string;
  showButton?: boolean;
  isCollapsed?: boolean;
  showCollapseButton?: boolean;
}
