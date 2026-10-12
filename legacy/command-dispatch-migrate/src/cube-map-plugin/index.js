import { CubeMapLeaflet } from './map-leaflet/cube-map.es'
import { initAMapPlugin } from './amap-plugins/index'
import { transformGCJ02ToWGS84 } from '@isvend/coord-transform'
export class CubeMapPlugin {
  cubeMapLeaflet = null
  mapInstance = null
  constructor(options) {
    this.options = options
    this.map = null
    this.cubeMap = null
    this.init()
  }
  init() {
    this.cubeMapLeaflet = new CubeMapLeaflet(this.options)
  }
  async getMapType() {
    await this.cubeMapLeaflet.getMapConfig()
    return this.cubeMapLeaflet.mapType
  }
  /**
   * 加载地图
   * @param {*} container 
   * @param {*} options 
   */
  async loadMap(container, options) {
    await this.getMapType()
    if (this.cubeMapLeaflet.mapType === 'TD_MAP') {
      await this.cubeMapLeaflet.renderMap(container, options)
      this.mapInstance = this.cubeMapLeaflet.getMapInstance()
    } else {
      await initAMapPlugin()
      this.renderAMap(container, options)
    }
  }
  /**
   * 渲染高德地图
   * @param {*} container 
   * @param {*} options 
   */
  renderAMap(container, options) {
    this.mapInstance = new AMap.Map(container, {
      center: [104.05713, 30.587918],
      zoom: 11.2,
      mapStyle: "amap://styles/darkblue",
    });
  }
  /**
   * 将marker添加至地图
   * @param {*} marker 
   * @returns 
   */
  addMarkerToMap(marker) {
    if (!this.cubeMapLeaflet) {
      throw new Error('cubeMapLeaflet is not init')
    }
    if (!this.mapInstance) {
      throw new Error('mapInstance is not init')
    }
    if (this.cubeMapLeaflet.mapType === 'TD_MAP') {
      marker.addTo(this.mapInstance)
      return
    }
    marker.setMap(this.mapInstance)
  }
  /**
   * 创建Marker
   * @param {*} param iconConfig: { size, icon, imageSize } markerConfig: { lngLat, offset }
   * @returns 
   */
  createMarker({
    iconConfig,
    markerConfig
  }) {
    if (!this.cubeMapLeaflet) {
      throw new Error('cubeMapLeaflet is not init')
    }
    if (!this.mapInstance) {
      throw new Error('mapInstance is not init')
    }
    if (this.cubeMapLeaflet.mapType === 'TD_MAP') {
      return this._createTMapMarker({
        iconConfig, markerConfig: {
          ...markerConfig,
          lngLat: this._transformAMapToTMapCoord(markerConfig.lngLat)
        }
      })
    }
    return this._createAMapMarker({ iconConfig, markerConfig }).setMap(this.mapInstance)
  }
  /**
   * 获取marker位置
   * @param {*} marker  
   * @returns 
   */
  getMarkerPosition(marker) {
    if (!this.cubeMapLeaflet) {
      throw new Error('cubeMapLeaflet is not init')
    }
    if (!this.mapInstance) {
      throw new Error('mapInstance is not init')
    }
    if (this.cubeMapLeaflet.mapType === 'TD_MAP') {
      const latLng = marker.getLatLng()
      return {
        lng: latLng[1],
        lat: latLng[0],
      }
    }
    return marker.getPosition()
  }
  /**
   * 移除marker
   * @param {*} markers markerList: Array<Marker>
   */
  removeMarkers(markers) {
    markers.forEach(marker => {
      marker.remove()
    })
  }
  /**
   * 创建信息窗体至地图
   * @param {*} param elementRef: dom, lngLat: { lng, lat }
   */
  createInfoWindowToMap({ elementRef, lngLat }) {
    if (!this.cubeMapLeaflet) {
      throw new Error('cubeMapLeaflet is not init')
    }
    if (!this.mapInstance) {
      throw new Error('mapInstance is not init')
    }
    this.cubeMapLeaflet.mapType === 'TD_MAP' ? this._createTMapInfoWindow({
      elementRef, lngLat
    }) : this._createAMapInfoWindow({ elementRef, lngLat })
  }
  /**
   * 移除信息窗体
   */
  removeInfoWindow() {
    if (!this.cubeMapLeaflet) {
      throw new Error('cubeMapLeaflet is not init')
    }
    if (!this.mapInstance) {
      throw new Error('mapInstance is not init')
    }
    this.cubeMapLeaflet.mapType === 'TD_MAP' ? this.mapInstance.closePopup() : this.mapInstance.clearInfoWindow()
  }
  /**
   * 高德地图坐标转天地图坐标
   */
  _transformAMapToTMapCoord(lnglat) {
    return {
      lng: transformGCJ02ToWGS84(Number(lnglat.lng), Number(lnglat.lat))[0],
      lat: transformGCJ02ToWGS84(Number(lnglat.lng), Number(lnglat.lat))[1],
    }
  }
  /**
   * 创建天地图信息窗体并打开
   * @param {*} param elementRef: dom, lngLat: { lng, lat }
   */
  _createTMapInfoWindow({ elementRef, lngLat }) {
    const infoWindow = L.popup().setLatLng([lngLat.lat, lngLat.lng]).setContent(elementRef)
    infoWindow.openOn(this.mapInstance)
  }
  /**
   * 创建高德地图信息窗体并打开
   * @param {*} param elementRef: dom, lngLat: { lng, lat }
   */
  _createAMapInfoWindow({ elementRef, lngLat }) {
    const infoWindow = new AMap.InfoWindow({
      isCustom: true, //使用自定义窗体
      content: elementRef,
      offset: new AMap.Pixel(0, -26),
    });
    infoWindow.open(this.mapInstance, [lngLat.lng, lngLat.lat]);
  }

