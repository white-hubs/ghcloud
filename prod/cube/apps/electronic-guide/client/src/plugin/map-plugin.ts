import '@amap/amap-jsapi-types'
import { CubeMapLeaflet } from '@ghcloud/cube-map-plugins'
import { getAssetsFile } from '@/utils'
import type { PointVo, RegionVo } from '@ghcloud/electronic-guide-service'
import { InfoWindow } from '@/views/components/right-side/component/info-window/info-window'
import { createApp, h } from 'vue'
import { useClientStore } from '@/store/modules/client-store'
import { CubeTerminalEnum, type CubeAuth } from '@ghcloud/cube-protocol'
import { leafletMiddleLayer } from '@ghcloud/electronic-guide'
import type { MapType } from '@ghcloud/cube-map-plugins/src/core/type'

export const authStore: CubeAuth = {
  tenant: '58197260',
  token: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0ZW5hbnRzIjpbIjU4MTk3MjYwIiwiNTgxOTcyNjAiLCI0OTY5OTEyMiIsIjI0ODk0ODA1IiwiNDE4NTAwMjQiLCI1Njg5MDM5MiIsIjQxMzAyNzY2IiwiNTc2MzEzNzUiLCI0MTUzMDAyMCIsIjMxMjE1ODU1Il0sInBhc3N3b3JkX2V4cGlyZWQiOnRydWUsInVzZXJfbmFtZSI6IjE3MzExMzY5NzgyIiwiYWRtaW4iOmZhbHNlLCJwYXNzd29yZF9mb3JjZWQiOmZhbHNlLCJhdXRob3JpdGllcyI6WyIxODY2Nzg4MTg2ODUyNjkxOTY5IiwiMTc3MjU0Nzk3MzM0ODA2OTM3NyIsIjE2NTE4NDY3OTE2OTM0MTQ0MDEiLCJST0xFX0FDVElWSVRJX1VTRVIiLCIxNjAyODQ3ODI2NjM3ODI4MDk3IiwiMTc3MzI4NzgzMzkwNjE4ODI4OSJdLCJjbGllbnRfaWQiOiJjbGllbnRfMiIsInBhc3N3b3JkX2V4cGlyYXRpb25fcmVtaW5kZWQiOnRydWUsImFkbWluaXN0cmF0ZWRfdGVuYW50cyI6WyI1ODE5NzI2MCIsIjQ5Njk5MTIyIiwiMjQ4OTQ4MDUiLCI0MTg1MDAyNCIsIjU2ODkwMzkyIiwiNDEzMDI3NjYiLCI1NzYzMTM3NSIsIjQxNTMwMDIwIiwiMzEyMTU4NTUiXSwic2NvcGUiOlsic2VsZWN0Il0sIm5hbWUiOiLotoXnuqfnrqHnkIblkZgiLCJwYXNzd29yZF9leHBpcmF0aW9uX2RhdGUiOjE3NDA4MTYzMDUwMDAsImlkIjoxNDc4NjM2ODg2OTg0NTIzNzc3LCJleHAiOjE4NDUzOTcwNzksImp0aSI6IjcxMWNiMGMyLTc0MTgtNGVjZC05Zjk3LTEzN2FkZDc3NzMwMCJ9.dssD1ZRoonJjtq409EnfadLjjELxHBmShE4Tdalu7iADtaZpaMOOD-Wc7UHrO-ANZvfQWIquuxhqwiGYeJ0R54kLTXIYRs8Vi_wPNagjn5EhIbXepGQlaGyKLjVp9ZyhCExo4HyeYYsWMJ_nzdnll27yF4ixP8u-N9dbcXzrec0XnSv7kiTgZljvuJMuAjA1TPfl7JPaU0IDvVbYfppvltISV-aZlqDr0NH1ra8JtvNz3avOkRB9rQwAeFQxfsbOF7Ks432-_M4kNwnGqEFifd2XKktOG4cZEGMxMfxd4aLkapk8ATQrR0P5Z81S6RZz5YraMNfEx4LONSCIlGdf7A',
  terminal: CubeTerminalEnum.BUSINESS
}
interface InitMapOptions {
  center: number[]; zoom: number; mapContainerId: string;
}
export const mapOptions: InitMapOptions = {
  center: [],
  zoom: 20,
  mapContainerId: ''
}
export interface InitMapConfig {
  center: [number, number];
  zoom: number;
}

