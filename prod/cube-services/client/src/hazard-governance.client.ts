import { makeCreateRequest, makeDELETERequest, makeGETRequest, makeListRequest, makeUpdateRequest } from "@ghcloud/cube-gateway";
import { BASE_API } from "@ghcloud/cube-protocol";
import type { HazardGovernanceGateway } from "@ghcloud/cube-service-interface/hazard-governance";

import { sendHazardJson, sendHazardVoid } from "./hazard-governance-request";

const HAZARD_GOVERNANCE_API = `${BASE_API}/hazard-governance`;

export const getHazardCategoryTree: HazardGovernanceGateway["getHazardCategoryTree"] = async () => {
  return sendHazardJson(makeGETRequest({ url: `${HAZARD_GOVERNANCE_API}/categories/tree` }));
};

export const generateHazardCategoriesByAi: HazardGovernanceGateway["generateHazardCategoriesByAi"] = async (payload) => {
  return sendHazardJson(
    makeCreateRequest({
      url: `${HAZARD_GOVERNANCE_API}/categories/ai/generation`,
      payload: { ...payload },
    }),
  );
};

export const createHazardCategory: HazardGovernanceGateway["createHazardCategory"] = async (payload) => {
  return sendHazardJson(makeCreateRequest({ url: `${HAZARD_GOVERNANCE_API}/categories`, payload: { ...payload } }));
};

export const batchCreateHazardCategories: HazardGovernanceGateway["batchCreateHazardCategories"] = async (payload) => {
  return sendHazardJson(makeCreateRequest({ url: `${HAZARD_GOVERNANCE_API}/categories/batch`, payload: { ...payload } }));
};

export const updateHazardCategory: HazardGovernanceGateway["updateHazardCategory"] = async (id, payload) => {
  return sendHazardVoid(makeUpdateRequest({ url: `${HAZARD_GOVERNANCE_API}/categories/${id}`, payload: { ...payload } }));
};

export const deleteHazardCategory: HazardGovernanceGateway["deleteHazardCategory"] = async (id) => {
  return sendHazardVoid(makeDELETERequest({ url: `${HAZARD_GOVERNANCE_API}/categories/${id}` }));
};

export const createHazardApprovalTemplate: HazardGovernanceGateway["createHazardApprovalTemplate"] = async (payload) => {
  return String(await sendHazardJson(makeCreateRequest({ url: `${HAZARD_GOVERNANCE_API}/approval-templates`, payload: { ...payload } })));
};

export const updateHazardApprovalTemplate: HazardGovernanceGateway["updateHazardApprovalTemplate"] = async (id, payload) => {
  return sendHazardVoid(makeUpdateRequest({ url: `${HAZARD_GOVERNANCE_API}/approval-templates/${id}`, payload: { ...payload } }));
};

export const deleteHazardApprovalTemplate: HazardGovernanceGateway["deleteHazardApprovalTemplate"] = async (id) => {
  return sendHazardVoid(makeDELETERequest({ url: `${HAZARD_GOVERNANCE_API}/approval-templates/${id}` }));
};

export const listHazardApprovalTemplates: HazardGovernanceGateway["listHazardApprovalTemplates"] = async (params) => {
  return sendHazardJson(
    makeGETRequest(
      params
        ? { url: `${HAZARD_GOVERNANCE_API}/approval-templates`, payload: { ...params } }
        : { url: `${HAZARD_GOVERNANCE_API}/approval-templates` },
    ),
  );
};

export const pageHazardApprovalTemplates: HazardGovernanceGateway["pageHazardApprovalTemplates"] = async (params) => {
  return sendHazardJson(makeListRequest({ url: `${HAZARD_GOVERNANCE_API}/approval-templates/page`, payload: { ...params } }));
};

export const pageHazardLedger: HazardGovernanceGateway["pageHazardLedger"] = async (params) => {
  return sendHazardJson(makeListRequest({ url: `${HAZARD_GOVERNANCE_API}/hazards/ledger/page`, payload: { ...params } }));
};

export const getHazardDetail: HazardGovernanceGateway["getHazardDetail"] = async (id) => {
  return sendHazardJson(makeGETRequest({ url: `${HAZARD_GOVERNANCE_API}/hazards/${id}` }));
};

