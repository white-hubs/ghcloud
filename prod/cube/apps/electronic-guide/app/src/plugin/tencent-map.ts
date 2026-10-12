import { EventBus } from './event-bus'
export class TencentMap extends EventBus {
  public mapInstance: any
  private markerLayer: any
  private center: number[]
  private readonly TencentMap: any
  private readonly mapContainer: HTMLDivElement
  private readonly zoom: number
  public constructor (center: number[], zoom: number, mapContainerId: string) {
    super()
    const containerDom = document.getElementById(mapContainerId) as HTMLDivElement
    this.center = center
    this.mapContainer = containerDom
    this.zoom = zoom
    this.TencentMap = (window as any).TMap
    this.initMap()
  }

  /**
   * 初始化地图
   */
  public initMap (): void {
    if (!this.TencentMap) {
      throw new Error('TencentMap is not defined')
    }
    const center = new this.TencentMap.LatLng(this.center[0], this.center[1])
    this.mapInstance = new this.TencentMap.Map(this.mapContainer, {
      center,
      viewMode: '2D',
      disableDefaultUI: true,
      zoom: this.zoom
    })
    this.initListenClickMap()
  }

  /**
   * 清除mark
   */
  public clearMark (): void {
    if (!this.markerLayer) {
      throw new Error('markerLayer is not defined')
    }
    this.markerLayer.setGeometries([])
  }

  /**
   * 根据位置新增mark
   */
  public addMark (lat: number, lng: number): void {
    if (!this.markerLayer) {
      throw new Error('markerLayer is not defined')
    }
    this.markerLayer.add([{
      position: {
        height: 0,
        lat,
        lng
      }
    }])
  }

  /**
   * 设置中心点
   */
  public setCenter (lat: number, lng: number): void {
    if (!this.TencentMap) {
      throw new Error('TencentMap is not defined')
    }
    if (!this.mapInstance) {
      throw new Error('mapInstance is not defined')
    }
    const centerLatLng = new this.TencentMap.LatLng(lat, lng)
    this.center = [lat, lng]
    this.mapInstance.setCenter(centerLatLng)
  }

  /**
   * 设置层级
   */
  public setZoom (zoom: number): void {
    if (!this.TencentMap) {
      throw new Error('TencentMap is not defined')
    }
    if (!this.mapInstance) {
      throw new Error('mapInstance is not defined')
    }
    this.mapInstance.setZoom(zoom)
  }

  /**
   * 设置地图图层
   */
  public setMapImageLayer (config: { southwest: string; northeast: string; center: string; layerFile: string; }): void {
    if (!this.TencentMap) {
      throw new Error('TencentMap is not defined')
    }
    if (!this.mapInstance) {
      throw new Error('mapInstance is not defined')
    }
    const swLatLng = config.southwest.split(',')
    const neLatLng = config.northeast.split(',')
    const imageSW = new this.TencentMap.LatLng(swLatLng[0], swLatLng[1])
    const imageNE = new this.TencentMap.LatLng(neLatLng[0], neLatLng[1])
    const centerLat = Number(config.center.split(',')[0])
    const centerLng = Number(config.center.split(',')[1])
    const centerLatLng = new this.TencentMap.LatLng(centerLat, centerLng)
    this.mapInstance.setCenter(centerLatLng)
    const imageLatLngBounds = new this.TencentMap.LatLngBounds(imageSW, imageNE) // 根据拟覆盖范围的西南角与东北角新建LatLngBounds对象
    const imageGroundLayer = new this.TencentMap.ImageGroundLayer({
      bounds: imageLatLngBounds,
      src: config.layerFile, // 拟覆盖图片的URL
      map: this.mapInstance,
    })
    this.mapInstance.setBaseMap({
      type: 'vector',
      features: ['base', 'label'],
    })
    this.emit('setMapImageLayer', imageGroundLayer)
  }

  /**
   * 获取地图层级
   */
  public getZoom (): number {
    if (!this.TencentMap) {
      throw new Error('TencentMap is not defined')
    }
    if (!this.mapInstance) {
      throw new Error('mapInstance is not defined')
    }
    return this.mapInstance.getZoom() as number
  }

  /**
   * 销毁地图
   */
  public destroyMap (): void {
    if (!this.TencentMap) {
      throw new Error('TencentMap is not defined')
    }
    if (!this.mapInstance) {
      throw new Error('mapInstance is not defined')
    }
    this.mapInstance.destroy()
  }

  /**
   * 初始化监听点击地图增加mark
   */
  private initListenClickMap (): void {
    if (!this.TencentMap) {
      throw new Error('TencentMap is not defined')
    }
    if (!this.mapInstance) {
      throw new Error('mapInstance is not defined')
    }
    this.markerLayer = new this.TencentMap.MultiMarker({
      id: 'marker-layer',
      map: this.mapInstance
    })
    this.mapInstance.on('click', (evt: { latLng: unknown; }) => {
      const latLng = evt.latLng as { lat: number; lng: number; }
      this.emit('clickMap', {
        lat: latLng.lat,
        lng: latLng.lng
      })
    })
  }
}
