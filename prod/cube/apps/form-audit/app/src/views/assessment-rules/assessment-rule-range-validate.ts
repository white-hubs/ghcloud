import type { ScoreRangeVO } from '@ghcloud/cube-form-audit-service'

const INDEX_OFFSET = 1
const MIN_SEGMENTS_FOR_OVERLAP_CHECK = 2

/**
 * 校验同一计分规则下的区间：
 * - 每一行：结束必须大于或等于起始
 * - 多行：按起始排序后，任意相邻两段不得交叉（后段起始小于前段结束视为交叉；相接如 1-5 与 5-10 允许）
 */
export function validateRangeSequence(ranges: ScoreRangeVO[]): string | null {
  for (let k = 0; k < ranges.length; k++) {
    const { start, end } = ranges[k]
    if (start === null || end === null) {
      continue
    }
    if (end < start) {
      return `区间 ${k + INDEX_OFFSET}：结束必须大于或等于起始`
    }
  }

  const filled = ranges
    .map((r) => ({ start: r.start, end: r.end }))
    .filter((x): x is { start: number; end: number } => x.start !== null && x.end !== null)

  if (filled.length < MIN_SEGMENTS_FOR_OVERLAP_CHECK) {
    return null
  }

  const sorted = [...filled].sort((a, b) => a.start - b.start)
  for (let k = 0; k < sorted.length - INDEX_OFFSET; k++) {
    const cur = sorted[k]
    const next = sorted[k + INDEX_OFFSET]
    if (next.start < cur.end) {
      return '各区间不能交叉，后一段起始须不小于前一段结束（允许相接）'
    }
  }
  return null
}
