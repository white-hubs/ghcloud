/**
 * 本文件为非标准后缀（如：`*.ts|*.js`）文件导入模块解析定义
 */
declare module '*.less' {
  const less: Record<string, unknown>
  export default less
}

declare module '*.css' {
  const css: Record<string, unknown>
  export default css
}
