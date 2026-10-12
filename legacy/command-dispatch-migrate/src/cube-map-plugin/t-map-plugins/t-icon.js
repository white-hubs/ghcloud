export class TIcon {
  constructor({
    size,
    image,
    imageSize //todo 暂时未使用
  }) {
    const icon = L.icon({
      iconUrl: image,
      iconSize: size,
      iconAnchor: [size[0] / 2, size[1] / 2],
    })
    return icon
  }
}