import request from "@/utils/request";
let baseURL = "/api/emergency";
const aiCenterFlowStudioBaseURL = "/api/ai-center/flow/console/studio";
const dictionaryBaseURL = "/api/dictionary";
const planWorkflowTimeout = 300000;

export const geteventtypes = (params) =>
  request({
    url: baseURL + "/emergency-event-types",
    method: "get",
    params,
  });

// 预案文件-事件分页列表
export const eventtypepage = (params) =>
  request({
    url: baseURL + "/emergency-event-type/page",
    method: "get",
    params,
  });
export const planDocumentList = (params) =>
  request({
    url: baseURL + "/emergency-files",
    method: "get",
    params,
  });
// 预案文件新增
export const addPlanDocument = (data) =>
  request({
    url: baseURL + "/emergency-file",
    method: "post",
    data,
  });
// 预案文件修改
export const editPlanDocument = (data) =>
  request({
    url: baseURL + "/emergency-file",
    method: "post",
    data: { ...data, id: data.file?.id || data.id },
  });
export const savePlanDocumentDraft = (data) =>
  request({
    url: baseURL + "/emergency-file/draft",
    method: "post",
    data,
  });
// 预案文件详情
export const planDocumentDetail = (params) =>
  request({
    url: baseURL + `/emergency-file/${params?.id || params}`,
    method: "get",
  });
// 预案文件结构化任务
//预案文件删除
export const deleteDocumentDetail = (params) =>
  request({
    url: baseURL + `/emergency-file/${params?.id || params}`,
    method: "delete",
    params,
  });
export const abolishPlanDocument = (id) =>
  request({
    url: baseURL + `/emergency-file/${id}/abolish`,
    method: "post",
  });
export const deletetype = (params) =>
  request({
    url: baseURL + `/emergency-event-type/${params?.id || params}`,
    method: "delete",
    params,
  });

// 预案规则分页列表
export const planRulesList = (params) =>
  request({
    url: baseURL + "/emergency-rule/list-page",
    method: "get",
    params,
  });
//预案规则详情
export const planRulesDetail = (params) =>
  request({
    url: baseURL + `/emergency-rule/${params?.emergencyRuleId || params}`,
    method: "get",
  });
//预案规则新增
export const addPlanRules = (data) =>
  request({
    url: baseURL + `/emergency-rule`,
    method: "post",
    data,
  });
export const addeventtype = (data) =>
  request({
    url: baseURL + `/emergency-event-type`,
    method: "post",
    data,
  });
// 预案规则修改
export const editPlanRules = (data) =>
  request({
    url: baseURL + `/emergency-rule`,
    method: "put",
    data,
  });
export const editeventtype = (data) =>
  request({
    url: baseURL + `/emergency-event-type/${data.id}`,
    method: "put",
    data,
  });
// 预案规则修改启用状态
export const enabledPlanRules = (data) =>
  request({
    url: baseURL + `/emergency-rule/enabled`,
    method: "put",
    data,
  });
// 预案规则删除
export const deletePlanRules = (params) =>
  request({
    url: baseURL + `/emergency-rule/delete/${params?.id || params}`,
    method: "delete",
  });
//预案规则批量删除
export const batchDeletePlanRules = (params) =>
  request({
    url: baseURL + `/emergency-rule/delete/batch/${params?.ids || params}`,
    method: "delete",
    params,
  });
// 预案类型列表
export const reservePlanTypes = (params) =>
  request({
    url: baseURL + `/emergency-types`,
    method: "get",
    params,
  });
// 预案设备实列列表
export const getIoemergencyDeviceList = (params) =>
  request({
    url: baseURL + "/emergency-type-devices?applicationCode=SECURITY_MONITORING",
    method: "get",
    params,
  });

// 预案文件-文件类型分页列表
export const fileTypePage = (params) =>
  request({
    url: baseURL + "/emergency-file-type-page",
    method: "get",
    params,
  });
export const fileTypeList = (params) =>
  request({
    url: baseURL + "/emergency-file-types",
    method: "get",
    params,
  });
export const editFileType = (data) =>
  request({
    url: baseURL + `/emergency-file-type/${data.id}`,
    method: "put",
    data,
  });
export const addFileType = (data) =>
  request({
    url: baseURL + `/emergency-file-type`,
    method: "post",
    data,
  });
export const deleteFileType = (params) =>
  request({
    url: baseURL + `/emergency-file-type/${params?.id || params}`,
    method: "delete",
    params,
  });
export const emergencyFileNotice = (params) =>
  request({
    url: baseURL + `/emergency-file-notice`,
    method: "get",
    params,
  });
export const saveEmergencyFileNotice = (data) =>
  request({
    url: baseURL + `/emergency-file-notice`,
    method: "post",
    data,
  });

