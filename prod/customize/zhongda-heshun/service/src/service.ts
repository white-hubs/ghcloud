import type { Command, Division, LogType, MemberLogResult, PageResult, PlanVO, ScheduleMode, ScheduledTaskDetailResult, ScheduledTaskPageResult, ScheduledTaskPlanItemParam } from "./types";
import type {
  DataTypeVO,
  ProjectVO,
  ProjectAreaVO,
  ProjectFileVO,
  ProjectPlaceVO,
  ProjectAreaCountVO,
  ProjectGroupVO,
  DeviceVO,
  GroupVO,
  CommandVO,
} from "./types";
import { type CubeAuth, CubeGateway } from "@ghcloud/cube-gateway";
import { BASE_API } from "@ghcloud/cube-protocol";

// Const baseURL = `${BASE_API}`
const baseURL = `${BASE_API}/disinfection`;

export class CubeZhongdaHeshunService {
  private readonly gateway: CubeGateway;
  public constructor(auth: CubeAuth) {
    this.gateway = new CubeGateway(auth);
  }

  /** 任务分类分页 */
  public async getTaskTypeList(payload: {
    pageNumber: number;
    pageSize: number;
    keyword?: string | null;
  }): Promise<PageResult<DataTypeVO>> {
    const url = `${baseURL}/disinfection/data-type/task`;
    const res = await this.gateway.get<PageResult<DataTypeVO>>({ url, payload });
    return res;
  }

  /** 新增任务分类 */
  public async addTaskType(payload: { dataName: string; remark: string }): Promise<unknown> {
    const url = `${baseURL}/disinfection/data-type/task`;
    const resp = await this.gateway.create<unknown>({ url, payload });
    return resp;
  }

  /** 修改任务分类 */
  public async updateTaskType(payload: { id: string; dataName: string; remark: string }): Promise<unknown> {
    const url = `${baseURL}/disinfection/data-type/task/${payload.id}`;
    const resp = await this.gateway.update<unknown>({ url, payload });
    return resp;
  }

  /** 删除任务分类 */
  public async deleteTaskType(id: string): Promise<void> {
    const url = `${baseURL}/disinfection/data-type/task/${id}`;
    const res = await this.gateway.delete({ url });
    return res;
  }

  /** 项目分类分页 */
  public async getProjectTypeList(payload: {
    pageNumber: number;
    pageSize: number;
    keyword?: string | null;
  }): Promise<PageResult<DataTypeVO>> {
    const url = `${baseURL}/disinfection/data-type/project`;
    const res = await this.gateway.get<PageResult<DataTypeVO>>({ url, payload });
    return res;
  }

  /** 新增任务分类 */
  public async addProjectType(payload: { dataName: string; remark: string }): Promise<unknown> {
    const url = `${baseURL}/disinfection/data-type/project`;
    const resp = await this.gateway.create<unknown>({ url, payload });
    return resp;
  }

  /** 修改任务分类 */
  public async updateProjectType(payload: { id: string; dataName: string; remark: string }): Promise<unknown> {
    const url = `${baseURL}/disinfection/data-type/project/${payload.id}`;
    const resp = await this.gateway.update<unknown>({ url, payload });
    return resp;
  }

  /** 删除任务分类 */
  public async deleteProjectType(id: string): Promise<void> {
    const url = `${baseURL}/disinfection/data-types/${id}`;
    const res = await this.gateway.delete({ url });
    return res;
  }

  /** 项目文件分类列表 */
  public async getProjectFileTypeList(payload?: { keyword?: string | null }): Promise<DataTypeVO[]> {
    const url = `${baseURL}/disinfection/data-type/file/list`;
    const res = await this.gateway.get<DataTypeVO[]>({ url, payload });
    return res;
  }

  /** 新增项目文件分类 */
  public async addProjectFileType(payload: { dataName: string; remark: string }): Promise<unknown> {
    const url = `${baseURL}/disinfection/data-type/file`;
    const resp = await this.gateway.create<unknown>({ url, payload });
    return resp;
  }

  /** 修改项目文件分类 */
  public async updateProjectFileType(payload: { id: string; dataName: string; remark: string }): Promise<unknown> {
    const url = `${baseURL}/disinfection/data-type/file/${payload.id}`;
    const resp = await this.gateway.update<unknown>({ url, payload });
    return resp;
  }

  /** 删除项目文件分类 */
  public async deleteProjectFileType(id: string): Promise<void> {
    const url = `${baseURL}/disinfection/data-type/file/${id}`;
    const res = await this.gateway.delete({ url });
    return res;
  }

