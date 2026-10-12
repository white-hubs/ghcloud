import { makeCreateRequest, makeDELETERequest, makeGETRequest, makeListRequest, makeUpdateRequest } from "@ghcloud/cube-gateway";
import type { SafetyPersonnelGateway } from "@ghcloud/cube-service-interface/safety-personnel";

const BFF = "/gw-bff/safety-personnel";
const KEY_PERSONNEL = `${BFF}/key-personnel`;
const DUTY = BFF;

export const pageCertificates: SafetyPersonnelGateway["pageCertificates"] = async (params) => {
  const resp = await makeListRequest({ url: `${BFF}/certificates`, payload: { ...params } }).send();
  return resp.json();
};

export const getCertificate: SafetyPersonnelGateway["getCertificate"] = async (id) => {
  const resp = await makeGETRequest({ url: `${BFF}/certificates/${id}` }).send();
  return resp.json();
};

export const createCertificate: SafetyPersonnelGateway["createCertificate"] = async (payload) => {
  const resp = await makeCreateRequest({
    url: `${BFF}/certificates`,
    payload: { ...payload },
  }).send();
  return resp.json();
};

export const updateCertificate: SafetyPersonnelGateway["updateCertificate"] = async (id, payload) => {
  const resp = await makeUpdateRequest({
    url: `${BFF}/certificates/${id}`,
    payload: { ...payload },
  }).send();
  return resp.json();
};

export const deleteCertificate: SafetyPersonnelGateway["deleteCertificate"] = async (id) => {
  const resp = await makeDELETERequest({ url: `${BFF}/certificates/${id}` }).send();
  await resp.blob();
};

export const exportCertificates: SafetyPersonnelGateway["exportCertificates"] = async (params) => {
  const resp = await makeCreateRequest({
    url: `${BFF}/certificates/export`,
    payload: { ...params },
  }).send();
  return resp.blob();
};

export const getCertCategoryTree: SafetyPersonnelGateway["getCertCategoryTree"] = async () => {
  const resp = await makeGETRequest({ url: `${BFF}/cert/categories/tree` }).send();
  return resp.json();
};

export const createCertCategory: SafetyPersonnelGateway["createCertCategory"] = async (payload) => {
  const resp = await makeCreateRequest({
    url: `${BFF}/cert/categories`,
    payload: { ...payload },
  }).send();
  return resp.json();
};

export const createCertCategoryChild: SafetyPersonnelGateway["createCertCategoryChild"] = async (parentId, payload) => {
  const resp = await makeCreateRequest({
    url: `${BFF}/cert/categories/${parentId}/children`,
    payload: { ...payload },
  }).send();
  return resp.json();
};

export const updateCertCategory: SafetyPersonnelGateway["updateCertCategory"] = async (id, payload) => {
  const resp = await makeUpdateRequest({
    url: `${BFF}/cert/categories/${id}`,
    payload: { ...payload },
  }).send();
  return resp.json();
};

export const deleteCertCategory: SafetyPersonnelGateway["deleteCertCategory"] = async (id) => {
  const resp = await makeDELETERequest({ url: `${BFF}/cert/categories/${id}` }).send();
  await resp.blob();
};

export const pageCertTypes: SafetyPersonnelGateway["pageCertTypes"] = async (params) => {
  const resp = await makeListRequest({ url: `${BFF}/cert/types`, payload: { ...params } }).send();
  return resp.json();
};

export const getCertType: SafetyPersonnelGateway["getCertType"] = async (id) => {
  const resp = await makeGETRequest({ url: `${BFF}/cert/types/${id}` }).send();
  return resp.json();
};

export const createCertType: SafetyPersonnelGateway["createCertType"] = async (payload) => {
  const resp = await makeCreateRequest({
    url: `${BFF}/cert/types`,
    payload: { ...payload },
  }).send();
  return resp.json();
};

export const updateCertType: SafetyPersonnelGateway["updateCertType"] = async (id, payload) => {
  const resp = await makeUpdateRequest({
    url: `${BFF}/cert/types/${id}`,
    payload: { ...payload },
  }).send();
  return resp.json();
};

export const deleteCertType: SafetyPersonnelGateway["deleteCertType"] = async (id) => {
  const resp = await makeDELETERequest({ url: `${BFF}/cert/types/${id}` }).send();
  await resp.blob();
};

