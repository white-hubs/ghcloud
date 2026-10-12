import type {
  BindVisualPropertiesParams,
  BindVisualRiskSourcesParams,
  ListBoundPropertiesParams,
  ListBoundRiskSourcesParams,
  ListPropertyClassifyParams,
  ListUnboundPropertiesParams,
  ListUnboundRiskSourcesParams,
  PropertyClassifyPageResult,
  PropertyPageResult,
  RiskSourcePageResult,
  UnbindVisualPropertiesParams,
  UnbindVisualRiskSourcesParams,
} from "./request";

/**
 * 资产 / 风险源可视化关联契约。
 * 前端经 `/api/property/*` 调用。
 */
export interface PropertyGateway {
  /** 资产类型分页 */
  listPropertyClassifies: (params: ListPropertyClassifyParams) => Promise<PropertyClassifyPageResult>;

  /** 场景已关联资产分页 */
  listBoundProperties: (params: ListBoundPropertiesParams) => Promise<PropertyPageResult>;

  /** 场景未关联资产分页（添加弹窗） */
  listUnboundProperties: (params: ListUnboundPropertiesParams) => Promise<PropertyPageResult>;

  /** 绑定资产到场景 */
  bindVisualProperties: (params: BindVisualPropertiesParams) => Promise<unknown>;

  /** 解绑场景资产 */
  unbindVisualProperties: (params: UnbindVisualPropertiesParams) => Promise<unknown>;

  /** 场景已关联风险源分页 */
  listBoundRiskSources: (params: ListBoundRiskSourcesParams) => Promise<RiskSourcePageResult>;

  /** 场景未关联风险源分页（添加弹窗） */
  listUnboundRiskSources: (params: ListUnboundRiskSourcesParams) => Promise<RiskSourcePageResult>;

  /** 绑定风险源到场景 */
  bindVisualRiskSources: (params: BindVisualRiskSourcesParams) => Promise<unknown>;

  /** 解绑场景风险源 */
  unbindVisualRiskSources: (params: UnbindVisualRiskSourcesParams) => Promise<unknown>;
}
