import type {
  CreateVisualProjectParams,
  UpdateVisualProjectParams,
  VisualModelConfigurationPayload,
  VisualModelConfigurationResult,
  VisualProject,
} from "./request";

/**
 * 可视化配置服务契约。
 * 前端经 `/gw-bff/visualization/*` 调用。
 */
export interface VisualizationGateway {
  /** 查询当前租户全部可视化项目 */
  listVisualProjects: () => Promise<VisualProject[]>;

  /** 新增项目 */
  createVisualProject: (params: CreateVisualProjectParams) => Promise<unknown>;

  /** 更新项目 */
  updateVisualProject: (params: UpdateVisualProjectParams) => Promise<unknown>;

  /** 删除项目 */
  deleteVisualProject: (id: string) => Promise<void>;

  /** 复制项目 */
  copyVisualProject: (id: string) => Promise<void>;

  /** 查询项目模型配置 JSON */
  getVisualModelConfiguration: (projectId: string) => Promise<VisualModelConfigurationResult>;

  /** 保存项目模型配置 JSON */
  saveVisualModelConfiguration: (params: VisualModelConfigurationPayload) => Promise<unknown>;
}
