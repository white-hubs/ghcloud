import {
  makeCreateRequest,
  makeCustomRequest,
  makeDELETERequest,
  makeGETRequest,
  makeListRequest,
  makeUpdateRequest,
} from "@ghcloud/cube-gateway";
import type {
  RiskAiControlMeasureAnalyzeVO,
  RiskAiIdentificationAnalyzeVO,
  RiskAssessmentMethodVO,
  RiskAssessmentPlanVO,
  RiskAssessmentRecordVO,
  RiskGradedControlGateway,
  RiskReviewReportVO,
  RiskWarningRecordVO,
  RiskWarningRuleVO,
} from "@ghcloud/cube-service-interface/risk-graded-control";

import { sendRiskJson, sendRiskVoid } from "./risk-graded-control-request";

async function patchRequest<T>(url: string, payload: unknown): Promise<T> {
  type CustomRequestConfig = Parameters<typeof makeCustomRequest>[0];
  return sendRiskJson<T>(
    makeCustomRequest({
      url,
      method: "PATCH" as CustomRequestConfig["method"],
      payload: payload as Record<string, unknown>,
    }),
  );
}

export const pageUnitTypes: RiskGradedControlGateway["pageUnitTypes"] = async (params) => {
  return sendRiskJson(makeListRequest({ url: `/gw-bff/risk-graded-control/unit-types`, payload: { ...params } }));
};

export const createUnitType: RiskGradedControlGateway["createUnitType"] = async (payload) => {
  return sendRiskJson(makeCreateRequest({ url: `/gw-bff/risk-graded-control/unit-types`, payload: { ...payload } }));
};

export const getUnitType: RiskGradedControlGateway["getUnitType"] = async (id: string | number) => {
  return sendRiskJson(makeGETRequest({ url: `/gw-bff/risk-graded-control/unit-types/${id}` }));
};

export const updateUnitType: RiskGradedControlGateway["updateUnitType"] = async (id, payload) => {
  return sendRiskJson(makeUpdateRequest({ url: `/gw-bff/risk-graded-control/unit-types/${id}`, payload: { ...payload } }));
};

export const deleteUnitType: RiskGradedControlGateway["deleteUnitType"] = async (id: string | number) => {
  return sendRiskVoid(makeDELETERequest({ url: `/gw-bff/risk-graded-control/unit-types/${id}` }));
};

export const pageWarningSigns: RiskGradedControlGateway["pageWarningSigns"] = async (params) => {
  return sendRiskJson(makeListRequest({ url: `/gw-bff/risk-graded-control/warning-signs`, payload: { ...params } }));
};

export const listWarningSignOptions: RiskGradedControlGateway["listWarningSignOptions"] = async (params) => {
  return sendRiskJson(makeListRequest({ url: `/gw-bff/risk-graded-control/warning-sign-options`, payload: { ...params } }));
};

export const createWarningSign: RiskGradedControlGateway["createWarningSign"] = async (payload) => {
  return sendRiskJson(makeCreateRequest({ url: `/gw-bff/risk-graded-control/warning-signs`, payload: { ...payload } }));
};

export const getWarningSign: RiskGradedControlGateway["getWarningSign"] = async (id: string | number) => {
  return sendRiskJson(makeGETRequest({ url: `/gw-bff/risk-graded-control/warning-signs/${id}` }));
};

export const updateWarningSign: RiskGradedControlGateway["updateWarningSign"] = async (id, payload) => {
  return sendRiskJson(makeUpdateRequest({ url: `/gw-bff/risk-graded-control/warning-signs/${id}`, payload: { ...payload } }));
};

export const updateWarningSignEnabled: RiskGradedControlGateway["updateWarningSignEnabled"] = async (id, payload) => {
  return sendRiskJson(makeUpdateRequest({ url: `/gw-bff/risk-graded-control/warning-signs/${id}/enabled`, payload: { ...payload } }));
};

export const deleteWarningSign: RiskGradedControlGateway["deleteWarningSign"] = async (id: string | number) => {
  return sendRiskVoid(makeDELETERequest({ url: `/gw-bff/risk-graded-control/warning-signs/${id}` }));
};

export const pageAssessmentMethods: RiskGradedControlGateway["pageAssessmentMethods"] = async (params) => {
  return sendRiskJson(makeListRequest({ url: `/gw-bff/risk-graded-control/assessment-methods`, payload: { ...params } }));
};

export const createAssessmentMethod: RiskGradedControlGateway["createAssessmentMethod"] = async (payload) => {
  return sendRiskJson(makeCreateRequest({ url: `/gw-bff/risk-graded-control/assessment-methods`, payload: { ...payload } }));
};

