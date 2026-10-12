import request from "@/utils/request";
let baseURL = "/api/youxianqu-park";

// 招商计划分页
export const getInvestmentPlanPage = params =>
  request({
    url: baseURL + "/investmentPlan/page",
    method: "get",
    params,
  });
  
// 项目管理分页
export const getProjectManagementPage = params =>
  request({
    url: baseURL + "/projectManagement/page",
    method: "get",
    params,
  });
  
// 物业管理分页
export const getEstateContractPage = params =>
  request({
    url: baseURL + "/estateContract/page",
    method: "get",
    params,
  });
  
// 企业投诉分页
export const getComplaintPage = params =>
  request({
    url: baseURL + "/complaint/page",
    method: "get",
    params,
  });
// 租控记录分页
export const getRentRecordPage = params =>
  request({
    url: baseURL + "/rentRecord/page",
    method: "get",
    params,
  });

