import { request } from '@/service/index'
export const getAreaList = async (): Promise<Service.RequestResult> => {
  return request.get('/mdata/area/list')
}
export const getUser = async (data: {
  pageSize:
  number;
  pageNumber: number;
  keyword: string;
}): Promise<Service.RequestResult> => {
  return request.get('/ouaa/authenticated/user-under-tenant/page', {
    params: {
      ...data,
      enabled: true,
    }
  })
}
export const getDept = async (
): Promise<Service.RequestResult> => {
  return request.get('/ouaa/authenticated/organizations/list', {
    params: {
      enabled: true,
    }
  })
}
export const tenantinfo=(code: string) => request.get(  `/ouaa/tenant-under-tenant/${code}`,);

export const QRcodeDownload = async (params:{
  entityType:string,
  entityInfo:{entityId:string,entityName:string
  }[]}): Promise<Service.RequestResult<any>> => {
  return request.post("/identity/qrcode/generate/batch/download", params, { responseType: 'blob' });
};
