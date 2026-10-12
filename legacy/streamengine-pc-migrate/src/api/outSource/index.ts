import { request } from "@/service"

/**委外公司 */
export const outsourceCompanyList = (id?:string) => {
  return request.get('/maintain/outsource/company/list',{
  params:{
    pageNumber:1,
    pageSize:1000,
    deviceId:id
  
  }
  
  });
}
export const outsourceMode
 = (id?:string) => {
  return request.get('/maintain/outsource/model/listByCompany',{
  params:{
    pageNumber:1,
    pageSize:1000,
    companyId:id
  
  }
  
  });
}