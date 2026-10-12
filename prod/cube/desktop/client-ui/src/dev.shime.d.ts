declare module '*.less' {
  const less: any
  export default less
}

declare module '*.png' {
  const png: string
  export default png
}

declare module '*.webp' {
  const webp: string
  export default webp
}

declare interface Window {
  cubeElectronIpcRenderer?: any;
}