export class CustomAMap {
  public static instance: CustomAMap
  public mapInstance!: AMap.Map
  public currentLayerFile: string = ''
  private infoWindow: AMap.InfoWindow | null = null
  private clusterMarker: AMap.MarkerClusterer | null = null
  private currentMarker: AMap.Marker | null = null
  private AMap!: typeof AMap
  // private readonly markerLayer: any
  private markers: AMap.Marker[] = []
  private imageLayer: AMap.ImageLayer | null = null
  private readonly walking: unknown = null
  private initMapConfig: InitMapConfig
  private center: [number, number]
  private currentLocation: [number, number] = [0, 0]
  private readonly mapContainerId: string
  private readonly zoom: number
  private mapType: MapType = 'gdMap'
  public constructor (options: InitMapOptions) {
    this.center = [options.center[1], options.center[0]]
    this.mapContainerId = options.mapContainerId
    this.initMapConfig = {
      center: options.center.toReversed() as [number, number],
      zoom: options.zoom,
    }
    this.zoom = options.zoom
    this.initMap()
  }

  /**
   * 初始化地图
   */
  public async initMap (): Promise<void> {
    const cubeMapPlugin = new CubeMapLeaflet(authStore)
    await cubeMapPlugin.mapLoader()
    this.mapType = cubeMapPlugin.getMapType()
    if (this.mapType === 'TD_MAP') {
      // 用中间层实现高德API
      leafletMiddleLayer(cubeMapPlugin)
    }
    this.AMap = window.AMap as typeof AMap
    this.mapInstance = new this.AMap.Map(this.mapContainerId, {
      center: this.center,
      zoom: this.zoom,
      features: ['road'],
      viewMode: '2D',
    })
    this.mapInstance.on('complete', () => {
      // this.addCurrentPositionMarker()
    })
  }

  /**
   * 增加mark
   */
  public addPointMark (lngLat: [number, number], imageUrl: string, itemVo: PointVo): void {
    const labelContent = `<div class='point-marker'> <img src=${imageUrl} width="14px" height="14px" /><span>${itemVo.name}</span> </div>`
    const marker = new this.AMap.Marker({
      position: lngLat,
      content: labelContent,
      offset: new AMap.Pixel(-42, -27),
    })
    const app = createApp({
      render () {
        return h(InfoWindow, {
          info: itemVo,
        })
      }
    })
    const container = document.createElement('div')
    app.mount(container)
    marker.on('click', () => {
      this.createInfoWindow(lngLat, container)
    })
    try {
      marker.setMap(this.mapInstance)
    } catch {
      this.mapInstance.add(marker)
    }
    this.markers.push(marker)
  }

  /**
   * 增加区域mark
   */
  public addAreaMark (lngLat: [number, number], imageUrl: string, itemVo: RegionVo): void {
    const labelContent = `<div class='point-marker'><img src=${imageUrl} width="14px" height="14px" /><span>${itemVo.name}</span> </div>`
    const regionMarker = new this.AMap.Marker({
      position: lngLat,
      content: labelContent,
      offset: new AMap.Pixel(-42, -27),
    })
    regionMarker.on('click', () => {
      const clientStore = useClientStore()
      clientStore.regionId = itemVo.id
      clientStore.pointSearchParams.areaId = itemVo.id
      clientStore.areaIdChangeAction()
    })

    try {
      regionMarker.setMap(this.mapInstance)
    } catch {
      this.mapInstance.add(regionMarker)
    }
    this.markers.push(regionMarker)
  }

