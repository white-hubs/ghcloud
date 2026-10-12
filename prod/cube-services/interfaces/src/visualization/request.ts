/** 可视化项目 */
export interface VisualProject {
  id: string;
  projectName: string;
  canvas: string;
  mainStructure: string;
}

export interface CreateVisualProjectParams {
  projectName: string;
  canvas: string;
  mainStructure: string;
}

export interface UpdateVisualProjectParams extends CreateVisualProjectParams {
  id: string;
}

/** 保存模型配置（JSON blob） */
export interface VisualModelConfigurationPayload {
  projectId: string;
  /** ModelConfig 的 JSON 字符串 */
  modelConfiguration: string;
}

/** 查询模型配置结果 */
export interface VisualModelConfigurationResult {
  modelConfiguration: string;
}