export const pageCommittees: SafetyPersonnelGateway["pageCommittees"] = async (params) => {
  const resp = await makeListRequest({ url: `${BFF}/committees`, payload: { ...params } }).send();
  return resp.json();
};

export const getCommittee: SafetyPersonnelGateway["getCommittee"] = async (id) => {
  const resp = await makeGETRequest({ url: `${BFF}/committees/${id}` }).send();
  return resp.json();
};

export const createCommittee: SafetyPersonnelGateway["createCommittee"] = async (payload) => {
  const resp = await makeCreateRequest({
    url: `${BFF}/committees`,
    payload: { ...payload },
  }).send();
  return resp.json();
};

export const updateCommittee: SafetyPersonnelGateway["updateCommittee"] = async (id, payload) => {
  const resp = await makeUpdateRequest({
    url: `${BFF}/committees/${id}`,
    payload: { ...payload },
  }).send();
  return resp.json();
};

export const deleteCommittee: SafetyPersonnelGateway["deleteCommittee"] = async (id) => {
  const resp = await makeDELETERequest({ url: `${BFF}/committees/${id}` }).send();
  await resp.blob();
};

export const getCommitteeChangeLogs: SafetyPersonnelGateway["getCommitteeChangeLogs"] = async (id) => {
  const resp = await makeGETRequest({ url: `${BFF}/committees/${id}/change-logs` }).send();
  return resp.json();
};

export const getHomeOrgArchitecture: SafetyPersonnelGateway["getHomeOrgArchitecture"] = async () => {
  const resp = await makeGETRequest({ url: `${BFF}/home/org-architecture` }).send();
  return resp.json();
};

export const getOrgTree: SafetyPersonnelGateway["getOrgTree"] = async () => {
  const resp = await makeGETRequest({ url: `${BFF}/org/tree` }).send();
  return resp.json();
};

export const getOrgNode: SafetyPersonnelGateway["getOrgNode"] = async (id) => {
  const resp = await makeGETRequest({ url: `${BFF}/org/nodes/${id}` }).send();
  return resp.json();
};

export const createOrgNode: SafetyPersonnelGateway["createOrgNode"] = async (payload) => {
  const resp = await makeCreateRequest({ url: `${BFF}/org/nodes`, payload: { ...payload } }).send();
  return resp.json();
};

export const createOrgNodeChild: SafetyPersonnelGateway["createOrgNodeChild"] = async (parentId, payload) => {
  const resp = await makeCreateRequest({
    url: `${BFF}/org/nodes/${parentId}/children`,
    payload: { ...payload },
  }).send();
  return resp.json();
};

export const updateOrgNode: SafetyPersonnelGateway["updateOrgNode"] = async (id, payload) => {
  const resp = await makeUpdateRequest({
    url: `${BFF}/org/nodes/${id}`,
    payload: { ...payload },
  }).send();
  return resp.json();
};

export const deleteOrgNode: SafetyPersonnelGateway["deleteOrgNode"] = async (id) => {
  const resp = await makeDELETERequest({ url: `${BFF}/org/nodes/${id}` }).send();
  await resp.blob();
};

export const saveOrgNodeMembers: SafetyPersonnelGateway["saveOrgNodeMembers"] = async (id, payload) => {
  const resp = await makeUpdateRequest({
    url: `${BFF}/org/nodes/${id}/members`,
    payload: { ...payload },
  }).send();
  return resp.json();
};

export const pageOrgUserCandidates: SafetyPersonnelGateway["pageOrgUserCandidates"] = async (params) => {
  const resp = await makeListRequest({
    url: `${BFF}/org/user-candidates`,
    payload: { ...params },
  }).send();
  return resp.json();
};

export const pagePersons: SafetyPersonnelGateway["pagePersons"] = async (params) => {
  const resp = await makeListRequest({ url: `${BFF}/persons`, payload: { ...params } }).send();
  return resp.json();
};

export const pagePersonPool: SafetyPersonnelGateway["pagePersonPool"] = async (params) => {
  const resp = await makeListRequest({ url: `${BFF}/persons/pool`, payload: { ...params } }).send();
  return resp.json();
};

export const linkPersons: SafetyPersonnelGateway["linkPersons"] = async (payload) => {
  const resp = await makeCreateRequest({
    url: `${BFF}/persons/link`,
    payload: { ...payload },
  }).send();
  await resp.blob();
};