  /**
   * 添加聚合点
   */
  public addClusterMark (points: PointVo[]): void {
    if (!this.AMap) {
      throw new Error('AMap is not defined')
    }
    if (!this.mapInstance) {
      throw new Error('mapInstance is not defined')
    }
    if (this.clusterMarker) {
      try {
        // @ts-expect-error
        this.clusterMarker.setMap(null)
      } catch {
        this.mapInstance.remove(this.clusterMarker)
      }
    }
    const markersPoints = points.map(item => {
      return {
        ...item,
        lnglat: [item.coordinate.split(',')[1], item.coordinate.split(',')[0]],
      }
    })

    // @ts-expect-error

    this.clusterMarker = new this.AMap.MarkerCluster(this.mapInstance, markersPoints, {
      gridSize: 60,
      renderClusterMarker: (context: { count: number;marker: AMap.Marker; }): void=> {
        const div = document.createElement('div')
        div.style.width = '28px'
        div.style.height = '28px'
        div.style.backgroundColor = 'rgba(2,44,25,0.53)'
        div.style.color = '#fff'
        div.style.fontSize = '14px'
        div.style.lineHeight = '28px'
        div.style.borderRadius = '50%'
        div.style.textAlign = 'center'
        div.innerHTML = context.count + ''
        context.marker.setOffset(new AMap.Pixel(-14, -14))
        context.marker.setContent(div)
      },
      renderMarker: (context: { data: PointVo[]; marker: AMap.Marker; }): void => {
        const itemVo = context.data[0]
        const div = document.createElement('div')
        div.style.background = '#fff'
        div.style.borderRadius = '4px'
        div.style.padding = '4px 7px'
        div.style.display = 'flex'
        div.style.alignItems = 'center'
        div.className = 'point-marker'
        const img = document.createElement('img')
        img.src = itemVo.typeFilePath
        img.style.width = '18px'
        img.style.height = '18px'
        div.appendChild(img)
        const textSpan = document.createElement('span')
        textSpan.style.height = 'max-width'
        textSpan.innerText = itemVo.name
        div.appendChild(textSpan)
        document.body.appendChild(div)
        const offset = new this.AMap.Pixel(-42, -27)
        context.marker.setOffset(offset)
        context.marker.setContent(div)
        context.marker.on('click', () => {
          const lngLat = [Number(itemVo.coordinate.split(',')[1]), Number(itemVo.coordinate.split(',')[0])] as [number, number]
          const app = createApp({
            render () {
              return h(InfoWindow, {
                info: itemVo,
              })
            }
          })
          const container = document.createElement('div')
          app.mount(container)
          this.createInfoWindow(lngLat, container)
        })
      }
    })
    if (!this.clusterMarker) return
    // 点击放大地图
    this.clusterMarker.on('click', (item: { clusterData: { lnglat: { lng: number; lat: number; }; }[]; }) => {
      // 此处是通过包含点的数量判断是否是聚合点，不是聚合点就执行上方单个点的点击方式
      if (item.clusterData.length <= 1) {
        return
      }
      // 这里是计算所有聚合点的中心点
      let alllng = 0; let alllat = 0
      for (const mo of item.clusterData) {
        alllng += mo.lnglat.lng
        alllat += mo.lnglat.lat
      }
      const lat = alllat / item.clusterData.length
      const lng = alllng / item.clusterData.length
      // 这里是放大地图，此处写死了每次点击放大的级别，可以根据点的数量和当前大小适应放大，体验更佳
      this.mapInstance.setZoomAndCenter(this.mapInstance.getZoom() + 1, [lng, lat])
    })
  }

  /**
   * 创建信息窗体
   * @param lngLat 经纬度
   * @param content dom
   */
  public createInfoWindow (lngLat: [number, number], content: HTMLElement): void {
    this.closeInfoWindow()
    this.setCenter(lngLat[1], lngLat[0])
    const infoWindow = new AMap.InfoWindow({
      content,
    })
    infoWindow.open(this.mapInstance, lngLat)
    this.infoWindow = infoWindow
  }

  /**
   * 关闭信息窗体
   */
  public closeInfoWindow (): void {
    this.infoWindow && this.infoWindow.close()
    this.infoWindow = null
  }

  /**
   * 步行路线规划
   */
  public routeWalkPlan (lngLat: [number, number]): void {
    if (!this.AMap) {
      throw new Error('AMap is not defined')
    }
    if (!this.mapInstance) {
      throw new Error('mapInstance is not defined')
    }

    // @ts-expect-error

    this.walking = new this.AMap.Walking(
      {
        map: this.mapInstance,
        autoFitView: true
      }
    )

    // @ts-expect-error

    this.walking.search([this.currentLocation[1], this.currentLocation[0]], lngLat, (status: string, result: {
      routes: unknown;
    }) => {
      if (status === 'complete') {

      }
    })
  }