  /** 重点场所分类列表 */
  public async getProjectPlaceTypeList(payload?: { keyword?: string | null }): Promise<DataTypeVO[]> {
    const url = `${baseURL}/disinfection/data-type/place/list`;
    const res = await this.gateway.get<DataTypeVO[]>({ url, payload });
    return res;
  }

  /** 新增重点场所分类 */
  public async addProjectPlaceType(payload: { dataName: string; remark: string }): Promise<unknown> {
    const url = `${baseURL}/disinfection/data-type/place`;
    const resp = await this.gateway.create<unknown>({ url, payload });
    return resp;
  }

  /** 修改重点场所分类 */
  public async updateProjectPlaceType(payload: { id: string; dataName: string; remark: string }): Promise<unknown> {
    const url = `${baseURL}/disinfection/data-type/place/${payload.id}`;
    const resp = await this.gateway.update<unknown>({ url, payload });
    return resp;
  }

  /** 删除项目文件分类 */
  public async deleteProjectPlaceType(id: string): Promise<void> {
    const url = `${baseURL}/disinfection/data-type/place/${id}`;
    const res = await this.gateway.delete({ url });
    return res;
  }

  /** 项目库分页 */
  public async getProjectPageList(payload: {
    pageNumber: number;
    pageSize: number;
    status?: string | null;
    keyword?: string | null;
  }): Promise<PageResult<ProjectVO>> {
    const url = `${baseURL}/disinfection/projects`;
    const res = await this.gateway.get<PageResult<ProjectVO>>({ url, payload });
    return res;
  }
  /** 项目库新增 */
  public async addProjectPageList(payload: {
    projectName: string | null;
    projectTypeId: number | null;
    projectTypeName?: string;
    company?: string;
    beginTime?: string;
    endTime?: string;
    leaderId?: number | null;
    disinfectionArea?: string;
    disinfectionLocationName?: string;
    disinfectionLocation?: string;
    disinfectionScope?: string;
    description?: string;
    image?: string | null;
  }): Promise<unknown> {
    const url = `${baseURL}/disinfection/projects`;
    const res = await this.gateway.create<unknown>({ url, payload });
    return res;
  }
  /** 项目库修改 */
  public async editProjectPageList(payload: {
    id?: number;
    projectName: string | null;
    projectTypeId: number | null;
    projectTypeName?: string;
    company?: string;
    beginTime?: string;
    endTime?: string;
    leaderId: number | null;
    disinfectionArea?: string;
    disinfectionLocationName?: string;
    disinfectionLocation?: string;
    disinfectionScope?: string;
    description?: string;
    image?: string | null;
  }): Promise<unknown> {
    const url = `${baseURL}/disinfection/projects/${payload.id}`;
    const res = await this.gateway.update<unknown>({ url, payload });
    return res;
  }
  /** 项目库详情 */
  public async getProjectPageDetail(payload: { id?: string }): Promise<unknown> {
    const url = `${baseURL}/disinfection/projects/${payload.id}`;
    const res = await this.gateway.get<unknown>({ url });
    return res;
  }
  /** 项目库删除 */
  public async deleteProjectPage(payload: { id: string }): Promise<void> {
    const url = `${baseURL}/disinfection/projects/${payload.id}`;
    const res = await this.gateway.delete({ url });
    return res;
  }
  /** 获取项目区域个数信息列表 */
  public async getProjectAreaCountList(): Promise<ProjectAreaCountVO[]> {
    const url = `${baseURL}/disinfection/project/area/count`;
    const res = await this.gateway.get<ProjectAreaCountVO[]>({ url });
    return res;
  }

  // /** 项目详情 */
  // Public async getProjectDetails (id: string): Promise<ProjectVO> {
  //   Const url = `${baseURL}/disinfection/project/basic/${id}`
  //   Const res = await this.gateway.get<ProjectVO>({ url })
  //   Return res
  // }

  /** 新增项目 */
  public async addProject(payload: {
    projectName: string;
    projectTypeId: string;
    projectTypeName?: string;
    company?: string;
    beginTime: string;
    endTime: string;
    leaderId: string;
    leaderUserName?: string;
    disinfectionArea?: number;
    disinfectionLocationName: string;
    disinfectionLocation: string;
    disinfectionScope: string;
    description: string;
  }): Promise<unknown> {
    const url = `${baseURL}/disinfection/project`;
    const resp = await this.gateway.create<unknown>({ url, payload });
    return resp;
  }

