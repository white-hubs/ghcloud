declare module '*.module.less' {
  const classes: Readonly<Record<string, string>>
  export default classes
}

declare module '*.less' {
  const classes: Readonly<Record<string, string>>
  export default classes
}

declare module '*.svg'
declare module '*.png'
declare module '*.jpg'
declare module '*.jpeg'
declare module '*.gif'
declare module '*.bmp'
declare module '*.tiff'