export const deletePerson: SafetyPersonnelGateway["deletePerson"] = async (id) => {
  const resp = await makeDELETERequest({ url: `${BFF}/persons/${id}` }).send();
  await resp.blob();
};

export const getPersonProfile: SafetyPersonnelGateway["getPersonProfile"] = async (id) => {
  const resp = await makeGETRequest({ url: `${BFF}/persons/${id}/profile` }).send();
  return resp.json();
};

export const getPersonCertificates: SafetyPersonnelGateway["getPersonCertificates"] = async (id) => {
  const resp = await makeGETRequest({ url: `${BFF}/persons/${id}/certificates` }).send();
  return resp.json();
};

export const getPersonResumeTimeline: SafetyPersonnelGateway["getPersonResumeTimeline"] = async (id, query) => {
  const resp = await makeGETRequest({
    url: `${BFF}/persons/${id}/resume/timeline`,
    payload: query ? { ...query } : undefined,
  }).send();
  return resp.json();
};

export const getPersonResumeByType: SafetyPersonnelGateway["getPersonResumeByType"] = async (id, type, query) => {
  const resp = await makeGETRequest({
    url: `${BFF}/persons/${id}/resume/${type}`,
    payload: query ? { ...query } : undefined,
  }).send();
  return resp.json();
};

export const exportPersons: SafetyPersonnelGateway["exportPersons"] = async (params) => {
  const resp = await makeCreateRequest({
    url: `${BFF}/persons/export`,
    payload: { ...params },
  }).send();
  return resp.blob();
};

export const exportPersonResume: SafetyPersonnelGateway["exportPersonResume"] = async (id, query) => {
  const resp = await makeCreateRequest({
    url: `${BFF}/persons/${id}/resume/export`,
    payload: query ? { ...query } : {},
  }).send();
  return resp.blob();
};

export const pageKeyPersons: SafetyPersonnelGateway["pageKeyPersons"] = async (params) => {
  const resp = await makeListRequest({
    url: `${KEY_PERSONNEL}/persons`,
    payload: { ...params },
  }).send();
  return resp.json();
};

export const createKeyPerson: SafetyPersonnelGateway["createKeyPerson"] = async (payload) => {
  const resp = await makeCreateRequest({
    url: `${KEY_PERSONNEL}/persons`,
    payload: { ...payload },
  }).send();
  return resp.json();
};

export const getKeyPersonDetail: SafetyPersonnelGateway["getKeyPersonDetail"] = async (id) => {
  const resp = await makeGETRequest({ url: `${KEY_PERSONNEL}/persons/${id}` }).send();
  return resp.json();
};

export const updateKeyPerson: SafetyPersonnelGateway["updateKeyPerson"] = async (id, payload) => {
  const resp = await makeUpdateRequest({
    url: `${KEY_PERSONNEL}/persons/${id}`,
    payload: { ...payload },
  }).send();
  await resp.blob();
};

export const deleteKeyPerson: SafetyPersonnelGateway["deleteKeyPerson"] = async (id) => {
  const resp = await makeDELETERequest({ url: `${KEY_PERSONNEL}/persons/${id}` }).send();
  await resp.blob();
};

export const getKeyPersonOptions: SafetyPersonnelGateway["getKeyPersonOptions"] = async (keyword) => {
  const resp = await makeGETRequest({
    url: `${KEY_PERSONNEL}/persons/options`,
    payload: keyword ? { keyword } : undefined,
  }).send();
  return resp.json();
};

export const pageKeyPersonReports: SafetyPersonnelGateway["pageKeyPersonReports"] = async (params) => {
  const { personId, ...query } = params;
  const resp = await makeListRequest({
    url: `${KEY_PERSONNEL}/persons/${personId}/reports`,
    payload: { ...query },
  }).send();
  return resp.json();
};

export const createKeyPersonReport: SafetyPersonnelGateway["createKeyPersonReport"] = async (personId, payload) => {
  const resp = await makeCreateRequest({
    url: `${KEY_PERSONNEL}/persons/${personId}/reports`,
    payload: { ...payload },
  }).send();
  return resp.json();
};

export const getKeyPersonAreaOptions: SafetyPersonnelGateway["getKeyPersonAreaOptions"] = async (keyword) => {
  const resp = await makeGETRequest({
    url: `${KEY_PERSONNEL}/areas/options`,
    payload: keyword ? { keyword } : undefined,
  }).send();
  return resp.json();
};

