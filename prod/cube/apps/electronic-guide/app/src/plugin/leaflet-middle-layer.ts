import type { CubeMapLeaflet } from '@ghcloud/cube-map-plugins'

let cubeMapPlugin: CubeMapLeaflet | null = null

class Map_2 {
  private mapClickCallBack: ((event: any) => void) | null = null;
  public constructor (div: string, opts?: Partial<AMap.MapOptions>){
    if (!cubeMapPlugin){
      throw new Error('cubeMapPlugin is not defined')
    }
    cubeMapPlugin.renderMap(div).then(() => {
      if (cubeMapPlugin){
        cubeMapPlugin.onMapClick = (event): void=>{
          this.mapClickCallBack?.({
            lnglat: {
              getLng: () => event.lng,
              getLat: () => event.lat
            }
          })
        }
      }
      cubeMapPlugin?.registerMapClickEvent()
      cubeMapPlugin?.setZoom(opts?.zoom ?? 16)
      opts?.center && cubeMapPlugin?.setCenter(opts.center[0], opts.center[1])
    })
  }

  public setCenter (
    center: [number, number],
    immediately?: boolean,
    duration?: number
  ): void{
    cubeMapPlugin?.setCenter(center[0], center[1])
  };

  public setZoom (zoom: number): void{
    cubeMapPlugin?.setZoom(zoom)
  };

  public destroy (): void{
    cubeMapPlugin?.destroy()
  }

  public on (type: string, fn: any, context: any, once?: boolean): void{
    if (type === 'click'){
      this.mapClickCallBack = fn
    }
  };

  public add (layer: any): void{
    layer.addTo(cubeMapPlugin?.getMapInstance())
  }

  public remove (marker: any): void{
    cubeMapPlugin?.removeMarker(marker)
  }

  public setZooms (zooms: [number, number]): void{
    cubeMapPlugin?.setZooms(zooms)
  }

  public setLimitBounds (bounds: [[number, number], [number, number]]): void{
    return
    const boundsArr: [{ lng: number; lat: number; }, { lng: number; lat: number; }] = [
      { lng: bounds[0][1], lat: bounds[0][0] },
      { lng: bounds[1][1], lat: bounds[1][0] }
    ]
    cubeMapPlugin?.setLimitBounds(boundsArr)
  }
}

/**
 * 使用leaflet 实现高德API 中间层 并挂载到window.AMap 上
 * Author: Zee
 */
export const leafletMiddleLayer = (cubeMapLeaflet: CubeMapLeaflet): void => {
  cubeMapPlugin = cubeMapLeaflet
  window.AMap = {
    // @ts-ignore
    Map: Map_2,
    // @ts-ignore
    Marker: function (opts: any): AMap.Marker{
      if (opts.icon){
        opts.iconSize = [opts.icon.getSize().width, opts.icon.getSize().height]
        opts.icon = opts.icon.getImage()
      }
      if (opts.label?.offset){
        opts.label.offset = {
          ...opts.label.offset,
          x: opts.label.offset.x,
          y: opts.label.offset.y * -10
        }
      }
      const marker = cubeMapLeaflet?.createMarker({
        position: {
          lng: opts.position[0],
          lat: opts.position[1]
        },
        icon: opts.icon ?? undefined,
        iconSize: opts.iconSize ?? [38, 63],
        label: opts.label ?? undefined,
        content: opts.content ?? undefined,
      })
      return marker as unknown as AMap.Marker
    },
    // @ts-ignore
    Bounds: function (swLatLng: [number, number], neLatLng: [number, number]): AMap.Bounds{
      return [[neLatLng[1], neLatLng[0]], [swLatLng[1], swLatLng[0]]] as unknown as AMap.Bounds
    },
    // @ts-ignore
    ImageLayer: function (opts: {
      bounds: [[number, number], [number, number]];
      url: string;
    }): AMap.ImageLayer{
      return cubeMapLeaflet?.createdImageLayer({
        bounds: [
          { lng: opts.bounds[0][1], lat: opts.bounds[0][0] },
          { lng: opts.bounds[1][1], lat: opts.bounds[1][0] }
        ],
        imageUrl: opts.url
      }) as unknown as AMap.ImageLayer
    },
    // @ts-ignore
    Size: function (width: number, height: number): AMap.Size{
      // 以字符串形式返回尺寸大小对象
      return {
        width,
        height,
        toString: () => `${width}px,${height}px`,
        // 获取尺寸的宽度
        getWidth: () =>Number(width),
        // 获取尺寸的高度
        getHeight: () => Number(height)
      } as unknown as AMap.Size
    },
    // @ts-ignore
    Pixel: function (x: number, y: number, isRound?: boolean): AMap.Pixel{
      return {
        x,
        y,
        toString: () => `${x},${y}`,
        // 获取像素的横坐标
        getX: () => x,
        // 获取像素的纵坐标
        getY: () => y,
        equals: (pixel: AMap.Pixel) => {
          return pixel.x === x && pixel.y === y
        }
      } as unknown as AMap.Pixel
    },
    // @ts-ignore
    Icon: function (opts: {
      size: AMap.Size;
      imageSize: AMap.Size;
      imageOffset: AMap.Pixel;
      image: string;
    }): AMap.Icon{
      return {
        setImageSize (size: AMap.Size) {
          opts.imageSize = size
        },
        getImageSize: () => opts.imageSize,
        setSize (size: AMap.Size) {
          opts.size = size
        },
        getSize: () => opts.size,
        setImageOffset (offset: AMap.Pixel) {
          opts.imageOffset = offset
        },
        getImageOffset: () => opts.imageOffset,
        setImage (image: string) {
          opts.image = image
        },
        getImage: () => opts.image,
      } as unknown as AMap.Icon
    },
    // @ts-ignore
    InfoWindow: function (opts: {
      content: HTMLElement;
    }): AMap.InfoWindow{
      const infoWindow = cubeMapLeaflet?.createInfoWindow({
        content: opts.content
      })
      return {
        // @ts-ignore
        open: (mapInstance, lngLat: [number, number])=>{
          cubeMapLeaflet.openInfoWindow(infoWindow, {
            lat: lngLat[1],
            lng: lngLat[0]
          })
        },
        close: ()=>{
          infoWindow.close()
        }
      } as unknown as AMap.InfoWindow
    }
  }
}