  /** 修改项目 */
  public async updateProject(payload: {
    id: string;
    projectName: string;
    projectTypeId: string;
    projectTypeName?: string;
    company?: string;
    beginTime: string;
    endTime: string;
    leaderId: string;
    leaderUserName?: string;
    disinfectionArea?: number;
    disinfectionLocationName: string;
    disinfectionLocation: string;
    disinfectionScope: string;
    description?: string;
  }): Promise<unknown> {
    const url = `${baseURL}/disinfection/project/${payload.id}`;
    const resp = await this.gateway.update<unknown>({ url, payload });
    return resp;
  }

  /** 删除项目 */
  public async deleteProject(id: string): Promise<void> {
    const url = `${baseURL}/disinfection/project/${id}`;
    const resp = await this.gateway.delete({ url });
    return resp;
  }

  /** 项目区域分页 */
  public async getProjectAreaPage(payload: {
    pageNumber: number;
    pageSize: number;
    projectId: string;
  }): Promise<PageResult<ProjectAreaVO>> {
    const url = `${baseURL}/disinfection/projects/${payload.projectId}/areas`;
    const res = await this.gateway.get<PageResult<ProjectAreaVO>>({ url, payload });
    return res;
  }
  /** 项目计划状态修改 */
  public async changeProjectPlanPage(id: string, status: string): Promise<PageResult<ProjectAreaVO>> {
    const url = `${baseURL}/disinfection/plans/${id}/${status}`;
    const res = await this.gateway.update<PageResult<ProjectAreaVO>>({ url });
    return res;
  }
  /** 项目计划分页 */
  public async getProjectPlanPage(payload: {
    pageNumber: number;
    pageSize: number;
    keyword?: string;
    status?: string;
    enable?: string;
    period?: string | undefined;
  }): Promise<PageResult<ProjectAreaVO>> {
    const url = `${baseURL}/disinfection/plans`;
    const res = await this.gateway.get<PageResult<ProjectAreaVO>>({ url, payload });
    return res;
  }
  /** 新增项目计划 */
  public async addProjectPlanPage(payload: {
    planName: string;
    projectId: string;
    beginTime: string;
    endTime: string;
    enable: string;
    projectLeaderId: string;
    taskTimeLimitConfig: {
      day: number;
      hour: number;
      minute: number;
    };
    taskGenerationCycleConfigs: {
      type: string;
      day?: string;
      time: string;
    }[];
    remark?: string;
    planTaskConfigList: {
      id?: string;
      taskTypeId: string;
      taskTypeName: string;
      taskName: string;
      taskAreaId: string;
      disinfectionFrequency: string;
      notificationType: string;
      notificationGroupId: string;
      notificationDeptId: string;
      notificationPostId: string;
      notificationRoleId: string;
    }[];
  }): Promise<unknown> {
    const url = `${baseURL}/disinfection/plans`;
    const res = await this.gateway.create<unknown>({ url, payload });
    return res;
  }
  /** 编辑项目计划 */
  public async editProjectPlanPage(payload: {
    id?: string;
    planName: string;
    projectId: string;
    beginTime: string;
    endTime: string;
    enable: string;
    projectLeaderId: string;
    taskTimeLimitConfig: {
      day: number;
      hour: number;
      minute: number;
    };
    taskGenerationCycleConfigs: {
      type: string;
      day?: string;
      time: string;
    }[];
    remark?: string;
    planTaskConfigList: {
      id?: string;
      taskTypeId: string;
      taskTypeName: string;
      taskName: string;
      taskAreaId: string;
      disinfectionFrequency: string;
      notificationType: string;
      notificationGroupId: string;
      notificationDeptId: string;
      notificationPostId: string;
      notificationRoleId: string;
    }[];
  }): Promise<unknown> {
    const url = `${baseURL}/disinfection/plans`;
    const res = await this.gateway.update<unknown>({ url, payload });
    return res;
  }
  /** 项目计划详情 */
  public async getProjectPlanDetail(id: string): Promise<PlanVO> {
    const url = `${baseURL}/disinfection/plans/${id}`;
    const res = await this.gateway.get<PlanVO>({ url });
    return res;
  }
  /** 项目计划删除 */
  public async deleteProjectPlan(id: string): Promise<void> {
    const url = `${baseURL}/disinfection/plans/${id}`;
    const res = await this.gateway.delete({ url });
    return res;
  }
  /** 项目区域 */
  public async getProjectArea(projectId: string): Promise<PageResult<ProjectAreaVO>> {
    const url = `${baseURL}/disinfection/projects/${projectId}/areas`;
    const resp = await this.gateway.get<PageResult<ProjectAreaVO>>({ url });
    return resp;
  }
  /** 项目区域 */
  public async getProjectAreaAll(projectId: string): Promise<ProjectAreaVO[]> {
    const url = `${baseURL}/disinfection/projects/${projectId}/areas/list-all`;
    const resp = await this.gateway.get<ProjectAreaVO[]>({ url });
    return resp;
  }

