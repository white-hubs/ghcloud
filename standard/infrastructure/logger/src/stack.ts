export interface StackInfo {
  trigger: string;
  addr: string;
  dir: string;
  row: number;
  col: number;
}

export function getCurrentStacks (): StackInfo[] {
  const result: StackInfo[] = []
  const stackObject = new Error()
  /**
   * 从两种格式中匹配出关键信息
   * case1: `at ${trigger} (http://localhost:8888/path/to/stack.ts?t=1700709311437:${row}:${col}`
   * case2: `at http://localhost:8888/src/${trigger1}:${row1}:${col1}`
   */
  const reg = /\s+at\s(((?<trigger>[^\s]+)\s\((?<addr>[^\\)]+):(?<row>\d+):(?<col>\d+))|((?<addr1>[^\n]+)\/(?<trigger1>[^\\/:]+):(?<row1>\d+):(?<col1>\d+)))/gim
  const stack = stackObject.stack ?? ''
  let execResult = reg.exec(stack)
  while (execResult) {
    if (!execResult.groups) {
      continue
    }
    const trigger = execResult.groups.trigger ?? execResult.groups.trigger1
    const addr = execResult.groups.addr ?? `${execResult.groups.addr1}/${execResult.groups.trigger1}`
    const row = Number(execResult.groups.row ?? execResult.groups.row1)
    const col = Number(execResult.groups.col ?? execResult.groups.col1)
    result.push({
      trigger,
      addr,
      row,
      col,
      dir: addr.replace(/\/[^\\/]+$/, '')
    })

    execResult = reg.exec(stack)
  }

  return result
}
