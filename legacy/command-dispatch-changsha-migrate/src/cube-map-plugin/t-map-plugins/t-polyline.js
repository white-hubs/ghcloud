import { TLngLat } from "./t-lnglat";
export class TPolyline {
  constructor({ map, path, strokeColor, strokeWeight, strokeStyle, showDir }) {
    this.mapPlugin = map;
    this.path = this._handlePath(path);
    this.strokeColor = strokeColor;
    this.strokeWeight = strokeWeight;
    this.strokeStyle = strokeStyle;
    this.showDir = showDir;
    return this._createPolyline();
  }
  _handlePath(path) {
    return path.map((item) => {
      const lngLat = new TLngLat(item[0], item[1]);
      return [lngLat.lat, lngLat.lng];
    });
  }
  _createPolyline() {
    const polyLine = L.polyline(this.path, {
      color: this.strokeColor,
      weight: this.strokeWeight,
    }).addTo(this.mapPlugin.mapInstance);
    if (this.showDir) {
      const decorator = L.polylineDecorator(polyLine, {
        patterns: [
          {
            offset: 30, // 箭头起始位置距离线条两端的距离
            repeat: 60, // 箭头重复的间隔
            symbol: L.Symbol.arrowHead({
              pixelSize: 5, // 箭头大小
              headAngle: 105, // 角度
              polygon: false,
              pathOptions: { stroke: true, weight: 2, color: "#fff" },
            }),
          },
        ],
      }).addTo(this.mapPlugin.mapInstance);
      polyLine.on("remove", () => {
        this.mapPlugin.mapInstance.removeLayer(decorator);
      });
    }
    return polyLine;
  }
}
