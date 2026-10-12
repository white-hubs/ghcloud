import { request } from "@/service";

//汇报类型列表
export const getWorkReportList = () => {
  return request.get(`/report/report-type-page?pageSize=1000&pageNumber=1`);
}
