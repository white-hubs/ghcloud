import { request } from "@/service"

let baseURL = '/loose-works'

//小散工程名称列表
export const projectNameList = () => {
  return request.get(baseURL+`/project/apply/nameList`);
}
/** 工程进度跟踪列表 */
export const projectScheduleList = async (params: any) => {
  return request.get('/loose-works/project/schedule/list',{params})
}

/**委外公司 */
export const outsourceCompanyList = () => {
  return request.get('/maintain/outsource/company/list',{
  params:{
    pageNumber:1,
    pageSize:1000
  
  }
  
  });
}
export const outsourceMode
 = () => {
  return request.get('/maintain/outsource/model/list',{
  params:{
    pageNumber:1,
    pageSize:1000
  
  }
  
  });
}