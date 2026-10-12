export const showImagePreview = (imgList: string[], index?: number): void => {
  const obj = {
    urls: imgList,
    current: imgList[index ?? 0]
  }
  // @ts-expect-error
  window.previewImage.start(obj)
}