export const getKeyPersonSupervisorOptions: SafetyPersonnelGateway["getKeyPersonSupervisorOptions"] = async (keyword) => {
  const resp = await makeGETRequest({
    url: `${KEY_PERSONNEL}/supervisors/options`,
    payload: keyword ? { keyword } : undefined,
  }).send();
  return resp.json();
};

export const getKeyPersonStatisticsDashboard: SafetyPersonnelGateway["getKeyPersonStatisticsDashboard"] = async () => {
  const resp = await makeGETRequest({ url: `${KEY_PERSONNEL}/statistics/dashboard` }).send();
  return resp.json();
};

export const getKeyPersonAreaSupervisorStats: SafetyPersonnelGateway["getKeyPersonAreaSupervisorStats"] = async () => {
  const resp = await makeGETRequest({
    url: `${KEY_PERSONNEL}/statistics/area-supervisors`,
  }).send();
  return resp.json();
};

export const getKeyPersonAreaHighRiskStats: SafetyPersonnelGateway["getKeyPersonAreaHighRiskStats"] = async () => {
  const resp = await makeGETRequest({ url: `${KEY_PERSONNEL}/statistics/area-high-risk` }).send();
  return resp.json();
};

export const listDutyRoleAssignments: SafetyPersonnelGateway["listDutyRoleAssignments"] = async (params) => {
  const resp = await makeGETRequest({ url: `${DUTY}/duty-role-assignments`, payload: params ? { ...params } : undefined }).send();
  return resp.json();
};

export const pageDutyRoleUserCandidates: SafetyPersonnelGateway["pageDutyRoleUserCandidates"] = async (params) => {
  const resp = await makeListRequest({ url: `${DUTY}/duty-role-assignment-user-candidates`, payload: { ...params } }).send();
  return resp.json();
};

export const saveDutyRoleAssignments: SafetyPersonnelGateway["saveDutyRoleAssignments"] = async (payload) => {
  const resp = await makeUpdateRequest({ url: `${DUTY}/duty-role-assignments`, payload: { ...payload } }).send();
  return resp.json();
};

export const pageDutyTemplates: SafetyPersonnelGateway["pageDutyTemplates"] = async (params) => {
  const resp = await makeListRequest({ url: `${DUTY}/duty-templates`, payload: { ...params } }).send();
  return resp.json();
};

export const pageDutyTemplateItems: SafetyPersonnelGateway["pageDutyTemplateItems"] = async (params) => {
  const resp = await makeListRequest({ url: `${DUTY}/duty-template-items`, payload: { ...params } }).send();
  return resp.json();
};

export const getDutyTemplateItemStatistics: SafetyPersonnelGateway["getDutyTemplateItemStatistics"] = async (params) => {
  const resp = await makeGETRequest({ url: `${DUTY}/duty-template-item-statistics`, payload: { ...params } }).send();
  return resp.json();
};

export const createDutyTemplate: SafetyPersonnelGateway["createDutyTemplate"] = async (payload) => {
  const resp = await makeCreateRequest({ url: `${DUTY}/duty-templates`, payload: { ...payload } }).send();
  return resp.json();
};

export const createDutyTemplateItem: SafetyPersonnelGateway["createDutyTemplateItem"] = async (payload) => {
  const resp = await makeCreateRequest({ url: `${DUTY}/duty-template-items`, payload: { ...payload } }).send();
  return resp.json();
};

export const createDutyTemplateItems: SafetyPersonnelGateway["createDutyTemplateItems"] = async (payload) => {
  const resp = await makeCreateRequest({ url: `${DUTY}/duty-template-items/batch`, payload: { ...payload } }).send();
  return resp.json();
};

export const getDutyTemplate: SafetyPersonnelGateway["getDutyTemplate"] = async (id) => {
  const resp = await makeGETRequest({ url: `${DUTY}/duty-templates/${id}` }).send();
  return resp.json();
};

export const updateDutyTemplate: SafetyPersonnelGateway["updateDutyTemplate"] = async (id, payload) => {
  const resp = await makeUpdateRequest({ url: `${DUTY}/duty-templates/${id}`, payload: { ...payload } }).send();
  return resp.json();
};

