import type { Pagination } from '@ghcloud/cube-service-interface/base'
import type { Area } from './response'

export interface MetadataGateway {
  listAllArea: () => Promise<Area[]>;
}