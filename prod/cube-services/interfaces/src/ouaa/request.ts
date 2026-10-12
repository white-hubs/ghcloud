import type { Paging } from '@ghcloud/cube-service-interface/base'

export interface GetOrganizationsParams {
  enabled?: boolean;
  name?: string;
  ids?: string[];
}


export interface ListUsersParams extends Partial<Paging> {
  keyword?: string;
  enabled?: boolean;
  //...其它参数
}