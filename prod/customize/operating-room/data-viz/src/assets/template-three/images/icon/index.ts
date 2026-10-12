interface IconItem {
  name: string; // 中文名称
  icon: string; // 图标代码
  code: string; // 英文名称
}

const iconList: IconItem[] = [
  { name: '工作台面风速', code: 'workbenchWindSpeed', icon: 'workbench-wind-speed' },
  { name: '实时温度', code: 'temperature', icon: 'temperature' },
  { name: '室内压力', code: 'pressure', icon: 'pressure' },
  { name: '氧浓度', code: 'oxygenConcentration', icon: 'oxygen-concentration' },
  { name: '有机挥发物', code: 'organicVolatile', icon: 'organic-volatile' },
  { name: '噪声', code: 'noise', icon: 'noise' },
  { name: '中效过滤', code: 'mediumFiltration', icon: 'medium-filtration' },
  { name: '照度', code: 'illuminance', icon: 'illuminance' },
  { name: '相对湿度', code: 'humidity', icon: 'humidity' },
  { name: '高效过滤', code: 'highFiltration', icon: 'high-filtration' },
  { name: '新风风速', code: 'freshAirSpeed', icon: 'fresh-air-speed' },
  { name: '自净时间', code: 'cleanTime', icon: 'clean-time' },
  { name: '二氧化碳浓度', code: 'carbonDioxid', icon: 'carbon-dioxid' },
  { name: '空调开关', code: 'airconditioner', icon: 'airconditioner' },
  { name: '新风量', code: 'airVolume', icon: 'air-volume' },
  { name: '送风风量', code: 'airSpeed', icon: 'air-speed' },
  { name: '换气次数', code: 'airChanges', icon: 'air-changes' },
]

/**
 * 计算字符串相似度（支持中文模糊匹配）
 */
function getSimilarity (str1: string, str2: string): number {
  // 如果其中一个字符串为空，直接返回 0
  if (!str1 || !str2) return 0

  // 判断是否包含中文字符
  const isChinese = (str: string): boolean => /[\u4e00-\u9fa5]/.test(str)

  // 如果是中文，使用部分匹配逻辑
  if (isChinese(str1) || isChinese(str2)) {
    // 计算较短的字符串是否被较长的字符串包含
    const longer = str1.length > str2.length ? str1 : str2
    const shorter = str1.length > str2.length ? str2 : str1

    // 如果较短的字符串被较长的字符串包含，返回较高的相似度
    if (longer.includes(shorter)) {
      return shorter.length / longer.length
    }

    // 否则，计算字符重叠比例
    const overlap = [...shorter].filter((char) => longer.includes(char)).length
    return overlap / longer.length
  }

  // 如果是英文，使用编辑距离计算相似度
  const len1 = str1.length
  const len2 = str2.length
  const matrix: number[][] = []

  for (let i = 0; i <= len1; i++) {
    matrix[i] = [i]
  }
  for (let j = 0; j <= len2; j++) {
    matrix[0][j] = j
  }

  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1, // 删除
        matrix[i][j - 1] + 1, // 插入
        matrix[i - 1][j - 1] + cost // 替换
      )
    }
  }

  const maxLen = Math.max(len1, len2)
  return 1 - matrix[len1][len2] / maxLen
}

/**
 * 将驼峰命名法转换为小写连字符形式
 */
function camelToKebab (str: string): string {
  return str.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()
}

/**
 * 查找最佳匹配的 IconItem
 */
export function findBestMatch (name: string, code: string): IconItem | null {
  let bestMatch: IconItem | null = null
  let bestScore: number = -1

  const normalizedCode = camelToKebab(code).replace(/[-\s]/g, '')

  iconList.forEach((item) => {
    // 计算 name 的相似度
    const nameScore = getSimilarity(name, item.name)

    // 计算 code 的相似度（优先使用 code，如果没有则使用 icon）
    const codeTarget = item.code || item.icon
    const normalizedTarget = camelToKebab(codeTarget).replace(/[-\s]/g, '')
    const codeScore = getSimilarity(normalizedCode, normalizedTarget)

    // 综合评分（可以调整权重）
    const totalScore = nameScore * 0.6 + codeScore * 0.4

    // 更新最佳匹配
    if (totalScore > bestScore) {
      bestScore = totalScore
      bestMatch = item
    }
  })

  // 如果最佳匹配分数低于阈值，返回 null
  const THRESHOLD = 0.3 // 降低阈值以适应模糊匹配
  if (bestScore < THRESHOLD) {
    return null
  }

  return bestMatch
}