// 预案工作流执行
export const runPlanWorkflow = (flowId, data) =>
  request({
    url: `${aiCenterFlowStudioBaseURL}/${flowId}/run`,
    method: "post",
    data,
    timeout: planWorkflowTimeout,
  });

export const getPlanGenerateFlowDictionary = (params) =>
  request({
    url: `${dictionaryBaseURL}/getDataDictionaryByItemAndCode`,
    method: "get",
    params,
  });

// 结构化拆解任务模板分页列表
export const taskTemplatePage = (params) =>
  request({
    url: baseURL + "/emergency-task-templates/page",
    method: "get",
    params,
  });

// 结构化拆解任务模板详情
export const taskTemplateDetail = (id) =>
  request({
    url: baseURL + `/emergency-task-templates/${id}`,
    method: "get",
  });

// 新增结构化拆解任务模板
export const addTaskTemplate = (data) =>
  request({
    url: baseURL + "/emergency-task-templates",
    method: "post",
    data,
  });

// 修改结构化拆解任务模板
export const editTaskTemplate = (id, data) =>
  request({
    url: baseURL + `/emergency-task-templates/${id}`,
    method: "put",
    data,
  });

// 删除结构化拆解任务模板
export const deleteTaskTemplate = (id) =>
  request({
    url: baseURL + `/emergency-task-templates/${id}`,
    method: "delete",
  });

// 预案审批
export const approvalPage = (params) => request({ url: baseURL + "/emergency-file-approvals", method: "get", params });
export const approvalDetail = (id) => request({ url: baseURL + `/emergency-file-approval/${id}`, method: "get" });
export const approvePlan = (id, data) => request({ url: baseURL + `/emergency-file-approval/${id}/approve`, method: "post", data });
export const rejectPlan = (id, data) => request({ url: baseURL + `/emergency-file-approval/${id}/reject`, method: "post", data });
export const approvalRules = () => request({ url: baseURL + "/emergency-file-approval/rules", method: "get" });
export const approvalRuleDetail = (id) => request({ url: baseURL + `/emergency-file-approval/rule/${id}`, method: "get" });
export const saveApprovalRule = (data) => request({ url: baseURL + "/emergency-file-approval/rule", method: "post", data });
export const reorderApprovalRules = (data) => request({ url: baseURL + "/emergency-file-approval/rules/order", method: "put", data });
export const deleteApprovalRule = (id) => request({ url: baseURL + `/emergency-file-approval/rule/${id}`, method: "delete" });

// 预案事件
export const emergencyEventPage = (params) => request({ url: baseURL + "/emergency-events", method: "get", params });
export const createEmergencyEvent = (data) => request({ url: baseURL + "/emergency-event", method: "post", data });
export const emergencyEventDetail = (id) => request({ url: baseURL + `/emergency-event/${id}`, method: "get" });
export const terminateEmergencyEvent = (id, data) => request({ url: baseURL + `/emergency-event/${id}/terminate`, method: "post", data });
export const emergencyEventTasks = (id) => request({ url: baseURL + `/emergency-event/${id}/tasks`, method: "get" });
export const emergencyEventLogs = (id) => request({ url: baseURL + `/emergency-event/${id}/operation-logs`, method: "get" });
export const eventTaskPage = (params) => request({ url: baseURL + "/emergency-event-task/page", method: "get", params });
export const completeEventTask = (id) => request({ url: baseURL + `/emergency-event-task/${id}/complete`, method: "post" });
export const submitTaskFeedback = (taskId, data) =>
  request({ url: baseURL + `/emergency-event-task/${taskId}/feedback`, method: "post", data });
export const eventTaskFeedbacks = (taskId) => request({ url: baseURL + `/emergency-event-task/${taskId}/feedbacks`, method: "get" });

// 事件复盘
export const eventReviewPage = (params) => request({ url: baseURL + "/emergency-event-reviews", method: "get", params });
export const eventReviewDetail = (id) => request({ url: baseURL + `/emergency-event/${id}/review`, method: "get" });
export const generateEventReviewAiSuggestions = (id) =>
  request({ url: baseURL + `/emergency-event/${id}/review/ai-suggestions`, method: "post" });
export const saveEventReview = (id, data) => request({ url: baseURL + `/emergency-event/${id}/review`, method: "post", data });
export const createEventRectification = (id, data) =>
  request({ url: baseURL + `/emergency-event/${id}/rectification`, method: "post", data });

// 预案修订待办
export const emergencyFileRevisionTodo = () => request({ url: baseURL + "/emergency-file-revisions/todo", method: "get" });
export const startEmergencyFileRevision = (id, lockToken) =>
  request({
    url: baseURL + `/emergency-file-revision/${id}/start`,
    method: "post",
    params: lockToken ? { lockToken } : undefined,
  });
