/** 项目实体 */
export interface ProjectEntity {
  id: string;
  name: string;
  code: string;
  secret: string;
}

/** 新增项目请求参数 */
export interface CreateProjectCommand {
  name: string;
}

/** 编辑项目请求参数 */
export interface UpdateProjectCommand {
  id: string;
  name: string;
}