  /**
   * 创建天地图marker
   * @param {*} param iconConfig: { size, icon, imageSize } markerConfig: { lngLat, offset }
   */
  _createTMapMarker({
    iconConfig,
    markerConfig
  }) {
    const icon = this._createTMapIcon(iconConfig)
    const marker = L.marker([
      markerConfig.lngLat.lat,
      markerConfig.lngLat.lng
    ], {
      icon
    })
    return marker
  }
  /**
   * 创建高德mark
   * @param {*} param iconConfig: { size, icon, imageSize } markerConfig: { lngLat, offset }
   * 
   */
  _createAMapMarker({
    iconConfig,
    markerConfig
  }) {
    const icon = this._createAMapIcon(iconConfig)
    const marker = new AMap.Marker({
      position: new AMap.LngLat(markerConfig.lngLat.lng, markerConfig.lngLat.lat),
      icon,
      offset: new AMap.Pixel(...markerConfig.offset),
    })
    return marker
  }
  /**
   * 创建天地图mark
   * @param {*} param { size, icon, imageSize } 
   * @returns 
   */
  _createTMapIcon({
    size,
    icon,
    imageSize
  }) {
    const LIcon = L.icon({
      iconUrl: icon,
      iconSize: size,
      iconAnchor: [size[0] / 2, size[1] / 2],
    })
    return LIcon
  }
  /**
   * 创建高德mark
   * @param {*} param
   * @returns 
   */
  _createAMapIcon({
    size,
    icon,
    imageSize
  }) {
    const AMapIcon = new AMap.Icon({
      size: new AMap.Size(...size),
      // 图标尺寸
      image: icon, // Icon的图像
      imageSize: new AMap.Size(...imageSize), // 根据所设置的大小拉伸或压缩图片
    });
    return AMapIcon
  }
}
export const getAuth = () => {
  const token = JSON.parse(sessionStorage.getItem('GH-Token')).access_token
  const tenant = JSON.parse(sessionStorage.getItem('GH-NowEnterprise')).code
  if (!token) {
    throw new Error('token不存在')
  }
  if (!tenant) {
    throw new Error('tenant不存在')
  }
  return {
    tenant,
    terminal: 'command-dispatch-app',
    token
  }
}