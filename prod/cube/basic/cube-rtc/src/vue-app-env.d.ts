declare module '*.module.less' {
  const classes: Readonly<Record<string, string>>
  export default classes
}
declare module '*.png' {
  const classes: string
  export default classes
}
declare module '*.mp3' {
  const classes: string
  export default classes
}