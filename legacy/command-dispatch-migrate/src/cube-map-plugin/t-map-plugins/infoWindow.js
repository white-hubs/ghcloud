export class TInfoWindow {
  constructor({
    isCustom,
    content,
    offset
  }) {
    const infoWindow = this._getInfoWindow(content);
    infoWindow.open = (mapPlugin, latLng) => {
      infoWindow.setLatLng([latLng.lat, latLng.lng]).openOn(mapPlugin.mapInstance);
    }
    this._includePopup()
    return infoWindow;
  }
  _getInfoWindow(content) {
    return L.popup({
      closeButton: false,
      offset: L.point(-10, 12),
      closeOnClick: false,
    }).setContent(content)
  }
  // 重写leaflet弹窗缩放动画 解决缩放时弹窗不跟随移动
  _includePopup() {
    L.Popup.include({
      _animateZoom: function (e) {
        if (!this._map) {
          return
        }
        const pos = this._map._latLngToNewLayerPoint(this._latlng, e.zoom, e.center)
        const anchor = this._getAnchor();
        L.DomUtil.setPosition(this._container, pos.add(anchor));
      }
    })
  }
}