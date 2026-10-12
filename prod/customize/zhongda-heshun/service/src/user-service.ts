import { type CubeAuth, CubeGateway } from '@ghcloud/cube-gateway'
import { BASE_API } from '@ghcloud/cube-protocol'
import type { MemberGroupDTO, MemberUserDTO, PageResult } from './types'
import type { AreaInfoVO, BimProjectStatisticsVO, BimUserStatisticsVO, DataType, DataTypeVO, DisinfectionUserInfoVO, GroupInfoVO, KeyPlacePageVO, ProjectMaterialInfoVO, ProjectPageVO, ProjectStatisticsBaseVO, ProjectStatisticsCycleVO, ProjectStatus, TaskCompletionRecordVO, TaskInfoVO, TaskPageVO, TaskStatus } from './data-viz-dto'

const baseURL = `${BASE_API}/disinfection`

/** 中大合顺用户管理接口服务 */
export class CubeZDUserService {
  private readonly gateway: CubeGateway
  public constructor (auth: CubeAuth) {
    this.gateway = new CubeGateway(auth)
  }

  /** 用户列表分页 */
  public async getMemberUserPage (payload: {
    pageSize: number;
    pageNumber: number;
    keyword?: string;
    createTime?: string;
  }): Promise<PageResult<MemberUserDTO>> {
    const url = `${baseURL}/bus/member/user/page`
    const resp = await this.gateway.get<PageResult<MemberUserDTO>>({ url, payload })
    return resp
  }

  /** 用户删除 */
  public async deleteMemberUser (payload: {
    id: string;
  }): Promise<unknown> {
    const url = `${baseURL}/bus/member/user/remove`
    const resp = await this.gateway.delete({ url, payload })
    return resp
  }
  /** 组织分页列表 */
  public async getMemberGroupPage (payload: {
    pageSize: number;
    pageNumber: number;
    keyword?: string;
    createTime?: string;
  }): Promise<PageResult<MemberGroupDTO>> {
    const url = `${baseURL}/bus/member/group/page`
    const resp = await this.gateway.get<PageResult<MemberGroupDTO>>({ url, payload })
    return resp
  }

  /** 组织删除 */
  public async deleteMemberGroup (payload: {
    id: string;
  }): Promise<unknown> {
    const url = `${baseURL}/bus/member/group/remove`
    const resp = await this.gateway.delete({ url, payload })
    return resp
  }

  /** 角色列表 */
  public async getMemberRoleList (payload: {
    keyword?: string;
    status?: string;
  }): Promise<unknown[]> {
    const url = `${baseURL}/bus/member/role/page`
    const resp = await this.gateway.get<unknown[]>({ url, payload })
    return resp
  }


}
