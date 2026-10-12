import type {
  AppraisalPeriodType,
  AssessmentRuleItemVO,
  CheckSourceKind,
  FormAppraisalContentSourceType,
  FormAppraisalContentType,
  FormAppraisalRuleContentApiVO,
  FormAppraisalRuleContentCommand,
  FormAppraisalRuleDetailVO,
  FormAppraisalRuleItemApiVO,
  FormAppraisalRuleItemCommand,
  FormAppraisalRuleSaveCommand,
  ScoreRangeVO,
  SpotCheckItemVO,
} from "@ghcloud/cube-form-audit-service";

import { CHECK_SOURCE_KIND, FORM_METHOD_CODE, MAINTENANCE_METHOD_CODE } from "./assessment-rule-enums";
import { defaultRuleItemName, normalizeSpotCheckItem } from "./assessment-rule-model";

function toSourceTypeApi(kind: CheckSourceKind): FormAppraisalContentSourceType {
  if (kind === CHECK_SOURCE_KIND.INSPECTION) {
    return "INSPECT";
  }
  if (kind === CHECK_SOURCE_KIND.MAINTENANCE) {
    return "MAINTAIN";
  }
  return "FORM";
}

export function fromSourceTypeApi(t: FormAppraisalContentSourceType | undefined): CheckSourceKind {
  if (t === "INSPECT") {
    return CHECK_SOURCE_KIND.INSPECTION;
  }
  if (t === "MAINTAIN") {
    return CHECK_SOURCE_KIND.MAINTENANCE;
  }
  return CHECK_SOURCE_KIND.FORM;
}

/** UI methodCode → 接口 calcType */
function methodCodeToCalcType(methodCode: string, kind: CheckSourceKind): string {
  if (kind === CHECK_SOURCE_KIND.FORM) {
    const m: Record<string, string> = {
      [FORM_METHOD_CODE.RECORD_COUNT]: "FORM_COUNT",
      [FORM_METHOD_CODE.FILLED_DATA]: "FIELD_VALUE",
      [FORM_METHOD_CODE.ACCUMULATE]: "FIELD_SUM",
      [FORM_METHOD_CODE.AVERAGE]: "FIELD_AVG",
    };
    return m[methodCode] ?? methodCode;
  }
  if (kind === CHECK_SOURCE_KIND.MAINTENANCE) {
    return methodCode === MAINTENANCE_METHOD_CODE.TIMEOUT ? "TIMEOUT_TASK_COUNT" : methodCode;
  }
  return methodCode;
}

/** 接口 calcType → UI methodCode */
export function calcTypeToMethodCode(calcType: string | undefined, kind: CheckSourceKind): string {
  if (!calcType) {
    return "";
  }
  if (kind === CHECK_SOURCE_KIND.FORM) {
    const m: Record<string, string> = {
      FORM_COUNT: FORM_METHOD_CODE.RECORD_COUNT,
      FIELD_VALUE: FORM_METHOD_CODE.FILLED_DATA,
      FIELD_SUM: FORM_METHOD_CODE.ACCUMULATE,
      FIELD_AVG: FORM_METHOD_CODE.AVERAGE,
    };
    return m[calcType] ?? calcType;
  }
  if (kind === CHECK_SOURCE_KIND.MAINTENANCE) {
    return calcType === "TIMEOUT_TASK_COUNT" ? MAINTENANCE_METHOD_CODE.TIMEOUT : calcType;
  }
  return calcType;
}

function ruleItemToCommand(rule: AssessmentRuleItemVO, kind: CheckSourceKind, ruleIdx: number): FormAppraisalRuleItemCommand {
  const rangeConfig = (rule.ranges ?? []).map((r) => ({
    startValue: Number(r.start ?? 0),
    endValue: Number(r.end ?? 0),
    deductScore: Number(r.score ?? 0),
  }));
  const idRaw = rule.id;
  const idStr = idRaw !== undefined && idRaw !== null && String(idRaw).trim() !== "" ? String(idRaw) : undefined;
  return {
    ...(idStr !== undefined ? { id: idStr } : {}),
    itemName: rule.itemName?.trim() || defaultRuleItemName(ruleIdx),
    fieldKey: rule.formFieldId ?? "",
    calcType: methodCodeToCalcType(rule.methodCode, kind),
    sort: ruleIdx,
    rangeConfig,
  };
}

