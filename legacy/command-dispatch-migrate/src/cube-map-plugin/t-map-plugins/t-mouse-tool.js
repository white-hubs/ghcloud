export class TMouseTool {
  tempCircle = null;
  radius = 0;
  center = null;
  mapPlugin = null;
  eventCallback = null;
  constructor(mapPlugin) {
    this.mapPlugin = mapPlugin;
  }
  on(event, callback) {
    if (event === 'draw') {
      this.eventCallback = callback;
    }
  }
  // 绘制圆
  circle({
    fillColor,
    strokeColor
  }) {
    this._createCircle();
    this.tempCircle.setStyle({
      fillColor,
      color: strokeColor,
    })
  }
  // 绘制线
  polyline() {
    throw new Error('polyline is not support');
  }
  // 绘制多边形
  polygon() {
    throw new Error('polygon is not support');
  }
  rectangle() {
    throw new Error('rectangle is not support');
  }
  close() {
    this.mapPlugin.mapInstance.removeLayer(this.tempCircle)
  }

  _createCircle() {
    if (!this.mapPlugin.mapInstance) {
      throw new Error('map instance is not init');
    }
    this.mapPlugin.mapInstance.dragging.disable();
    this.tempCircle = new L.circle();
    this.mapPlugin.mapInstance.on("mousedown", (e) => {
      this._onMouseDown(e)
    });
  }
  _onMouseDown(e) {
    this.center = e.latlng;
    this.mapPlugin.mapInstance.on("mousemove", (e) => {
      this._onMouseMove(e)
    });
    this.mapPlugin.mapInstance.on("mouseup", (e) => {
      this._onmouseUp(e)
    });
  }
  _onMouseMove(e) {
    if (!this.center) {
      throw new Error('center is not init');
    }
    if (!this.tempCircle) {
      throw new Error('tempCircle is not init');
    }
    this.radius = e.latlng.distanceTo(this.center);
    this.tempCircle.setLatLng(this.center);
    this.tempCircle.setRadius(this.radius);
    this.mapPlugin.mapInstance.addLayer(this.tempCircle);
  }
  _onmouseUp(e) {
    this.radius = e.latlng.distanceTo(this.center);
    this.tempCircle.setRadius(this.radius);
    this.mapPlugin.mapInstance.addLayer(this.tempCircle);
    this.mapPlugin.mapInstance.dragging.enable();
    this.mapPlugin.mapInstance.off("mousedown");
    this.mapPlugin.mapInstance.off("mousemove");
    this.mapPlugin.mapInstance.off("mouseup");
    this.eventCallback({
      obj: {
        _opts: {
          center: this.center,
          radius: this.radius,
        },
        contains: this._circleContains.bind(this)
      }
    });
  }
  // 判断指定点坐标是否在圆内
  _circleContains(latLng) {
    const point = L.latLng(latLng.lat, latLng.lng);
    const distance = point.distanceTo(this.center);
    return distance <= this.radius;
  }
}
// state.mouseTool.circle({
//   fillColor: "00b0ff",
//   strokeColor: "80d8ff",
// });
// state.mouseTool.on("draw", function (e) {
//   map.value.remove(overlays);
//   overlays = [];
//   overlays.push(e.obj);
//   if (e.obj._opts.center.lng && e.obj._opts.radius) {
//     if (state.mapEditgb) {
//       getDispatchCircleDevice(
//         e.obj._opts.center.lng,
//         e.obj._opts.center.lat,
//         e.obj._opts.radius
//       );
//     } else {
//       getDispatchCirclePerson(e.obj)
//     }
//   }
// });