export const createHazardPendingConfirmation: HazardGovernanceGateway["createHazardPendingConfirmation"] = async (payload) => {
  return sendHazardJson(
    makeCreateRequest({
      url: `${HAZARD_GOVERNANCE_API}/hazards/pending-confirmation`,
      payload: { ...payload },
    }),
  );
};

export const batchCreateHazardPendingConfirmation: HazardGovernanceGateway["batchCreateHazardPendingConfirmation"] = async (payload) => {
  return sendHazardJson(
    makeCreateRequest({
      url: `${HAZARD_GOVERNANCE_API}/hazards/pending-confirmation/batch`,
      payload: payload.map((item) => ({ ...item })),
    }),
  );
};

export const recognizeHazardsByAi: HazardGovernanceGateway["recognizeHazardsByAi"] = async (payload) => {
  return sendHazardJson(makeCreateRequest({ url: `${HAZARD_GOVERNANCE_API}/hazards/ai/recognition`, payload: { ...payload } }));
};

export const confirmHazard: HazardGovernanceGateway["confirmHazard"] = async (id, payload) => {
  return sendHazardVoid(makeCreateRequest({ url: `${HAZARD_GOVERNANCE_API}/hazards/${id}/confirm`, payload: { ...payload } }));
};

export const markHazardMisreport: HazardGovernanceGateway["markHazardMisreport"] = async (payload) => {
  return sendHazardVoid(makeCreateRequest({ url: `${HAZARD_GOVERNANCE_API}/hazards/misreport`, payload: { ...payload } }));
};

export const urgeHazard: HazardGovernanceGateway["urgeHazard"] = async (id) => {
  return sendHazardVoid(makeCreateRequest({ url: `${HAZARD_GOVERNANCE_API}/hazards/${id}/urge`, payload: {} }));
};

export const pageHazardApprovalTasks: HazardGovernanceGateway["pageHazardApprovalTasks"] = async (params) => {
  return sendHazardJson(makeListRequest({ url: `${HAZARD_GOVERNANCE_API}/hazards/approval-tasks/page`, payload: { ...params } }));
};

export const getHazardApprovalTaskDetail: HazardGovernanceGateway["getHazardApprovalTaskDetail"] = async (taskId) => {
  return sendHazardJson(makeGETRequest({ url: `${HAZARD_GOVERNANCE_API}/approval-tasks/${taskId}` }));
};

export const approveHazardApprovalTask: HazardGovernanceGateway["approveHazardApprovalTask"] = async (taskId, payload) => {
  return sendHazardVoid(
    makeCreateRequest({
      url: `${HAZARD_GOVERNANCE_API}/approval-tasks/${taskId}/approve`,
      payload: { ...payload },
    }),
  );
};

export const rejectHazardApprovalTask: HazardGovernanceGateway["rejectHazardApprovalTask"] = async (taskId, payload) => {
  return sendHazardVoid(
    makeCreateRequest({
      url: `${HAZARD_GOVERNANCE_API}/approval-tasks/${taskId}/reject`,
      payload: { ...payload },
    }),
  );
};

export const pageHazardAcceptanceTasks: HazardGovernanceGateway["pageHazardAcceptanceTasks"] = async (params) => {
  return sendHazardJson(makeListRequest({ url: `${HAZARD_GOVERNANCE_API}/hazards/acceptance-tasks/page`, payload: { ...params } }));
};

export const getHazardAcceptanceDetail: HazardGovernanceGateway["getHazardAcceptanceDetail"] = async (id) => {
  return sendHazardJson(makeGETRequest({ url: `${HAZARD_GOVERNANCE_API}/hazards/${id}/acceptance` }));
};

export const submitHazardAcceptance: HazardGovernanceGateway["submitHazardAcceptance"] = async (id) => {
  return sendHazardVoid(
    makeCreateRequest({
      url: `${HAZARD_GOVERNANCE_API}/hazards/${id}/acceptance-submission`,
    }),
  );
};

export const acceptHazardAcceptance: HazardGovernanceGateway["acceptHazardAcceptance"] = async (id, payload) => {
  return sendHazardVoid(makeCreateRequest({ url: `${HAZARD_GOVERNANCE_API}/hazards/${id}/acceptance`, payload: { ...payload } }));
};