  /**
  * 清除路线规划
  */
  public clearWalkPlan (): void {
    if (!this.AMap) {
      throw new Error('AMap is not defined')
    }
    if (!this.mapInstance) {
      throw new Error('mapInstance is not defined')
    }

    // @ts-expect-error

    this.walking?.clear()
  }
  /**
   * 设置初始配置
   * @param config
   */

  public setCurrentLocation (config: {
    center: [number, number];
    zoom: number;
  }): void {
    this.initMapConfig = config
  }

  /**
   * 还原地图初始状态
   */
  public resetMap (): void {
    this.setCenter(this.initMapConfig.center[0], this.initMapConfig.center[1])
    this.setZoom(this.initMapConfig.zoom)
  }

  /**
   * 设置地图缩放等级范围
   */
  public setZoomRange (min: number, max: number): void {
    if (!this.AMap) {
      throw new Error('AMap is not defined')
    }
    if (!this.mapInstance) {
      throw new Error('mapInstance is not defined')
    }
    this.mapInstance.setZooms([min, max])
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
    this.center = [lat, lng].toReversed() as [number, number]
    this.mapInstance.setCenter(this.center, true)
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
    this.mapInstance.setZoom(zoom, true)
  }

  /**
   * 清除mark
   */
  public clearMark (): void {
    this.markers.forEach(marker => {
      this.mapInstance.remove(marker)
    })
    this.markers = []
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
    const swLatLng = config.southwest.split(',').toReversed()
    const neLatLng = config.northeast.split(',').toReversed()
    const centerLat = Number(config.center.split(',')[0])
    const centerLng = Number(config.center.split(',')[1])
    this.center = [centerLat, centerLng].toReversed() as [number, number]
    this.imageLayer = new this.AMap.ImageLayer({
      url: config.layerFile,
      bounds: new this.AMap.Bounds(swLatLng, neLatLng) as unknown as [number, number, number, number],
    })
    this.currentLayerFile = config.layerFile
    this.mapInstance.add(this.imageLayer)
    this.setCenter(centerLat, centerLng)
    this.setLimitBounds()
  }

  /**
   * 设置显示范围
   * TODO: 后期使用配置
   */
  public setLimitBounds (): void {
    const northEast = [104.033211, 30.570677]
    const southWest = [104.009815, 30.558826]
    const bounds = new this.AMap.Bounds(southWest, northEast)
    this.mapInstance.setLimitBounds(bounds)
  }

  /**
   * 去除图层
   * @returns
   */
  public removeMapImageLayer (): void {
    if (!this.AMap) {
      throw new Error('AMap is not defined')
    }
    if (!this.mapInstance) {
      throw new Error('mapInstance is not defined')
    }
    this.imageLayer && this.mapInstance.remove(this.imageLayer)
  }

  /**
  * 新增当前位置的marker和infoWindow
  */
  public async addCurrentPositionMarker (lngLat: [number, number]): Promise<void> {
    if (!this.AMap) {
      throw new Error('AMap is not defined')
    }
    if (!this.mapInstance) {
      throw new Error('mapInstance is not defined')
    }
    const iconSrc = getAssetsFile('current-position.png')
    const icon = new this.AMap.Icon({
      image: iconSrc,
      size: new AMap.Size(92, 92),
      imageSize: new AMap.Size(92, 92),
      imageOffset: new AMap.Pixel(0, 0)
    })
    const labelContent = '<div class=\'info\'>我的位置</div>'
    this.currentMarker = new this.AMap.Marker({
      position: [lngLat[1], lngLat[0]],
      icon,
      offset: new AMap.Pixel(-46, -46),
      label: {
        direction: 'top',
        content: labelContent,
        offset: new AMap.Pixel(0, 5),
      }
    })
    try {
      this.currentMarker.setMap(this.mapInstance)
    } catch {
      this.mapInstance.add(this.currentMarker)
    }
    this.currentLocation = lngLat
  }

}
