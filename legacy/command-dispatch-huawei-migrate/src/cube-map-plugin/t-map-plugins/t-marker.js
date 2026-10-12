export class TMarker {
  marker = null;
  icon = null;
  constructor({ position, icon, offset }) {
    this.icon = icon;
    const marker = L.marker([position.lat, position.lng], {
      icon: icon,
    });
    marker.getPosition = () => {
      return marker.getLatLng();
    };
    this._includeMarker();
    return marker;
  }
  // 重写leaflet marker缩放动画 解决缩放时弹窗不跟随移动
  _includeMarker() {
    const that = this;
    L.Marker.include({
      _animateZoom(e) {
        if (!this._map) {
          return;
        }
        const pos = this._map._latLngToNewLayerPoint(this._latlng, e.zoom, e.center);
        that._adjustIconSize(e.zoom, this); // 调整图标大小
        this._setPos(pos);
      },
    });
  }
  _adjustIconSize(zoom, marker) {
    // 从 Marker 的自定义属性中获取基础图标大小
    const baseSize = this.icon.options.iconSize || [40, 40]; // 默认值为 [40, 40]
    const baseIconAnchor = this.icon.options.iconAnchor; // 基础锚点
    const scale = Math.max(0.5, Math.min(2, zoom / 10)); // 缩放比例
    const newSize = [baseSize[0] * scale, baseSize[1] * scale]; // 新图标大小
    if (newSize[0] >= baseSize[0]) {
      return;
    }
    if (newSize[1] >= baseSize[1]) {
      return;
    }
    const newAnchor = [baseIconAnchor[0] * scale, baseIconAnchor * scale]; // 新锚点
    const icon = L.icon({
      iconUrl: this.icon.options.iconUrl, // 使用当前图标 URL
      iconSize: newSize,
      iconAnchor: newAnchor, // 动态调整锚点
    });
    marker.setIcon(icon); // 更新 Marker 的图标
  }
}
