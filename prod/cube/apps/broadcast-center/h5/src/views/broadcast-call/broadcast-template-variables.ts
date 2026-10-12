/** 内置变量 */
export const buildInVariables: Record<string, { label: string; placeholder: string; type: string; }> = {
  // 获取当前时间
  '${name}': {
    label: '姓名',
    placeholder: '请输入姓名',
    type: 'text'
  },
  '${phone}': {
    label: '手机号',
    placeholder: '请输入手机号',
    type: 'tel'
  },
  '${address}': {
    label: '地址',
    placeholder: '请输入地址',
    type: 'textarea'
  },
  '${plateNo}': {
    label: '车牌号',
    placeholder: '请输入车牌号',
    type: 'text'
  },
  '${curTime}': {
    label: '时间',
    placeholder: '请选择时间',
    type: 'timePicker'
  },
  '${curDate}': {
    label: '日期',
    placeholder: '请选择日期',
    type: 'datePicker'
  },
  '${genericText}': {
    label: '普通文本',
    placeholder: '请输入通用文本',
    type: 'textarea'
  }
}

/** 匹配文本中的内置变量 */
export function extractVariables (text: string): string[] {
  // 使用正则表达式匹配所有形如 "${xxx}" 的字符串
  // \$\{([^}]+)\} 中的 \$\{ 匹配 "${"，([^}]+) 匹配非 "}" 的一个或多个字符，\} 匹配 "}"
  // g 标志表示全局搜索，即查找所有匹配项，而非停止在第一个匹配项
  const regex = /\$\{([^}]+)\}/g
  const matches = text.match(regex)

  // 由于 match 方法直接返回匹配到的所有结果（如果没有结果则为 null），
  // 我们不需要对结果进行进一步处理（除了可能将 null 转换为空数组）
  return matches || [] // 如果匹配结果为 null，则返回空数组
}