export const getAssessmentMethod: RiskGradedControlGateway["getAssessmentMethod"] = async (id: string | number) => {
  return sendRiskJson(makeGETRequest({ url: `/gw-bff/risk-graded-control/assessment-methods/${id}` }));
};

export const updateAssessmentMethod: RiskGradedControlGateway["updateAssessmentMethod"] = async (id, payload) => {
  return sendRiskJson(makeUpdateRequest({ url: `/gw-bff/risk-graded-control/assessment-methods/${id}`, payload: { ...payload } }));
};

export const patchAssessmentMethod: RiskGradedControlGateway["patchAssessmentMethod"] = async (id, payload) => {
  return patchRequest<RiskAssessmentMethodVO>(`/gw-bff/risk-graded-control/assessment-methods/${id}`, { ...payload });
};

export const deleteAssessmentMethod: RiskGradedControlGateway["deleteAssessmentMethod"] = async (id: string | number) => {
  return sendRiskVoid(makeDELETERequest({ url: `/gw-bff/risk-graded-control/assessment-methods/${id}` }));
};

export const pageRiskObjects: RiskGradedControlGateway["pageRiskObjects"] = async (params) => {
  return sendRiskJson(makeListRequest({ url: `/gw-bff/risk-graded-control/risk-objects`, payload: { ...params } }));
};

export const getRiskObject: RiskGradedControlGateway["getRiskObject"] = async (objectId: string | number) => {
  return sendRiskJson(makeGETRequest({ url: `/gw-bff/risk-graded-control/risk-objects/${objectId}` }));
};

export const generateRiskObjectByAiPhoto: RiskGradedControlGateway["generateRiskObjectByAiPhoto"] = async (payload) => {
  return sendRiskJson<RiskAiIdentificationAnalyzeVO>(
    makeCreateRequest({
      url: `/gw-bff/risk-graded-control/ai/risk-objects/photo-generate`,
      payload: { ...payload },
    }),
  );
};

export const reviseRiskObjectByAiPhoto: RiskGradedControlGateway["reviseRiskObjectByAiPhoto"] = async (objectId, payload) => {
  return sendRiskJson<RiskAiIdentificationAnalyzeVO>(
    makeCreateRequest({
      url: `/gw-bff/risk-graded-control/ai/risk-objects/${objectId}/photo-modify`,
      payload: { ...payload },
    }),
  );
};

export const pageAssessmentTasks: RiskGradedControlGateway["pageAssessmentTasks"] = async (params) => {
  return sendRiskJson(makeListRequest({ url: `/gw-bff/risk-graded-control/assessment-tasks`, payload: { ...params } }));
};

export const listObjectAssessments: RiskGradedControlGateway["listObjectAssessments"] = async (objectId, params) => {
  return sendRiskJson(
    makeListRequest({
      url: `/gw-bff/risk-graded-control/risk-objects/${objectId}/assessments`,
      payload: { ...params },
    }),
  );
};

export const createAssessment: RiskGradedControlGateway["createAssessment"] = async (payload) => {
  return sendRiskJson(makeCreateRequest({ url: `/gw-bff/risk-graded-control/assessments`, payload: { ...payload } }));
};

export const patchAssessment: RiskGradedControlGateway["patchAssessment"] = async (id, payload) => {
  return patchRequest<RiskAssessmentRecordVO>(`/gw-bff/risk-graded-control/assessments/${id}`, { ...payload });
};

export const pageReviewTasks: RiskGradedControlGateway["pageReviewTasks"] = async (params) => {
  return sendRiskJson(makeListRequest({ url: `/gw-bff/risk-graded-control/review-tasks`, payload: { ...params } }));
};

export const getReviewTask: RiskGradedControlGateway["getReviewTask"] = async (objectId: string | number) => {
  return sendRiskJson(makeGETRequest({ url: `/gw-bff/risk-graded-control/review-tasks/${objectId}` }));
};

export const createReviews: RiskGradedControlGateway["createReviews"] = async (payload) => {
  return sendRiskJson(makeCreateRequest({ url: `/gw-bff/risk-graded-control/reviews`, payload: { ...payload } }));
};

export const submitUnitIdentification: RiskGradedControlGateway["submitUnitIdentification"] = async (unitId, payload) => {
  return sendRiskJson(
    makeCreateRequest({
      url: `/gw-bff/risk-graded-control/units/${unitId}/identifications`,
      payload: { ...payload },
    }),
  );
};