  /** 新增项目区域 */
  public async addProjectArea(payload: {
    projectId: string | null;
    areaParamList: {
      areaName: string;
      areaDetail: string;
    }[];
  }): Promise<unknown> {
    const url = `${baseURL}/disinfection/projects/${payload.projectId}/areas`;
    const resp = await this.gateway.create<unknown>({ url, payload });
    return resp;
  }

  /** 编辑项目区域 */
  public async updateProjectArea(payload: {
    projectId: string | null;
    areaParamList: {
      id?: string;
      areaName: string;
      areaDetail: string;
    }[];
  }): Promise<unknown> {
    const url = `${baseURL}/disinfection/projects/${payload.projectId}/areas`;
    const resp = await this.gateway.update<unknown>({ url, payload });
    return resp;
  }
  /** 编辑项目单个区域 */
  public async editProjectArea(payload: { projectId: string | null; id?: string; areaName: string; areaDetail: string }): Promise<unknown> {
    const url = `${baseURL}/disinfection/projects/${payload.projectId}/areas/${payload.id}`;
    const resp = await this.gateway.update<unknown>({ url, payload });
    return resp;
  }

  /** 删除项目区域 */
  public async deleteProjectArea(projectId: string, id: string): Promise<void> {
    const url = `${baseURL}/disinfection/projects/${projectId}/areas/${id}`;
    const resp = await this.gateway.delete({ url });
    return resp;
  }
  /** 删除项目小组 */
  public async deleteProjectGroup(projectId: string, groupId: string): Promise<void> {
    const url = `${baseURL}/disinfection/projects/${projectId}/groups/${groupId}`;
    const resp = await this.gateway.delete({ url });
    return resp;
  }

  /** 类型文件列表 */
  public async getProjectFilePage(payload: {
    pageNumber: number;
    pageSize: number;
    fileTypeId: string;
    projectId: string;
    keyword: string;
  }): Promise<PageResult<ProjectFileVO>> {
    const url = `${baseURL}/disinfection/material/page`;
    const resp = await this.gateway.get<PageResult<ProjectFileVO>>({ url, payload });
    return resp;
  }

  /** 项目文件列表 */
  public async getProjectFileList(payload: { projectId: string; keyword?: string }): Promise<ProjectFileVO[]> {
    const url = `${baseURL}/disinfection/material/project-material/${payload.projectId}`;
    const resp = await this.gateway.get<ProjectFileVO[]>({ url, payload });
    return resp;
  }

  /** 新增项目文件 */
  public async addProjectFile(payload: {
    projectId: string | null;
    fileTypeId: string | null;
    fileId: string;
    fileName?: string;
    fileTypeName?: string;
  }): Promise<unknown> {
    const url = `${baseURL}/disinfection/materials`;
    const resp = await this.gateway.create<unknown>({ url, payload });
    return resp;
  }

  /** 删除项目文件 */
  public async deleteProjectFile(payload: { ids: string }): Promise<unknown> {
    const url = `${baseURL}/disinfection/material`;
    const resp = await this.gateway.delete({ url, payload });
    return resp;
  }

  /** 项目场所列表 */
  public async getProjectPlacePageList(payload: {
    pageNumber: number;
    pageSize: number;
    projectId: string;
    placeTypeId: string;
    keyword?: string;
  }): Promise<PageResult<ProjectPlaceVO>> {
    const url = `${baseURL}/disinfection/key-places`;
    const resp = await this.gateway.get<PageResult<ProjectPlaceVO>>({ url, payload });
    return resp;
  }

  /** 项目场所列表 */
  public async getProjectPlaceList(payload: { projectId: string; dataTypeId?: string; keyword?: string }): Promise<ProjectPlaceVO[]> {
    const url = `${baseURL}/disinfection/key-place/project-keyPlace/${payload.projectId}`;
    const resp = await this.gateway.get<ProjectPlaceVO[]>({ url, payload });
    return resp;
  }

  /** 项目场所详情 */
  public async getProjectPlaceDetails(id: string): Promise<ProjectPlaceVO> {
    const url = `${baseURL}/disinfection/key-places/${id}`;
    const resp = await this.gateway.get<ProjectPlaceVO>({ url });
    return resp;
  }

