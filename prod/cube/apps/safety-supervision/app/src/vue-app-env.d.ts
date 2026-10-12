declare module '*.module.less' {
  const classes: Readonly<Record<string, string>>
  export default classes
}
declare module '*.png' {
  const src: string
  export default src
}
declare module 'luckyexcel'