function spotItemToContentCommand(
  it: SpotCheckItemVO,
  contentType: FormAppraisalContentType,
  sort: number,
): FormAppraisalRuleContentCommand {
  const kind = it.checkSourceKind ?? CHECK_SOURCE_KIND.FORM;
  const idRaw = it.id;
  const idStr = idRaw !== undefined && idRaw !== null && String(idRaw).trim() !== "" ? String(idRaw) : undefined;
  const std = it.standardDescription;
  return {
    ...(idStr !== undefined ? { id: idStr } : {}),
    contentType,
    sourceType: toSourceTypeApi(kind),
    sourceRefId: it.sourceKey,
    sourceRefCode: it.sourceRefCode,
    contentDesc: it.content,
    ...(std !== undefined && std !== null && String(std).trim() !== "" ? { standardDesc: std } : {}),
    sort,
    items: (it.ruleItems ?? []).map((r, j) => ruleItemToCommand(r, kind, j)),
  };
}

function buildContentsFromLists(spotCheckList: SpotCheckItemVO[], inspectionList: SpotCheckItemVO[]): FormAppraisalRuleContentCommand[] {
  const out: FormAppraisalRuleContentCommand[] = [];
  let sort = 0;
  for (const it of spotCheckList) {
    out.push(spotItemToContentCommand(it, "SPOT_CHECK", sort));
    sort += 1;
  }
  for (const it of inspectionList) {
    out.push(spotItemToContentCommand(it, "INSPECTION", sort));
    sort += 1;
  }
  return out;
}

function normalizeRangeFromApi(raw: ScoreRangeVO | undefined): ScoreRangeVO {
  return {
    start: raw?.start ?? null,
    end: raw?.end ?? null,
    score: raw?.score ?? null,
  };
}

function itemApiToRuleItem(it: FormAppraisalRuleItemApiVO | undefined, kind: CheckSourceKind, _idx: number): AssessmentRuleItemVO {
  const ranges: ScoreRangeVO[] =
    it?.rangeConfig?.map((r) =>
      normalizeRangeFromApi({
        start: r.startValue ?? null,
        end: r.endValue ?? null,
        score: r.deductScore ?? null,
      }),
    ) ?? [];
  const idRaw = it?.id;
  const hasId = idRaw !== undefined && idRaw !== null;
  const fieldKey = it?.fieldKey;
  return {
    ...(hasId ? { id: idRaw } : {}),
    ...(it?.itemName !== undefined && it?.itemName !== null ? { itemName: String(it.itemName) } : {}),
    ...(fieldKey !== undefined && fieldKey !== null ? { formFieldId: fieldKey } : {}),
    methodCode: calcTypeToMethodCode(it?.calcType, kind),
    ranges: ranges.length > 0 ? ranges : [{ start: null, end: null, score: null }],
  };
}

function contentApiToSpotItem(c: FormAppraisalRuleContentApiVO, defaultBlock: "SPOT_CHECK" | "INSPECTION"): SpotCheckItemVO {
  const kind = fromSourceTypeApi(c.sourceType);
  const contentType: FormAppraisalContentType = c.contentType ?? defaultBlock;
  const base: Partial<SpotCheckItemVO> = {
    ...(c.id !== undefined && c.id !== null ? { id: String(c.id) } : {}),
    sourceKey: c.sourceRefId ?? "",
    sourceRefCode: c.sourceRefCode ?? "",
    sourceRefName: c.sourceRefName ?? "",
    sourceType: contentType === "INSPECTION" ? "INSPECTION" : "SPOT_CHECK",
    checkSourceKind: kind,
    content: c.contentDesc ?? "",
    standardDescription: c.standardDesc ?? "",
    itemDescription: "",
    standardCodes: "",
    ruleItems: (c.items ?? []).map((it, idx) => itemApiToRuleItem(it, kind, idx)),
  };
  return normalizeSpotCheckItem(base, defaultBlock);
}

