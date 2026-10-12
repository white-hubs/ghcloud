import { type CubeAuth, CubeGateway, type LegacyServiceError } from '@ghcloud/cube-gateway'
import type { Pagination, PaginationQuery } from '@ghcloud/cube-gateway/src/pagination'
import { BASE_API } from '@ghcloud/cube-protocol'

export interface User {
  id: string;
  name: string;
  mobile: string;
  organizations: string[];
  roles: Role[];
}

type UserPaginationQuery = PaginationQuery<{
  organizationId: string;
  keyword: string;
  cascaderIds: string;
  enabled: boolean;
}>

export interface Role {
  id: string;
  name: string;
}

type RolePaginationQuery = PaginationQuery<{
  keyword: string;
  cascaderIds: string;
  enabled: boolean;
}>

export interface Department {
  children: Department;
  enabled: boolean;
  id: string;
  level: number;
  members: null | string;
  name: string;
  parentId: string;
  remark: string;
  sequence: string;
}

type DepartmentPaginationQuery = PaginationQuery<{
  name: string;
  enabled: boolean;
}>

export interface Tenant {
  id: string;
  code: number;
  name: string;
  address: string;
  remark: string;
  location: string;
}

const baseURL = `${BASE_API}/ouaa`
const baseURLMData = `${BASE_API}/mdata`

export class CubeUserService {
  private readonly gateway: CubeGateway

  public constructor (auth: CubeAuth) {
    this.gateway = new CubeGateway(auth)
  }

  public async getUser (userID: string): Promise<User> {
    const url = `${baseURL}/context/user`
    const resp = await this.gateway.get<LegacyServiceError<User>>({
      url,
      payload: {
        id: userID
      }
    })
    return resp.data||resp
  }

  public async getUsers (params: UserPaginationQuery): Promise<Pagination<User>> {
    const url = `${baseURL}/authenticated/user-under-tenant/page`

    const resp = await this.gateway.get<LegacyServiceError<Pagination<User>>>({
      payload: {
        ...params,
      },
      url,
    })
    return resp.data||resp
  }

  public async getTenants (): Promise<Tenant[]> {
    const url = `${baseURLMData}/tenant/mine`
    const resp = await this.gateway.get<LegacyServiceError<Tenant[]>>({
      url,
    })
    return resp.data||resp
  }

  public async getRoles (params: RolePaginationQuery): Promise<Role[]> {
    const url = `${baseURL}/authenticated/product/role/page`
    const resp = await this.gateway.get<LegacyServiceError<Role[]>>({
      payload: {
        ...params,
      },
      url,
    })
    return resp.data||resp
  }

  public async getOrganizations (params: DepartmentPaginationQuery): Promise<Department[]> {
    const url = `${baseURL}/authenticated/organizations/list`
    const resp = await this.gateway.get<LegacyServiceError<Department[]>>({
      payload: {
        ...params,
      },
      url,
    })
    return resp.data||resp
  }
}