export const pageHazardRectificationTasks: HazardGovernanceGateway["pageHazardRectificationTasks"] = async (params) => {
  return sendHazardJson(makeListRequest({ url: `${HAZARD_GOVERNANCE_API}/hazards/rectification/page`, payload: { ...params } }));
};

export const submitHazardRectificationPlan: HazardGovernanceGateway["submitHazardRectificationPlan"] = async (id, payload) => {
  return sendHazardJson(
    makeCreateRequest({
      url: `${HAZARD_GOVERNANCE_API}/hazards/${id}/rectification-plan`,
      payload: { ...payload },
    }),
  );
};

export const getLatestHazardRectificationProgress: HazardGovernanceGateway["getLatestHazardRectificationProgress"] = async (id) => {
  return sendHazardJson(makeGETRequest({ url: `${HAZARD_GOVERNANCE_API}/hazards/${id}/rectification-progress` }));
};

export const createHazardRectificationProgress: HazardGovernanceGateway["createHazardRectificationProgress"] = async (id, payload) => {
  return sendHazardJson(
    makeCreateRequest({
      url: `${HAZARD_GOVERNANCE_API}/hazards/${id}/rectification-progress`,
      payload: { ...payload },
    }),
  );
};

export const getHazardTodoStatistics: HazardGovernanceGateway["getHazardTodoStatistics"] = async (params) => {
  return sendHazardJson(
    makeGETRequest({
      url: `${HAZARD_GOVERNANCE_API}/hazards/todo-statistics`,
      payload: { pageNumber: 1, pageSize: 10, ...params },
    }),
  );
};

export const pageHazardTodoItems: HazardGovernanceGateway["pageHazardTodoItems"] = async (params) => {
  return sendHazardJson(
    makeListRequest({
      url: `${HAZARD_GOVERNANCE_API}/hazards/todo-items`,
      payload: { ...params },
    }),
  );
};

export const getHazardDashboardSummary: HazardGovernanceGateway["getHazardDashboardSummary"] = async (params) => {
  return sendHazardJson(
    makeGETRequest({
      url: `${HAZARD_GOVERNANCE_API}/hazards/dashboard/summary`,
      ...(params ? { payload: { ...params } } : {}),
    }),
  );
};

export const getHazardDashboardCharts: HazardGovernanceGateway["getHazardDashboardCharts"] = async (params) => {
  return sendHazardJson(
    makeGETRequest({
      url: `${HAZARD_GOVERNANCE_API}/hazards/dashboard/charts`,
      ...(params ? { payload: { ...params } } : {}),
    }),
  );
};

export const getHazardDashboardRankings: HazardGovernanceGateway["getHazardDashboardRankings"] = async (params) => {
  return sendHazardJson(
    makeGETRequest({
      url: `${HAZARD_GOVERNANCE_API}/hazards/dashboard/rankings`,
      ...(params ? { payload: { ...params } } : {}),
    }),
  );
};

export const getHazardRepeatedRectificationSummary: HazardGovernanceGateway["getHazardRepeatedRectificationSummary"] = async (params) => {
  return sendHazardJson(
    makeGETRequest({
      url: `${HAZARD_GOVERNANCE_API}/root-cause-analysis/repeated-rectifications/summary`,
      payload: { ...params },
    }),
  );
};

export const pageHazardRepeatedRectifications: HazardGovernanceGateway["pageHazardRepeatedRectifications"] = async (params) => {
  return sendHazardJson(
    makeGETRequest({
      url: `${HAZARD_GOVERNANCE_API}/root-cause-analysis/repeated-rectifications/page`,
      payload: { ...params },
    }),
  );
};

export const getHazardRepeatedRectificationDetail: HazardGovernanceGateway["getHazardRepeatedRectificationDetail"] = async (params) => {
  const { id, ...query } = params;
  return sendHazardJson(
    makeGETRequest({
      url: `${HAZARD_GOVERNANCE_API}/root-cause-analysis/repeated-rectifications/${id}`,
      payload: { ...query },
    }),
  );
};

export const decideHazardRepeatedRectification: HazardGovernanceGateway["decideHazardRepeatedRectification"] = async (id, payload) => {
  return sendHazardVoid(
    makeCreateRequest({
      url: `${HAZARD_GOVERNANCE_API}/root-cause-analysis/repeated-rectifications/${id}/decision`,
      payload: { ...payload },
    }),
  );
};