  /** 新增项目重点场所 */
  public async addProjectPlace(payload: {
    projectId: string | null;
    placeName: string;
    placeTypeId: string | null;
    placeTypeName?: string;
    placeDetail?: string | null;
    longitude?: string;
    latitude?: string;
    placeAddress?: string;
    imgs?: string;
    placeDescription?: string;
  }): Promise<unknown> {
    const url = `${baseURL}/disinfection/key-places`;
    const resp = await this.gateway.create<unknown>({ url, payload });
    return resp;
  }

  /** 编辑项目重点场所 */
  public async updateProjectPlace(payload: {
    id: string;
    projectId: string | null;
    placeName: string;
    placeTypeId: string | null;
    placeTypeName?: string;
    placeDetail?: string | null;
    longitude?: string;
    latitude?: string;
    placeAddress?: string;
    imgs?: string;
    placeDescription?: string;
  }): Promise<unknown> {
    const url = `${baseURL}/disinfection/key-places/${payload.id}`;
    const resp = await this.gateway.update<unknown>({ url, payload });
    return resp;
  }

  /** 删除项目重点场所 */
  public async deleteProjectPlace(payload: { ids: string }): Promise<unknown> {
    const url = `${baseURL}/disinfection/key-places`;
    const resp = await this.gateway.delete({ url, payload });
    return resp;
  }

  /** 下载项目重点场所模版 */
  public async exportTemplate(): Promise<unknown> {
    const url = `${baseURL}/disinfection/key-places/download/excel-template`;
    const resp = await this.gateway.customBlob({ url, method: "GET" });
    return resp;
  }
  // 导入项目重点场所模版
  public async importTemplate(payload: Record<string, FormData>): Promise<void> {
    const url = `${baseURL}/disinfection/key-places/import/excel`;
    await this.gateway.create({ url, payload });
  }
  /** 项目小组分页 */
  public async getProjectGroupPageListAll(projectId: string): Promise<ProjectGroupVO[]> {
    const url = `${baseURL}/disinfection/projects/${projectId}/groups/list-all`;
    const resp = await this.gateway.get<ProjectGroupVO[]>({ url });
    return resp;
  }
  /** 项目小组分页 */
  public async getProjectGroupPageList(payload: {
    pageNumber: number;
    pageSize: number;
    projectId: string;
  }): Promise<PageResult<ProjectGroupVO>> {
    const url = `${baseURL}/disinfection/projects/${payload.projectId}/groups`;
    const resp = await this.gateway.get<PageResult<ProjectGroupVO>>({ url, payload });
    return resp;
  }
  /** 项目小组分页 */
  public async getProjectGroupAllPageList(projectId: string): Promise<ProjectGroupVO[]> {
    const url = `${baseURL}/disinfection/projects/${projectId}/groups/list-all`;
    const resp = await this.gateway.get<ProjectGroupVO[]>({ url });
    return resp;
  }

  /** 新增项目小组 */
  public async addProjectGroup(payload: {
    projectId: string;
    groups: {
      groupId: string | null;
      groupName: string;
      userIds: string[];
    }[];
  }): Promise<unknown> {
    const url = `${baseURL}/disinfection/projects/${payload.projectId}/groups`;
    const resp = await this.gateway.create<unknown>({ url, payload });
    return resp;
  }
  /** 编辑项目小组 */
  public async editProjectGroups(payload: {
    projectId: string;
    groups: {
      groupId: string | null;
      groupName: string;
      userIds: string[];
    }[];
  }): Promise<unknown> {
    const url = `${baseURL}/disinfection/projects/${payload.projectId}/groups`;
    const resp = await this.gateway.update<unknown>({ url, payload });
    return resp;
  }
  /** 编辑项目单个小组 */
  public async editProjectGroup(payload: {
    projectId: string;
    groupId: string | null;
    groupName: string;
    userIds: string[];
  }): Promise<unknown> {
    const url = `${baseURL}/disinfection/projects/${payload.projectId}/groups/${payload.groupId}`;
    const resp = await this.gateway.update<unknown>({ url, payload });
    return resp;
  }
  /** 获取项目小组 */
  public async getProjectGroupDetail(projectId: string): Promise<unknown> {
    const url = `${baseURL}/disinfection/projects/${projectId}/groups/list-all`;
    const resp = await this.gateway.get({ url });
    return resp;
  }

  /** 编辑项目小组 */
  public async updateProjectGroup(payload: { id: string; groupName: string }): Promise<unknown> {
    const url = `${baseURL}/disinfection/group/${payload.id}`;
    const resp = await this.gateway.update<unknown>({ url, payload });
    return resp;
  }

