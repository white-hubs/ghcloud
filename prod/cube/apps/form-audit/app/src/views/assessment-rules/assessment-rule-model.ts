import type {
  AssessmentRuleItemVO,
  CheckSourceKind,
  ScoreRangeVO,
  SpotCheckItemVO,
} from '@ghcloud/cube-form-audit-service'
export function createDefaultRange(): ScoreRangeVO {
  return { start: null, end: null, score: null }
}

/** 新建/未命名时的默认计分规则标题：计分规则1、计分规则2… */
export function defaultRuleItemName(ruleIndex: number): string {
  return `计分规则${ruleIndex + 1}`
}

export function createDefaultRuleItem(ruleIndex: number): AssessmentRuleItemVO {
  return {
    itemName: defaultRuleItemName(ruleIndex),
    methodCode: '',
    ranges: [createDefaultRange()],
  }
}

function normalizeRuleItem(raw: Partial<AssessmentRuleItemVO> | undefined, ruleIndex: number): AssessmentRuleItemVO {
  const { id: rawId, ranges: rawRanges, ...rest } = raw ?? {}
  const idStr =
    rawId !== undefined && rawId !== null && String(rawId).trim() !== '' ? String(rawId) : undefined
  const r: AssessmentRuleItemVO = {
    ...createDefaultRuleItem(ruleIndex),
    ...rest,
    ...(idStr !== undefined ? { id: idStr } : {}),
    ranges: rawRanges?.length ? rawRanges.map((x) => normalizeRange(x)) : [createDefaultRange()],
  }
  return r
}

function normalizeRange(raw: Partial<ScoreRangeVO> | undefined): ScoreRangeVO {
  return {
    start: raw?.start ?? null,
    end: raw?.end ?? null,
    score: raw?.score ?? null,
  }
}

export function normalizeRuleItems(list: AssessmentRuleItemVO[] | undefined): AssessmentRuleItemVO[] {
  if (!list?.length) {
    return [createDefaultRuleItem(0)]
  }
  return list.map((x, idx) => normalizeRuleItem(x, idx))
}

export function normalizeSpotCheckItem(
  raw: Partial<SpotCheckItemVO>,
  defaultSourceType: 'SPOT_CHECK' | 'INSPECTION',
): SpotCheckItemVO {
  const rawId = raw.id
  const idStr =
    rawId !== undefined && rawId !== null && String(rawId).trim() !== '' ? String(rawId) : undefined
  return {
    sourceKey: raw.sourceKey ?? '',
    sourceRefCode: raw.sourceRefCode ?? '',
    sourceRefName: raw.sourceRefName ?? '',
    sourceType: raw.sourceType ?? defaultSourceType,
    /** 未显式传入时不默认「表单」，由用户选择来源（新增页不预选） */
    ...(raw.checkSourceKind !== undefined ? { checkSourceKind: raw.checkSourceKind as CheckSourceKind } : {}),
    content: raw.content ?? '',
    standardDescription: raw.standardDescription ?? '',
    itemDescription: raw.itemDescription ?? '',
    standardCodes: raw.standardCodes ?? '',
    ...(idStr !== undefined ? { id: idStr } : {}),
    ruleItems: normalizeRuleItems(raw.ruleItems),
  }
}
