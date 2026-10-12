import { StaffUser } from '../../domain/user'
import { getApiBaseUrL, getAuthHeaders } from '@ghcloud/cube-app-js-sdk'
import { HTTPClientImpl } from '../../infrastructure/http-client'
import { BaseAPIResult } from '../../service/base-api'
import qs from 'qs'

interface UsersPage {
  total: number;
  records: StaffUser[];
  pages: number;
}

export class StaffService {
  private static readonly instance = new StaffService()
  public static getInstance (): StaffService {
    return this.instance
  }

  private currentUser?: StaffUser
  private readonly client = new HTTPClientImpl({
    baseURL: getApiBaseUrL()??'/api',
    headers: getAuthHeaders()
  })

  private constructor () {
    const {isLogin}=qs.parse(window.location.search)
    // 服务初始化时即加载当前用户信息，如果为公开表单不处理
    if(!window.location.pathname.includes('public-form')&&!window.location.pathname.includes('public-process')&&isLogin !== 'false'){
      try{
        this.getCurrentUser()
      }catch(err){
      }
    }
  }

  public async getStaffInfo (staffId: string): Promise<StaffUser> {
    const result = await this.client.get<StaffUser>(`/personnel/user-under-tenant/${staffId}`)
    return result
  }

  public async getUserInfo (staffId: string): Promise<StaffUser> {
    const result = await this.client.get<StaffUser>(`/ouaa/user-under-tenant/${staffId}`)
    return result
  }

  public async getUserContext (): Promise<StaffUser> {
    const result = await this.client.get<StaffUser>(`/ouaa/context/user`)
    return result
  }
  public async getPublicUserContext (): Promise<StaffUser> {
    const result = await this.client.get<StaffUser>(`/ouaa/public/context/user`)
    return result
  }

  public async getStaffField (params: { id: string;attr: string; }): Promise<{ id: string;name: string; }> {
    const result = await this.client.get<StaffUser>('/personnel/staff/info', { query: params })
    return result
  }

  /**
   * 查询人员列表
   * TODO(danke): 暂时使用前端分页接口
   * @returns 查询到的人员信息
   */
  public async queryUsers (): Promise<StaffUser[]> {
    const result = await this.client.get<StaffUser[]>('/personnel/staff/list')
    return result
  }

  public async queryUsersPage (params: { pageNumber: number;pageSize: number;keyword?: string; organizationId?: string; }): Promise<UsersPage> {
    const result = await this.client.get<UsersPage>('/personnel/staff/page', { query: params })
    return result
  }

  // TODO(danke): 初始化方式重构
  public async getCurrentUser (): Promise<StaffUser> {
    if (this.currentUser !== undefined) {
      return this.currentUser
    }
    this.currentUser = await this.getUserContext()
    return this.currentUser
  }
  public async getPublicCurrentUser (): Promise<StaffUser> {
    if (this.currentUser !== undefined) {
      return this.currentUser
    }
    this.currentUser = await this.getPublicUserContext()
    return this.currentUser
  }

  public getCurrentUserSync (): StaffUser {
    return this.currentUser!
  }
}

export const staffService = StaffService.getInstance()