  /** 获取分类 */
  public async getTypeList(payload: {
    pageNumber: number;
    pageSize: number;
    keyword?: string;
    dataType: string;
  }): Promise<PageResult<unknown>> {
    const url = `${baseURL}/disinfection/data-types`;
    const resp = await this.gateway.get<PageResult<unknown>>({ url, payload });
    return resp;
  }
  /** 获取全部分类 */
  public async getTypeAllList(payload: { dataType: string; projectId?: string }): Promise<unknown> {
    const url = `${baseURL}/disinfection/data-types/list-all`;
    const resp = await this.gateway.get<unknown>({ url, payload });
    return resp;
  }
  /** 获取全部分类 */
  public async getTypeAllListForProject(payload: { dataType: string; projectId: string }): Promise<unknown> {
    const url = `${baseURL}/disinfection/tasks/list-all`;
    const resp = await this.gateway.get<unknown>({ url, payload });
    return resp;
  }

  /** 新增分类 */
  public async addTypeAllList(payload: { dataType: string; dataName: string; remark?: string; icon?: string }): Promise<unknown> {
    const url = `${baseURL}/disinfection/data-types`;
    const resp = await this.gateway.create<unknown>({ url, payload });
    return resp;
  }
  /** 编辑分类 */
  public async editTypeAllList(payload: {
    id: string | number | null;
    dataType: string;
    dataName: string;
    remark?: string;
    icon?: string;
  }): Promise<unknown> {
    const url = `${baseURL}/disinfection/data-types/${payload.id}`;
    const resp = await this.gateway.update<unknown>({ url, payload });
    return resp;
  }
  /** 删除分类 */
  public async deleteTypeAllList(payload: { id: string | number | null }): Promise<void> {
    const url = `${baseURL}/disinfection/data-types/${payload.id}`;
    const resp = await this.gateway.delete({ url, payload });
    return resp;
  }
  /** 项目资料分页 */
  public async getMaterialsList(payload: {
    pageNumber: number;
    pageSize: number;
    projectId?: string;
    fileTypeId?: string | number | undefined;
    keyword?: string;
  }): Promise<PageResult<ProjectFileVO>> {
    const url = `${baseURL}/disinfection/materials`;
    const resp = await this.gateway.get<PageResult<ProjectFileVO>>({ url, payload });
    return resp;
  }
  /** 项目资料删除 */
  public async deleteMaterialsList(payload: { ids: string }): Promise<unknown> {
    const url = `${baseURL}/disinfection/materials`;
    const resp = await this.gateway.delete({ url, payload });
    return resp;
  }
  /** 项目任务列表 */
  public async getTaskList(payload: {
    pageNumber: number;
    pageSize: number;
    projectId?: string | null;
    status?: string | null;
    taskTypeId?: string | null;
    deadLinePeriod?: string | null;
    keyword?: string | null;
  }): Promise<PageResult<ProjectFileVO>> {
    const url = `${baseURL}/disinfection/tasks`;
    const resp = await this.gateway.get<PageResult<ProjectFileVO>>({ url, payload });
    return resp;
  }
  /** 项目任务详情 */
  public async getTaskDetail(taskId: string): Promise<unknown> {
    const url = `${baseURL}/disinfection/tasks/${taskId}`;
    const resp = await this.gateway.get<unknown>({ url });
    return resp;
  }
  /** 项目任务完成详情 */
  public async getTaskDetailCompletion(taskId: string): Promise<unknown> {
    const url = `${baseURL}/disinfection/tasks/${taskId}/completion-records`;
    const resp = await this.gateway.get<unknown>({ url });
    return resp;
  }
  /** 项目人员 */
  public async getRolesFormGroup(payload: { groupId: string; projectId: string }): Promise<unknown> {
    const url = `${baseURL}/disinfection/projects/${payload.projectId}/groups/${payload.groupId}/roles`;
    const resp = await this.gateway.get<unknown>({ url, payload });
    return resp;
  }
  /** 任务终止 */
  public async updateTaskList(taskId: string): Promise<unknown> {
    const url = `${baseURL}/disinfection/tasks/${taskId}/stop`;
    const resp = await this.gateway.update<unknown>({ url });
    return resp;
  }
  /** 新增项目任务 */
  public async addTaskList(payload: {
    taskName?: string;
    projectId?: string;
    taskTypeId?: string;
    taskTimeLimitConfig?: {
      day: string;
      hour: string;
      minute: string;
    };
    projectLeaderId?: string;
    disinfectionFrequency?: string;
    notificationType?: string;
    taskAreaId?: string;
    notificationGroupId?: string;
    notificationDeptId?: string;
    notificationPostId?: string;
    notificationRoleId?: string;
    appendix?: string;
  }): Promise<unknown> {
    const url = `${baseURL}/disinfection/tasks`;
    const resp = await this.gateway.create<unknown>({ url, payload });
    return resp;
  }

