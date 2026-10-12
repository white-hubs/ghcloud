import { request } from "@/service";
import { createRequest } from "@/service/request";

const baseURL = "/work-permit";
const bffRequest = createRequest({ baseURL: "" });

export const getWorkPermitTypeNames = (params?: { typeName?: string }) => {
  return request.get(baseURL + "/work-permit-types/names", { params });
};

export const getWorkPermitLevels = (params?: { typeName?: string }) => {
  return request.get(baseURL + "/work-permit-types/levels", { params });
};

export const getWorkPermitRiskCheckItemIds = (params: { typeName?: string | null; workPermitLevel?: string | null }) => {
  return request.get(baseURL + "/work-permit-types/risk-check-items/ids", { params });
};

export const getWorkPermitAcceptanceItemIds = (params: { typeName?: string | null; workPermitLevel?: string | null }) => {
  return request.get(baseURL + "/work-permit-types/acceptance-items/ids", { params });
};

export const getWorkPermitRiskCheckItems = (params: {
  pageNumber: number;
  pageSize: number;
  typeName?: string | null;
  workPermitLevel?: string | null;
}) => {
  return request.get(baseURL + "/work-permit-types/risk-check-items/page", { params });
};

export const getWorkPermitAcceptanceItems = (params: {
  pageNumber: number;
  pageSize: number;
  typeName?: string | null;
  workPermitLevel?: string | null;
}) => {
  return request.get(baseURL + "/work-permit-types/acceptance-items/page", { params });
};

export const recognizeWorkPermitItemByAi = (data: { itemContent: string; fileIds: string[] }) => {
  return bffRequest.post("/gw-bff/work-permit/associated-items/ai-recognition", data);
};
