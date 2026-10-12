import '@amap/amap-jsapi-types'
import { CubeMapLeaflet } from '@ghcloud/cube-map-plugins'
import { authStore } from '@/apis/auth-store'
import { EventBus } from './event-bus'
import { leafletMiddleLayer } from './leaflet-middle-layer'
type MarkersMap = Map<string, AMap.Marker>
export interface ImageLayerConfig {
  southwest: string;
  northeast: string;
  center: string;
  layerFile: string;
}
export class CustomAMap extends EventBus {
  public mapInstance!: AMap.Map
  private imageLayerConfig: ImageLayerConfig = {
    southwest: '',
    northeast: '',
    center: '',
    layerFile: ''
  }

  private AMap!: typeof AMap
  private readonly markersMap: MarkersMap = new Map()
  private layerImageLayer: AMap.ImageLayer[] = []
  private center: [number, number]
  private readonly mapContainerId: string
  private readonly zoom: number
  public constructor (center: number[], zoom: number, mapContainerId: string) {
    super()
    this.center = center.reverse() as [number, number]
    this.mapContainerId = mapContainerId
    this.zoom = zoom
    this.initMap()
  }

  /**
   * 初始化地图
   */
  public async initMap (): Promise<void> {
    const cubeMapPlugin = new CubeMapLeaflet(authStore)
    await cubeMapPlugin.mapLoader()
    if (cubeMapPlugin.getMapType() === 'TD_MAP') {
      // 用中间层实现高德API
      leafletMiddleLayer(cubeMapPlugin)
    }
    this.AMap = window.AMap as typeof AMap
    this.mapInstance = new this.AMap.Map(this.mapContainerId, {
      center: this.center,
      zoom: this.zoom,
    })
    this.initListenClickMap()
  }

  /**
   * 增加mark
   */
  public addMarkByType (type: string, lat: number, lng: number): void {
    this.clearMarkByType(type)
    const marker = new this.AMap.Marker({
      position: [lng, lat],
    })
    this.mapInstance.add(marker)
    this.markersMap.set(type, marker)
  }

  /**
   * 清除指定类型mark
   */
  public clearMarkByType (type: string): void {
    if (!this.markersMap.get(type)) {
      return
    }
    this.mapInstance.remove(this.markersMap.get(type) as unknown as AMap.Marker)
    this.markersMap.delete(type)
  }

  /**
   * 设置中心点
   */
  public setCenter (lat: number, lng: number): void {
    if (!this.AMap) {
      throw new Error('AMap is not defined')
    }
    if (!this.mapInstance) {
      throw new Error('mapInstance is not defined')
    }
    this.center = [lat, lng].reverse() as [number, number]
    this.mapInstance.setCenter(this.center)
  }

  /**
   * 设置层级
   */
  public setZoom (zoom: number): void {
    if (!this.AMap) {
      throw new Error('AMap is not defined')
    }
    if (!this.mapInstance) {
      throw new Error('mapInstance is not defined')
    }
    this.mapInstance.setZoom(zoom)
  }

  /**
   * 清除mark
   */
  public clearMark (): void {
    const allMarks = Object.values(this.markersMap)
    allMarks.forEach(mark => {
      this.mapInstance.remove(mark)
    })
  }

  /**
   * 销毁地图
   */
  public destroyMap (): void {
    if (!this.AMap) {
      throw new Error('AMap is not defined')
    }
    if (!this.mapInstance) {
      throw new Error('mapInstance is not defined')
    }
    this.mapInstance.destroy()
  }

  /**
   * 获取地图层级
   */
  public getZoom (): number {
    if (!this.AMap) {
      throw new Error('AMap is not defined')
    }
    if (!this.mapInstance) {
      throw new Error('mapInstance is not defined')
    }
    return this.mapInstance.getZoom()
  }

  /**
   * 设置地图图层
   */
  public setMapImageLayer (config: { southwest: string; northeast: string; center: string; layerFile: string; }): void {
    if (!this.AMap) {
      throw new Error('AMap is not defined')
    }
    if (!this.mapInstance) {
      throw new Error('mapInstance is not defined')
    }
    if (config.southwest === this.imageLayerConfig.southwest && config.northeast === this.imageLayerConfig.northeast && config.center === this.imageLayerConfig.center && config.layerFile === this.imageLayerConfig.layerFile) {
      return
    }
    this.imageLayerConfig = config
    const swLatLng = config.southwest.split(',').reverse()
    const neLatLng = config.northeast.split(',').reverse()
    const centerLat = Number(config.center.split(',')[0])
    const centerLng = Number(config.center.split(',')[1])
    this.center = [centerLat, centerLng].reverse() as [number, number]
    this.mapInstance.setCenter(this.center)
    this.mapInstance.setZoom(this.zoom)
    const imageLayer = new this.AMap.ImageLayer({
      url: config.layerFile,
      bounds: new this.AMap.Bounds(swLatLng, neLatLng) as unknown as [number, number, number, number],
    })
    this.mapInstance.add(imageLayer)
    this.layerImageLayer.push(imageLayer)
    this.emit('setMapImageLayer', imageLayer)
  }

  public clearMapImageLayer (): void {
    if (!this.AMap) {
      throw new Error('AMap is not defined')
    }
    if (!this.mapInstance) {
      throw new Error('mapInstance is not defined')
    }
    this.layerImageLayer.forEach(layer => {
      this.mapInstance.remove(layer)
    })
    this.layerImageLayer = []
  }

  /**
   * 初始化监听点击地图
   */
  private initListenClickMap (): void {
    if (!this.AMap) {
      throw new Error('AMap is not defined')
    }
    if (!this.mapInstance) {
      throw new Error('mapInstance is not defined')
    }
    this.mapInstance.on('click', e => {
      const lnglat = e.lnglat as { getLat: () => number;getLng: () => number; }
      this.emit('clickMap', {
        lat: lnglat.getLat(),
        lng: lnglat.getLng()
      })
    })
  }
}
