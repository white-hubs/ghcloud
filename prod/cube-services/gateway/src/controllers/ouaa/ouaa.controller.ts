import {
  Body,
  Controller,
  GET,
  POST,
  Query,
  QueryMap,
} from '@dangao/bun-server';
import { CubeAuthProxy } from '@/decorators/cube-auth-proxy.decorator';
import { OuaaProxyService } from '@/services/proxy/ouaa/ouaa-proxy.service'
import type { GetOrganizationsParams, ListUsersParams, Organization, OuaaGateway, Role, User } from '@ghcloud/cube-service-interface/ouaa'
import type { Pagination } from '@ghcloud/cube-service-interface/base'

@Controller('/gw-bff/ouaa')
export class OuaaController implements OuaaGateway {
  constructor(
    private readonly ouaaProxyService: OuaaProxyService,
  ) {
  }

  @GET('/users')
  @CubeAuthProxy()
  public async listUsers(
    @QueryMap() params: ListUsersParams,
  ): Promise<Pagination<User>> {
    return await this.ouaaProxyService.listUsers(params);
  }

  @GET('/users/get-by-ids')
  @CubeAuthProxy()
  public async getUsersByIds(
    @Query("ids") ids: string,
  ): Promise<User[]> {
    return await this.ouaaProxyService.getUsersByIds(ids.split(','));
  }

  @GET('/organizations')
  @CubeAuthProxy()
  public async getOrganizations(
    @QueryMap() params: GetOrganizationsParams,
  ): Promise<Organization[]> {
    return await this.ouaaProxyService.getOrganizations(params);
  }

  @GET('/organizations/tree')
  @CubeAuthProxy()
  public async getOrganizationTree(
    @QueryMap() params: GetOrganizationsParams,
  ): Promise<Organization[]> {
    return await this.ouaaProxyService.getOrganizationTree(params);
  }
  
  @GET('/roles')
  @CubeAuthProxy()
  public async getRoles(): Promise<Role[]> {
    return await this.ouaaProxyService.getRoles();
  }
}