export const updateDutyTemplateItem: SafetyPersonnelGateway["updateDutyTemplateItem"] = async (id, payload) => {
  const resp = await makeUpdateRequest({ url: `${DUTY}/duty-template-items/${id}`, payload: { ...payload } }).send();
  return resp.json();
};

export const deleteDutyTemplateItem: SafetyPersonnelGateway["deleteDutyTemplateItem"] = async (id) => {
  const resp = await makeDELETERequest({ url: `${DUTY}/duty-template-items/${id}` }).send();
  await resp.blob();
};

export const listDutyLegalClauses: SafetyPersonnelGateway["listDutyLegalClauses"] = async (params) => {
  const resp = await makeGETRequest({ url: `${DUTY}/duty-legal-clauses`, payload: { ...params } }).send();
  return resp.json();
};

export const listDutyLawNames: SafetyPersonnelGateway["listDutyLawNames"] = async () => {
  const resp = await makeGETRequest({ url: `${DUTY}/duty-law-names` }).send();
  return resp.json();
};

export const listDutyEvidenceSourceOptions: SafetyPersonnelGateway["listDutyEvidenceSourceOptions"] = async (params) => {
  const resp = await makeGETRequest({ url: `${DUTY}/duty-evidence-source-options`, payload: params ? { ...params } : undefined }).send();
  return resp.json();
};

export const checkDutyTemplateItemDuplicate: SafetyPersonnelGateway["checkDutyTemplateItemDuplicate"] = async (payload) => {
  const resp = await makeCreateRequest({ url: `${DUTY}/duty-template-item-duplicate-checks`, payload: { ...payload } }).send();
  return resp.json();
};

export const createDutyTemplateVersion: SafetyPersonnelGateway["createDutyTemplateVersion"] = async (payload) => {
  const resp = await makeCreateRequest({ url: `${DUTY}/duty-template-versions`, payload: { ...payload } }).send();
  return resp.json();
};

export const listDutyTemplateVersions: SafetyPersonnelGateway["listDutyTemplateVersions"] = async (id) => {
  const resp = await makeGETRequest({ url: `${DUTY}/duty-templates/${id}/versions` }).send();
  return resp.json();
};

export const rollbackDutyTemplateVersion: SafetyPersonnelGateway["rollbackDutyTemplateVersion"] = async (payload) => {
  const resp = await makeCreateRequest({ url: `${DUTY}/duty-template-version-rollbacks`, payload: { ...payload } }).send();
  return resp.json();
};

export const getDutyAssignmentOverviewStatistics: SafetyPersonnelGateway["getDutyAssignmentOverviewStatistics"] = async (params) => {
  const resp = await makeGETRequest({
    url: `${DUTY}/duty-assignments/overview-statistics`,
    payload: params ? { ...params } : undefined,
  }).send();
  return resp.json();
};

export const listDutyAssignmentOverviewRoleGroups: SafetyPersonnelGateway["listDutyAssignmentOverviewRoleGroups"] = async (params) => {
  const resp = await makeGETRequest({
    url: `${DUTY}/duty-assignments/overview-role-groups`,
    payload: params ? { ...params } : undefined,
  }).send();
  return resp.json();
};

export const pageDutyAssignments: SafetyPersonnelGateway["pageDutyAssignments"] = async (params) => {
  const resp = await makeListRequest({ url: `${DUTY}/duty-assignments`, payload: { ...params } }).send();
  return resp.json();
};

export const getDutyAssignment: SafetyPersonnelGateway["getDutyAssignment"] = async (id, params) => {
  const resp = await makeGETRequest({ url: `${DUTY}/duty-assignments/${id}`, payload: params ? { ...params } : undefined }).send();
  return resp.json();
};

export const getCurrentDutyAssignment: SafetyPersonnelGateway["getCurrentDutyAssignment"] = async (params) => {
  const resp = await makeGETRequest({ url: `${DUTY}/duty-my-assignments/current`, payload: params ? { ...params } : undefined }).send();
  return resp.json();
};

export const getDutySignatureTrackingStatistics: SafetyPersonnelGateway["getDutySignatureTrackingStatistics"] = async (params) => {
  const resp = await makeGETRequest({
    url: `${DUTY}/duty-signatures/tracking-statistics`,
    payload: params ? { ...params } : undefined,
  }).send();
  return resp.json();
};

