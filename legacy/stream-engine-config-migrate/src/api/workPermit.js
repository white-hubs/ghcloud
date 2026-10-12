import request from "@/utils/request";

const baseURL = "/api/work-permit";

export const getWorkPermitTypeNames = (params) => {
  return request.get(baseURL + "/work-permit-types/names", { params });
};

export const getWorkPermitLevels = (params) => {
  return request.get(baseURL + "/work-permit-types/levels", { params });
};

export const getWorkPermitRiskCheckItems = (params) => {
  return request.get(baseURL + "/work-permit-types/risk-check-items/page", { params });
};

export const getWorkPermitAcceptanceItems = (params) => {
  return request.get(baseURL + "/work-permit-types/acceptance-items/page", { params });
};
