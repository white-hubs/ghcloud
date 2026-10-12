import type { Pagination } from "@ghcloud/cube-service-interface/base";

import type {
  AreaScenePanelConfig,
  BindVisualStallsParams,
  BusinessAreaNode,
  CreateSceneTypeMenuParams,
  GetAreaScenePanelConfigParams,
  ListBoundStallsParams,
  ListSceneTypeMenusParams,
  ListUnboundStallsParams,
  SaveAreaScenePanelConfigParams,
  SceneTypeMenu,
  StallCategory,
  StallRecord,
  UnbindVisualStallsParams,
  UpdateSceneTypeMenuParams,
} from "./request";

/**
 * 主数据（mdata）可视化相关契约。
 * 前端经 `/api/mdata/*` 调用（与现有可视化迁移 client 一致）。
 */
export interface MdataGateway {
  /** 查询项目业务菜单树 */
  listSceneTypeMenus: (params: ListSceneTypeMenusParams) => Promise<SceneTypeMenu[]>;

  /** 新增业务菜单 */
  createSceneTypeMenu: (params: CreateSceneTypeMenuParams) => Promise<unknown>;

  /** 更新业务菜单 */
  updateSceneTypeMenu: (params: UpdateSceneTypeMenuParams) => Promise<unknown>;

  /** 删除业务菜单 */
  deleteSceneTypeMenu: (id: string) => Promise<void>;

  /** 查询区域-场景面板配置 */
  getAreaScenePanelConfig: (params: GetAreaScenePanelConfigParams) => Promise<AreaScenePanelConfig[]>;

  /** 保存区域-场景面板配置 */
  saveAreaScenePanelConfig: (params: SaveAreaScenePanelConfigParams) => Promise<unknown>;

  /** 查询业务区域树（区域管理） */
  listBusinessAreas: () => Promise<BusinessAreaNode[]>;

  /** 档位类型列表 */
  listStallCategories: () => Promise<StallCategory[]>;

  /** 场景已关联档位分页 */
  listBoundStalls: (params: ListBoundStallsParams) => Promise<Pagination<StallRecord>>;

  /** 场景未关联档位分页（添加弹窗） */
  listUnboundStalls: (params: ListUnboundStallsParams) => Promise<Pagination<StallRecord>>;

  /** 绑定档位到场景 */
  bindVisualStalls: (params: BindVisualStallsParams) => Promise<unknown>;

  /** 解绑场景档位 */
  unbindVisualStalls: (params: UnbindVisualStallsParams) => Promise<unknown>;
}