export function splitContentsToFormLists(contents: FormAppraisalRuleContentApiVO[] | undefined): {
  spotCheckList: SpotCheckItemVO[];
  inspectionList: SpotCheckItemVO[];
} {
  const sorted = [...(contents ?? [])].sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0));
  const spot: SpotCheckItemVO[] = [];
  const inspection: SpotCheckItemVO[] = [];
  for (const c of sorted) {
    if (c.contentType === "INSPECTION") {
      inspection.push(contentApiToSpotItem(c, "INSPECTION"));
    } else {
      spot.push(contentApiToSpotItem(c, "SPOT_CHECK"));
    }
  }
  return {
    spotCheckList: spot,
    inspectionList: inspection,
  };
}

export type AssessmentRuleFormStateForSave = {
  name: string;
  itemContent: string;
  formGroupId: string | undefined;
  periodType: AppraisalPeriodType | undefined;
  organizationIds: string[];
  totalScore: number;
  spotCheckTotalScore: number;
  inspectionTotalScore: number;
  enable: boolean;
  spotCheckList: SpotCheckItemVO[];
  inspectionList: SpotCheckItemVO[];
};

export function buildFormAppraisalRuleSaveCommand(
  state: AssessmentRuleFormStateForSave,
  options: { mode: "add" | "edit"; ruleId?: string },
): FormAppraisalRuleSaveCommand {
  const deptIds = state.organizationIds ?? [];
  const nonEmpty = deptIds.map((id) => String(id).trim()).filter((id) => id !== "");
  if (nonEmpty.length === 0) {
    throw new Error("请选择责任部门");
  }
  const period = state.periodType;
  if (period === undefined || period === null) {
    throw new Error("请选择考核周期");
  }
  const rid = options.ruleId;
  const idStr = options.mode === "edit" && rid !== undefined && rid !== null && String(rid).trim() !== "" ? String(rid) : undefined;
  return {
    ...(idStr !== undefined ? { id: idStr } : {}),
    name: state.name,
    inspectionItem: state.itemContent,
    formGroupId: state.formGroupId || undefined,
    periodType: period,
    totalScore: Number(state.totalScore ?? 0),
    spotCheckScore: Number(state.spotCheckTotalScore ?? 0),
    inspectionScore: Number(state.inspectionTotalScore ?? 0),
    responsibleDepartmentIds: nonEmpty,
    enabled: state.enable,
    contents: buildContentsFromLists(state.spotCheckList, state.inspectionList),
  };
}

export function applyFormAppraisalRuleDetailToFormState(state: AssessmentRuleFormStateForSave, detail: FormAppraisalRuleDetailVO): void {
  state.name = detail.name ?? "";
  state.itemContent = detail.inspectionItem ?? "";
  state.formGroupId = detail.formGroupId ?? undefined;
  state.periodType = detail.periodType;
  state.totalScore = Number(detail.totalScore ?? 0);
  state.spotCheckTotalScore = Number(detail.spotCheckScore ?? 0);
  state.inspectionTotalScore = Number(detail.inspectionScore ?? 0);
  const multi = detail.responsibleDepartmentIds;
  if (Array.isArray(multi) && multi.length > 0) {
    state.organizationIds = multi.map((id) => String(id).trim()).filter((id) => id !== "");
  } else {
    const rid = detail.responsibleDepartmentId;
    state.organizationIds = rid !== undefined && rid !== null && String(rid).trim() !== "" ? [String(rid).trim()] : [];
  }
  state.enable = detail.enabled ?? true;
  const { spotCheckList, inspectionList } = splitContentsToFormLists(detail.contents);
  state.spotCheckList = spotCheckList;
  state.inspectionList = inspectionList;
}
