declare module '*.module.less' {
  const classes: Readonly<Record<string, string>>
  export default classes
}

declare module '*.less' {
  const classes: Readonly<Record<string, string>>
  export default classes
}

declare module '*.webp' {
  const webp: string
  export default webp
}

declare const __ENV__: {
  readonly applicationCode: string;
}