export const pageIdentificationUnits: RiskGradedControlGateway["pageIdentificationUnits"] = async (params) => {
  return sendRiskJson(makeListRequest({ url: `/gw-bff/risk-graded-control/identification-units`, payload: { ...params } }));
};

export const pageIdentifications: RiskGradedControlGateway["pageIdentifications"] = async (params) => {
  return sendRiskJson(makeListRequest({ url: `/gw-bff/risk-graded-control/identifications`, payload: { ...params } }));
};

export const getIdentification: RiskGradedControlGateway["getIdentification"] = async (id: string | number) => {
  return sendRiskJson(makeGETRequest({ url: `/gw-bff/risk-graded-control/identifications/${id}` }));
};

export const pageMeasureExecutions: RiskGradedControlGateway["pageMeasureExecutions"] = async (params) => {
  return sendRiskJson(makeListRequest({ url: `/gw-bff/risk-graded-control/measure-executions`, payload: { ...params } }));
};

export const createMeasureExecutionRecord: RiskGradedControlGateway["createMeasureExecutionRecord"] = async (measureId, payload) => {
  return sendRiskJson(
    makeCreateRequest({
      url: `/gw-bff/risk-graded-control/control-measures/${measureId}/execution-records`,
      payload: { ...payload },
    }),
  );
};

export const syncMeasureExecutionBatch: RiskGradedControlGateway["syncMeasureExecutionBatch"] = async (payload) => {
  return sendRiskJson(
    makeCreateRequest({
      url: `/gw-bff/risk-graded-control/measure-execution-sync-batches`,
      payload: payload as Array<Record<string, unknown>>,
    }),
  );
};

export const pageControlMeasures: RiskGradedControlGateway["pageControlMeasures"] = async (params) => {
  return sendRiskJson(makeListRequest({ url: `/gw-bff/risk-graded-control/control-measures`, payload: { ...params } }));
};

export const listObjectControlMeasures: RiskGradedControlGateway["listObjectControlMeasures"] = async (objectId, params) => {
  return sendRiskJson(
    makeListRequest({
      url: `/gw-bff/risk-graded-control/risk-objects/${objectId}/control-measures`,
      payload: { ...params },
    }),
  );
};

export const saveObjectControlMeasures: RiskGradedControlGateway["saveObjectControlMeasures"] = async (objectId, payload) => {
  return sendRiskJson(
    makeUpdateRequest({
      url: `/gw-bff/risk-graded-control/risk-objects/${objectId}/control-measures`,
      payload: { ...payload },
    }),
  );
};

export const getControlMeasure: RiskGradedControlGateway["getControlMeasure"] = async (measureId: string | number) => {
  return sendRiskJson(makeGETRequest({ url: `/gw-bff/risk-graded-control/control-measures/${measureId}` }));
};

export const generateControlMeasuresByAi: RiskGradedControlGateway["generateControlMeasuresByAi"] = async (objectId, payload) => {
  return sendRiskJson<RiskAiControlMeasureAnalyzeVO>(
    makeCreateRequest({
      url: `/gw-bff/risk-graded-control/ai/risk-objects/${objectId}/control-measures/generate`,
      payload: { ...payload },
    }),
  );
};

export const pageReviewReports: RiskGradedControlGateway["pageReviewReports"] = async (params) => {
  return sendRiskJson(
    makeListRequest({
      url: `/gw-bff/risk-graded-control/review-reports`,
      payload: { ...params, pageNum: params?.pageNum ?? params?.pageNumber },
    }),
  );
};

export const getReviewReport: RiskGradedControlGateway["getReviewReport"] = async (id) => {
  return sendRiskJson(makeGETRequest({ url: `/gw-bff/risk-graded-control/review-reports/${id}` }));
};

export const generateReviewReport: RiskGradedControlGateway["generateReviewReport"] = async (payload) => {
  return sendRiskJson<RiskReviewReportVO>(
    makeCreateRequest({
      url: `/gw-bff/risk-graded-control/review-reports`,
      payload: { ...payload },
    }),
  );
};

export const recheckReviewReport: RiskGradedControlGateway["recheckReviewReport"] = async (id, payload) => {
  return sendRiskJson<RiskReviewReportVO>(
    makeCreateRequest({
      url: `/gw-bff/risk-graded-control/review-reports/${id}/regenerate`,
      payload: { ...(payload ?? {}) },
    }),
  );
};

export const createReviewReportDraft: RiskGradedControlGateway["createReviewReportDraft"] = async (payload) => {
  return sendRiskJson<RiskReviewReportVO>(
    makeCreateRequest({
      url: `/gw-bff/risk-graded-control/review-reports/draft`,
      payload: { ...payload },
    }),
  );
};

