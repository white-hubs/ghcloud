declare module '*.module.less' {
  const classes: Readonly<Record<string, string>>
  export default classes
}

declare module '*.less' {
  const classes: Readonly<Record<string, string>>
  export default classes
}
// declare module '*.css' {
//   const classes: Readonly<Record<string, string>>
//   export default classes
// }
declare module '*.png' {
  const png: string
  export default png
}

declare module '*.webp' {
  const webp: string
  export default webp
}
declare module 'quill-image-uploader' {
  const ImageUploader: unknown
  export default ImageUploader;
}
declare module 'quill-blot-formatter/dist/BlotFormatter' {
  const ImageUploader: unknown
  export default ImageUploader;
}
declare const __ENV__: {
  readonly applicationCode: string;
}