  /** 获取产品设备数量 */
  public async getProductDeviceNumber(payload: {
    groupId?: string | null;
    productId?: string | null;
    keyword?: string | undefined;
  }): Promise<{ productId: string; productName: string; deviceCount: number }[]> {
    const url = `${baseURL}/bus/member/group-device/product-list`;
    const resp = await this.gateway.get<{ productId: string; productName: string; deviceCount: number }[]>({ url, payload });
    return resp;
  }

  /** 设备列表 */
  public async getDevicePageList(payload: {
    pageNumber: number;
    pageSize: number;
    groupId?: string | null;
    productId?: string | null;
    keyword?: string | undefined;
  }): Promise<PageResult<DeviceVO>> {
    const url = `${baseURL}/bus/member/group-device/page`;
    const resp = await this.gateway.get<PageResult<DeviceVO>>({ url, payload });
    return resp;
  }

  /** 批量绑定设备 */
  public async bindDevices(payload: {
    productId?: number;
    prodCategoryId?: number;
    deviceIds: string[];
    groupId?: string | null;
    addIot?: boolean | null;
  }): Promise<boolean> {
    const url = `${baseURL}/bus/member/group-device/bind-batch`;
    const resp = this.gateway.create<boolean>({ url, payload });
    return resp;
  }
  /** 输入序列号绑定设备 */
  public async bindDeviceOne(payload: {
    deviceCode: string | null;
    prodCategoryId: string | null;
    productId: string | null;
    groupId: string | null;
    /** 绑定时的用户位置（GCJ-02），可选 */
    latitude?: number | null;
    longitude?: number | null;
  }): Promise<boolean> {
    const url = `${baseURL}/bus/member/group-device/bind-one`;
    const resp = this.gateway.create<boolean>({ url, payload });
    return resp;
  }

  /** 批量解绑设备 */
  public async unbindDevices(payload: {
    productId: number;
    prodCategoryId: number;
    deviceIds: string[];
    groupId?: string | null;
    addIot?: boolean | null;
  }): Promise<boolean> {
    const url = `${baseURL}/bus/member/group-device/unbind-batch`;
    const resp = this.gateway.create<boolean>({ url, payload });
    return resp;
  }

  /** 组织分页列表 */
  public async getGroupPageList(payload: {
    pageNumber: number;
    pageSize: number;
    memberUserId?: string | null;
    keyword?: string | null;
  }): Promise<PageResult<GroupVO>> {
    const url = `${baseURL}/bus/member/group/page`;
    const resp = await this.gateway.get<PageResult<GroupVO>>({ url, payload });
    return resp;
  }
  public async getMineGroups(payload: { keyword?: string | null }): Promise<GroupVO[]> {
    const url = `${baseURL}/bus/member/mine/groups`;
    const resp = await this.gateway.get<GroupVO[]>({ url, payload });
    return resp;
  }
  public async getMineGroup(): Promise<GroupVO> {
    const url = `${baseURL}/bus/member/mine/select-group-add-default`;
    const resp = await this.gateway.create<GroupVO>({ url });
    return resp;
  }

  /** 新增分组 */
  public async addGroup(payload: { groupName: string; description?: string }): Promise<unknown> {
    const url = `${baseURL}/bus/member/group/add`;
    const resp = await this.gateway.create<unknown>({ url, payload });
    return resp;
  }

  /** 修改分组 */
  public async updateGroup(payload: { id: string; groupName: string; description?: string }): Promise<unknown> {
    const url = `${baseURL}/bus/member/group/only-edit`;
    const resp = await this.gateway.update<unknown>({ url, payload });
    return resp;
  }

  /** 删除分组 */
  public async deleteGroup(id: string): Promise<void> {
    const url = `${baseURL}/bus/member/group/remove?id=${id}`;
    const res = await this.gateway.delete({ url });
    return res;
  }
  /** 指令列表 */
  public async getCommandPageList(payload: {
    pageNumber: number;
    pageSize: number;
    groupId?: string | null;
  }): Promise<PageResult<CommandVO>> {
    const url = `${baseURL}/bus/member/automatic/page`;
    const resp = await this.gateway.get<PageResult<CommandVO>>({ url, payload });
    return resp;
  }