export const saveReviewReportDraft: RiskGradedControlGateway["saveReviewReportDraft"] = async (id, payload) => {
  return sendRiskJson<RiskReviewReportVO>(
    makeUpdateRequest({
      url: `/gw-bff/risk-graded-control/review-reports/${id}/draft`,
      payload: { ...payload },
    }),
  );
};

export const submitNewReviewReport: RiskGradedControlGateway["submitNewReviewReport"] = async (payload) => {
  return sendRiskJson<RiskReviewReportVO>(
    makeCreateRequest({
      url: `/gw-bff/risk-graded-control/review-reports/submit`,
      payload: { ...payload },
    }),
  );
};

export const submitReviewReport: RiskGradedControlGateway["submitReviewReport"] = async (id, payload) => {
  return sendRiskJson<RiskReviewReportVO>(
    makeCreateRequest({
      url: `/gw-bff/risk-graded-control/review-reports/${id}/submit`,
      payload: { ...(payload ?? {}) },
    }),
  );
};

export const pageAssessmentPlans: RiskGradedControlGateway["pageAssessmentPlans"] = async (params) => {
  return sendRiskJson(makeListRequest({ url: `/gw-bff/risk-graded-control/assessment-plans`, payload: { ...params } }));
};

export const createAssessmentPlan: RiskGradedControlGateway["createAssessmentPlan"] = async (payload) => {
  return sendRiskJson(makeCreateRequest({ url: `/gw-bff/risk-graded-control/assessment-plans`, payload: { ...payload } }));
};

export const getAssessmentPlan: RiskGradedControlGateway["getAssessmentPlan"] = async (id: string | number) => {
  return sendRiskJson(makeGETRequest({ url: `/gw-bff/risk-graded-control/assessment-plans/${id}` }));
};

export const updateAssessmentPlan: RiskGradedControlGateway["updateAssessmentPlan"] = async (id, payload) => {
  return sendRiskJson(makeUpdateRequest({ url: `/gw-bff/risk-graded-control/assessment-plans/${id}`, payload: { ...payload } }));
};

export const patchAssessmentPlan: RiskGradedControlGateway["patchAssessmentPlan"] = async (id, payload) => {
  return patchRequest<RiskAssessmentPlanVO>(`/gw-bff/risk-graded-control/assessment-plans/${id}`, { ...payload });
};

export const deleteAssessmentPlan: RiskGradedControlGateway["deleteAssessmentPlan"] = async (id: string | number) => {
  return sendRiskVoid(makeDELETERequest({ url: `/gw-bff/risk-graded-control/assessment-plans/${id}` }));
};

export const pageWarningRules: RiskGradedControlGateway["pageWarningRules"] = async (params) => {
  return sendRiskJson(makeListRequest({ url: `/gw-bff/risk-graded-control/warning-rules`, payload: { ...params } }));
};

export const createWarningRule: RiskGradedControlGateway["createWarningRule"] = async (payload) => {
  return sendRiskJson(makeCreateRequest({ url: `/gw-bff/risk-graded-control/warning-rules`, payload: { ...payload } }));
};

export const getWarningRule: RiskGradedControlGateway["getWarningRule"] = async (id: string | number) => {
  return sendRiskJson(makeGETRequest({ url: `/gw-bff/risk-graded-control/warning-rules/${id}` }));
};

export const updateWarningRule: RiskGradedControlGateway["updateWarningRule"] = async (id, payload) => {
  return sendRiskJson(makeUpdateRequest({ url: `/gw-bff/risk-graded-control/warning-rules/${id}`, payload: { ...payload } }));
};

export const patchWarningRule: RiskGradedControlGateway["patchWarningRule"] = async (id, payload) => {
  return patchRequest<RiskWarningRuleVO>(`/gw-bff/risk-graded-control/warning-rules/${id}`, { ...payload });
};

export const deleteWarningRule: RiskGradedControlGateway["deleteWarningRule"] = async (id: string | number) => {
  return sendRiskVoid(makeDELETERequest({ url: `/gw-bff/risk-graded-control/warning-rules/${id}` }));
};

export const pageWarningRecords: RiskGradedControlGateway["pageWarningRecords"] = async (params) => {
  return sendRiskJson(makeListRequest({ url: `/gw-bff/risk-graded-control/warning-records`, payload: { ...params } }));
};