export const getDutyDispatchOptions: SafetyPersonnelGateway["getDutyDispatchOptions"] = async (params) => {
  const resp = await makeGETRequest({ url: `${DUTY}/duty-dispatch-options`, payload: params ? { ...params } : undefined }).send();
  return resp.json();
};

export const createDutyDispatch: SafetyPersonnelGateway["createDutyDispatch"] = async (payload) => {
  const resp = await makeCreateRequest({ url: `${DUTY}/duty-dispatches`, payload: { ...payload } }).send();
  return resp.json();
};

export const pageDutyDispatches: SafetyPersonnelGateway["pageDutyDispatches"] = async (params) => {
  const resp = await makeListRequest({ url: `${DUTY}/duty-dispatches`, payload: { ...params } }).send();
  return resp.json();
};

export const pageDutySignatures: SafetyPersonnelGateway["pageDutySignatures"] = async (dispatchId, params) => {
  const resp = await makeListRequest({ url: `${DUTY}/duty-dispatches/${dispatchId}/signatures`, payload: { ...params } }).send();
  return resp.json();
};

export const getDutySignPreview: SafetyPersonnelGateway["getDutySignPreview"] = async () => {
  const resp = await makeGETRequest({ url: `${DUTY}/duty-my-assignments/sign-preview` }).send();
  return resp.json();
};

export const signDutyAssignment: SafetyPersonnelGateway["signDutyAssignment"] = async (payload) => {
  const resp = await makeCreateRequest({ url: `${DUTY}/duty-signatures`, payload: { ...payload } }).send();
  return resp.json();
};

export const listDutyAssignmentItemRecords: SafetyPersonnelGateway["listDutyAssignmentItemRecords"] = async (assignmentItemId) => {
  const resp = await makeGETRequest({ url: `${DUTY}/duty-assignment-items/${assignmentItemId}/records` }).send();
  return resp.json();
};

export const listCurrentDutyAssignmentItemRecords: SafetyPersonnelGateway["listCurrentDutyAssignmentItemRecords"] = async (
  assignmentItemId,
) => {
  const resp = await makeGETRequest({ url: `${DUTY}/app/duty-assignment-items/${assignmentItemId}/records` }).send();
  return resp.json();
};

export const createDutyManualRecord: SafetyPersonnelGateway["createDutyManualRecord"] = async (payload) => {
  const resp = await makeCreateRequest({ url: `${DUTY}/duty-records`, payload: { ...payload } }).send();
  return resp.json();
};

export const getDutyRecord: SafetyPersonnelGateway["getDutyRecord"] = async (id) => {
  const resp = await makeGETRequest({ url: `${DUTY}/duty-records/${id}` }).send();
  return resp.json();
};

export const getCurrentDutyRecord: SafetyPersonnelGateway["getCurrentDutyRecord"] = async (id) => {
  const resp = await makeGETRequest({ url: `${DUTY}/app/duty-records/${id}` }).send();
  return resp.json();
};

export const listDutyReportTypes: SafetyPersonnelGateway["listDutyReportTypes"] = async (params) => {
  const resp = await makeGETRequest({ url: `${DUTY}/duty-report-types`, payload: params ? { ...params } : undefined }).send();
  return resp.json();
};

export const getDutyReportGenerateConfirmation: SafetyPersonnelGateway["getDutyReportGenerateConfirmation"] = async (params) => {
  const resp = await makeGETRequest({ url: `${DUTY}/duty-reports/generate-confirmation`, payload: { ...params } }).send();
  return resp.json();
};

export const pageDutyReportResponsibleUserCandidates: SafetyPersonnelGateway["pageDutyReportResponsibleUserCandidates"] = async (
  params,
) => {
  const resp = await makeListRequest({ url: `${DUTY}/duty-reports/responsible-user-candidates`, payload: { ...params } }).send();
  return resp.json();
};

export const createDutyReport: SafetyPersonnelGateway["createDutyReport"] = async (payload) => {
  const resp = await makeCreateRequest({ url: `${DUTY}/duty-reports`, payload: { ...payload } }).send();
  return resp.json();
};

export const pageDutyReports: SafetyPersonnelGateway["pageDutyReports"] = async (params) => {
  const resp = await makeListRequest({ url: `${DUTY}/duty-reports`, payload: { ...params } }).send();
  return resp.json();
};