  /** 添加指令 */
  public async addCommandPageList(payload: {
    name?: string;
    display?: string;
    deviceId?: string | null;
    groupId?: string | null;
    propWriteValueList: { code: string; name: string; expectedValue: string }[];
    loopType: string;
    loopDay: string;
    loopHour: string;
  }): Promise<boolean> {
    const url = `${baseURL}/bus/member/automatic/add`;
    const resp = await this.gateway.create<boolean>({ url, payload });
    return resp;
  }
  /** 修改指令 */
  public async editCommandPageList(payload: {
    name?: string;
    display?: string;
    deviceId?: string | null;
    groupId?: string | null;
    propWriteValueList: { code: string; name: string; expectedValue: string }[];
    loopType: string;
    loopDay: string;
    loopHour: string;
    id: string;
  }): Promise<boolean> {
    const url = `${baseURL}/bus/member/automatic/edit`;
    const resp = await this.gateway.create<boolean>({ url, payload });
    return resp;
  }
  /** 删除指令 */
  public async deleteCommandPageList(payload: { id?: string }): Promise<void> {
    const url = `${baseURL}/bus/member/automatic/remove`;
    const resp = await this.gateway.delete({ url, payload });
    return resp;
  }

  /** 日志列表 */
  public async getLogList(payload: { pageNumber: number; pageSize: number; type?: LogType | null }): Promise<PageResult<MemberLogResult>> {
    const url = `${baseURL}/bus/member/log/page`;
    const resp = await this.gateway.get<PageResult<MemberLogResult>>({ url, payload });
    return resp;
  }
  /** 设备解绑 */
  public async updateDeviceUnbindBatch(payload: {
    productId?: string;
    prodCategoryId?: string;
    deviceIds?: string[];
    deviceCode?: string;
    groupId?: string;
  }): Promise<boolean> {
    const url = `${baseURL}/bus/member/group-device/unbind-batch`;
    const res = await this.gateway.create<boolean>({ url, payload });
    return res;
  }
  /** 获取行政区域 */
  public async getDivisionTree(): Promise<Division[]> {
    const url = `${BASE_API}/mdata/motherland-district/tree-list`;
    const res = await this.gateway.get<Division[]>({ url });
    return res;
  }

  /** 手动控制消杀设备 */
  public async deviceManualControl(payload: {
    command: Command;
    deviceId: number | string | null;
    deviceName?: string | null;
    duration?: number | null;
  }): Promise<boolean> {
    const url = `${baseURL}/bus/member/device/manual-control`;
    const resp = await this.gateway.create<boolean>({ url, payload });
    return resp;
  }

  /** 获取设备上一次手动控制时长 */
  public async getDeviceManualControlDuration(payload: { deviceId: number | string }): Promise<unknown> {
    const url = `${baseURL}/bus/member/device/manual-control-duration`;
    const resp = await this.gateway.get<unknown>({ url, payload });
    return resp;
  }

  /** 创建定时任务 */
  public async createDeviceScheduledTask(payload: {
    deviceIds?: (number | string)[];
    groupId?: number | string;
    name: string;
    planList?: ScheduledTaskPlanItemParam[];
    scheduleMode: ScheduleMode;
  }): Promise<unknown> {
    const url = `${baseURL}/bus/member/device/scheduled-task/create`;
    const resp = await this.gateway.create<unknown>({ url, payload });
    return resp;
  }

  /** 修改定时任务 */
  public async updateDeviceScheduledTask(payload: {
    id: string | number;
    groupId?: number | string;
    deviceIds?: (number | string)[];
    name: string;
    planList?: ScheduledTaskPlanItemParam[];
    scheduleMode: ScheduleMode;
  }): Promise<unknown> {
    const url = `${baseURL}/bus/member/device/scheduled-task/update`;
    const resp = await this.gateway.update<unknown>({ url, payload });
    return resp;
  }

  /** 删除定时任务 */
  public async deleteDeviceScheduledTask(id: string | number ): Promise<void> {
    const url = `${baseURL}/bus/member/device/scheduled-task/${id}`;
    const resp = await this.gateway.delete({ url });
    return resp;
  }

  /** 定时任务分页列表 */
  public async getDeviceScheduledTaskList(payload: {
    pageNumber: number;
    pageSize: number;
    groupId?: string | null;
    name?: string | null;
    scheduleMode?: ScheduleMode | undefined;
  }): Promise<PageResult<ScheduledTaskPageResult>> {
    const url = `${baseURL}/bus/member/device/scheduled-task/page`;
    const resp = await this.gateway.get<PageResult<ScheduledTaskPageResult>>({ url, payload });
    return resp;
  }

  /** 获取定时任务详情 */
  public async getDeviceScheduledTaskDetail(id: number | string): Promise<ScheduledTaskDetailResult> {
    const url = `${baseURL}/bus/member/device/scheduled-task/${id}`;
    const resp = await this.gateway.get<ScheduledTaskDetailResult>({ url });
    return resp;
  }

}