export const getWarningRecord: RiskGradedControlGateway["getWarningRecord"] = async (id: string | number) => {
  return sendRiskJson(makeGETRequest({ url: `/gw-bff/risk-graded-control/warning-records/${id}` }));
};

export const patchWarningRecord: RiskGradedControlGateway["patchWarningRecord"] = async (id, payload) => {
  return patchRequest<RiskWarningRecordVO>(`/gw-bff/risk-graded-control/warning-records/${id}`, { ...payload });
};

export const pageUnitInventory: RiskGradedControlGateway["pageUnitInventory"] = async (params) => {
  return sendRiskJson(makeListRequest({ url: `/gw-bff/risk-graded-control/unit-inventory`, payload: { ...params } }));
};

export const listUnitInventoryObjects: RiskGradedControlGateway["listUnitInventoryObjects"] = async (unitId, params) => {
  return sendRiskJson(
    makeListRequest({
      url: `/gw-bff/risk-graded-control/unit-inventory/${unitId}/risk-objects`,
      payload: { ...params },
    }),
  );
};

export const pageNoticeCards: RiskGradedControlGateway["pageNoticeCards"] = async (params) => {
  return sendRiskJson(makeListRequest({ url: `/gw-bff/risk-graded-control/notice-cards`, payload: { ...params } }));
};

export const getNoticeCard: RiskGradedControlGateway["getNoticeCard"] = async (unitId: string | number) => {
  return sendRiskJson(makeGETRequest({ url: `/gw-bff/risk-graded-control/notice-cards/${unitId}` }));
};

export const getFourColorMapStatistics: RiskGradedControlGateway["getFourColorMapStatistics"] = async (params) => {
  return sendRiskJson(makeGETRequest({ url: `/gw-bff/risk-graded-control/four-color-map-statistics`, payload: { ...params } }));
};

export const pageFourColorMapUnits: RiskGradedControlGateway["pageFourColorMapUnits"] = async (params) => {
  return sendRiskJson(makeListRequest({ url: `/gw-bff/risk-graded-control/four-color-map-units`, payload: { ...params } }));
};

export const getFourColorMapUnit: RiskGradedControlGateway["getFourColorMapUnit"] = async (unitId: string | number) => {
  return sendRiskJson(makeGETRequest({ url: `/gw-bff/risk-graded-control/four-color-map-units/${unitId}` }));
};

export const pageAreas: RiskGradedControlGateway["pageAreas"] = async (params) => {
  return sendRiskJson(makeListRequest({ url: `/gw-bff/risk-graded-control/areas`, payload: { ...params } }));
};

export const createArea: RiskGradedControlGateway["createArea"] = async (payload) => {
  return sendRiskJson(makeCreateRequest({ url: `/gw-bff/risk-graded-control/areas`, payload: { ...payload } }));
};

export const getArea: RiskGradedControlGateway["getArea"] = async (id: string | number) => {
  return sendRiskJson(makeGETRequest({ url: `/gw-bff/risk-graded-control/areas/${id}` }));
};

export const updateArea: RiskGradedControlGateway["updateArea"] = async (id, payload) => {
  return sendRiskJson(makeUpdateRequest({ url: `/gw-bff/risk-graded-control/areas/${id}`, payload: { ...payload } }));
};

export const deleteArea: RiskGradedControlGateway["deleteArea"] = async (id: string | number) => {
  return sendRiskVoid(makeDELETERequest({ url: `/gw-bff/risk-graded-control/areas/${id}` }));
};

export const pageUnits: RiskGradedControlGateway["pageUnits"] = async (params) => {
  return sendRiskJson(makeListRequest({ url: `/gw-bff/risk-graded-control/units`, payload: { ...params } }));
};

export const createUnit: RiskGradedControlGateway["createUnit"] = async (payload) => {
  return sendRiskJson(makeCreateRequest({ url: `/gw-bff/risk-graded-control/units`, payload: { ...payload } }));
};

export const getUnit: RiskGradedControlGateway["getUnit"] = async (id: string | number) => {
  return sendRiskJson(makeGETRequest({ url: `/gw-bff/risk-graded-control/units/${id}` }));
};

export const updateUnit: RiskGradedControlGateway["updateUnit"] = async (id, payload) => {
  return sendRiskJson(makeUpdateRequest({ url: `/gw-bff/risk-graded-control/units/${id}`, payload: { ...payload } }));
};

export const deleteUnit: RiskGradedControlGateway["deleteUnit"] = async (id: string | number) => {
  return sendRiskVoid(makeDELETERequest({ url: `/gw-bff/risk-graded-control/units/${id}` }));
};