export const getDutyReport: SafetyPersonnelGateway["getDutyReport"] = async (id) => {
  const resp = await makeGETRequest({ url: `${DUTY}/duty-reports/${id}` }).send();
  return resp.json();
};

export const confirmDutyReportSignature: SafetyPersonnelGateway["confirmDutyReportSignature"] = async (id, payload) => {
  const resp = await makeCreateRequest({ url: `${DUTY}/duty-reports/${id}/signature-confirmations`, payload: { ...payload } }).send();
  return resp.json();
};

export const listDutyReportMappings: SafetyPersonnelGateway["listDutyReportMappings"] = async (id, params) => {
  const resp = await makeGETRequest({ url: `${DUTY}/duty-reports/${id}/mappings`, payload: params ? { ...params } : undefined }).send();
  return resp.json();
};

export const getDutyReportMapping: SafetyPersonnelGateway["getDutyReportMapping"] = async (id, mappingId) => {
  const resp = await makeGETRequest({ url: `${DUTY}/duty-reports/${id}/mappings/${mappingId}` }).send();
  return resp.json();
};

export const listDutyReportMappingEvidences: SafetyPersonnelGateway["listDutyReportMappingEvidences"] = async (id, mappingId, params) => {
  const resp = await makeGETRequest({
    url: `${DUTY}/duty-reports/${id}/mappings/${mappingId}/evidences`,
    payload: params ? { ...params } : undefined,
  }).send();
  return resp.json();
};

export const getDutyReportGapDetail: SafetyPersonnelGateway["getDutyReportGapDetail"] = async (id, mappingId) => {
  const resp = await makeGETRequest({ url: `${DUTY}/duty-reports/${id}/mappings/${mappingId}/gap-detail` }).send();
  return resp.json();
};

export const listDutyReportEvidences: SafetyPersonnelGateway["listDutyReportEvidences"] = async (id, params) => {
  const resp = await makeGETRequest({ url: `${DUTY}/duty-reports/${id}/evidences`, payload: params ? { ...params } : undefined }).send();
  return resp.json();
};

export const pageCurrentDutyReports: SafetyPersonnelGateway["pageCurrentDutyReports"] = async (params) => {
  const resp = await makeListRequest({ url: `${DUTY}/app/duty-reports`, payload: { ...params } }).send();
  return resp.json();
};

export const getCurrentDutyReport: SafetyPersonnelGateway["getCurrentDutyReport"] = async (id) => {
  const resp = await makeGETRequest({ url: `${DUTY}/app/duty-reports/${id}` }).send();
  return resp.json();
};

export const listCurrentDutyReportMappings: SafetyPersonnelGateway["listCurrentDutyReportMappings"] = async (id, params) => {
  const url = `${DUTY}/app/duty-reports/${id}/mappings`;
  const resp = await makeGETRequest(params ? { url, payload: { ...params } } : { url }).send();
  return resp.json();
};

export const getCurrentDutyReportMapping: SafetyPersonnelGateway["getCurrentDutyReportMapping"] = async (id, mappingId) => {
  const resp = await makeGETRequest({ url: `${DUTY}/app/duty-reports/${id}/mappings/${mappingId}` }).send();
  return resp.json();
};

export const listCurrentDutyReportMappingEvidences: SafetyPersonnelGateway["listCurrentDutyReportMappingEvidences"] = async (
  id,
  mappingId,
  params,
) => {
  const url = `${DUTY}/app/duty-reports/${id}/mappings/${mappingId}/evidences`;
  const resp = await makeGETRequest(params ? { url, payload: { ...params } } : { url }).send();
  return resp.json();
};

export const getCurrentDutyReportGapDetail: SafetyPersonnelGateway["getCurrentDutyReportGapDetail"] = async (id, mappingId) => {
  const resp = await makeGETRequest({ url: `${DUTY}/app/duty-reports/${id}/mappings/${mappingId}/gap-detail` }).send();
  return resp.json();
};

export const listCurrentDutyReportEvidences: SafetyPersonnelGateway["listCurrentDutyReportEvidences"] = async (id, params) => {
  const url = `${DUTY}/app/duty-reports/${id}/evidences`;
  const resp = await makeGETRequest(params ? { url, payload: { ...params } } : { url }).send();
  return resp.json();
};

export const getDutyScoreModel: SafetyPersonnelGateway["getDutyScoreModel"] = async (params) => {
  const resp = await makeGETRequest({ url: `${DUTY}/duty-score-models/current`, payload: params ? { ...params } : undefined }).send();
  return resp.json();
};

export const saveDutyScoreModel: SafetyPersonnelGateway["saveDutyScoreModel"] = async (payload) => {
  const resp = await makeUpdateRequest({ url: `${DUTY}/duty-score-models/current`, payload: { ...payload } }).send();
  return resp.json();
};

export const getDutyScoreDashboardSummary: SafetyPersonnelGateway["getDutyScoreDashboardSummary"] = async (params) => {
  const resp = await makeGETRequest({ url: `${DUTY}/duty-score-dashboard/summary`, payload: params ? { ...params } : undefined }).send();
  return resp.json();
};

export const listDutyScoreDepartmentSummaries: SafetyPersonnelGateway["listDutyScoreDepartmentSummaries"] = async (params) => {
  const resp = await makeGETRequest({ url: `${DUTY}/duty-score-department-summaries`, payload: params ? { ...params } : undefined }).send();
  return resp.json();
};

export const pageDutyScoreRankings: SafetyPersonnelGateway["pageDutyScoreRankings"] = async (params) => {
  const resp = await makeListRequest({ url: `${DUTY}/duty-score-rankings`, payload: { ...params } }).send();
  return resp.json();
};

export const exportDutyScoreRankings: SafetyPersonnelGateway["exportDutyScoreRankings"] = async (payload) => {
  const resp = await makeCreateRequest({ url: `${DUTY}/duty-score-ranking-exports`, payload: { ...payload } }).send();
  return resp.blob();
};

export const getDutyPersonalScoreReport: SafetyPersonnelGateway["getDutyPersonalScoreReport"] = async (userId, params) => {
  const resp = await makeGETRequest({ url: `${DUTY}/duty-score-reports/${userId}`, payload: params ? { ...params } : undefined }).send();
  return resp.json();
};

export const getDutyAppPersonalScoreReport: SafetyPersonnelGateway["getDutyAppPersonalScoreReport"] = async (params) => {
  const resp = await makeGETRequest({ url: `${DUTY}/app/duty-score-reports/current`, payload: params ? { ...params } : undefined }).send();
  return resp.json();
};

export const getDutyScorePublicity: SafetyPersonnelGateway["getDutyScorePublicity"] = async (params) => {
  const resp = await makeGETRequest({ url: `${DUTY}/duty-score-publicities`, payload: params ? { ...params } : undefined }).send();
  return resp.json();
};

export const pageDutyScorePublicityRankings: SafetyPersonnelGateway["pageDutyScorePublicityRankings"] = async (params) => {
  const resp = await makeListRequest({ url: `${DUTY}/duty-score-publicity-rankings`, payload: { ...params } }).send();
  return resp.json();
};

export const getDutyAppScorePublicity: SafetyPersonnelGateway["getDutyAppScorePublicity"] = async (params) => {
  const resp = await makeGETRequest({ url: `${DUTY}/app/duty-score-publicities`, payload: params ? { ...params } : undefined }).send();
  return resp.json();
};

export const listDutyScoreNotifyTargets: SafetyPersonnelGateway["listDutyScoreNotifyTargets"] = async (params) => {
  const resp = await makeGETRequest({ url: `${DUTY}/duty-score-notify-targets`, payload: params ? { ...params } : undefined }).send();
  return resp.json();
};

export const saveDutyScoreNotifyTargets: SafetyPersonnelGateway["saveDutyScoreNotifyTargets"] = async (payload) => {
  const resp = await makeUpdateRequest({ url: `${DUTY}/duty-score-notify-targets`, payload: { ...payload } }).send();
  return resp.json();
};

export const pageDutyScoreNotifyTargetCandidates: SafetyPersonnelGateway["pageDutyScoreNotifyTargetCandidates"] = async (params) => {
  const resp = await makeListRequest({ url: `${DUTY}/duty-score-notify-target-candidates`, payload: { ...params } }).send();
  return resp.json();
};

export const getDutyAppScoreDashboard: SafetyPersonnelGateway["getDutyAppScoreDashboard"] = async (params) => {
  const resp = await makeGETRequest({ url: `${DUTY}/app/duty-score-dashboard`, payload: params ? { ...params } : undefined }).send();
  return resp.json();
};
