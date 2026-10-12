import { modelSDK } from '@/pages/model-sdk/sdk'
import type { CubeMapLeaflet } from '@ghcloud/cube-map-plugins'
import { createApp, h, type VNode } from 'vue'

const getMapInstance = (): {
  cubeMap: CubeMapLeaflet;
} => {
  return modelSDK.getGisMapInstance()
}

const asyncMapEventEnd = async (event: string): Promise<void> => {
  const { cubeMap } = getMapInstance()
  const leafletInstance = cubeMap.getMapInstance();
  return new Promise(resolve => {
    (leafletInstance as L.Map).once(event as string, ()=>{
      resolve()
    });
  })
}

/**
 * 添加 gis marker
 */
export const addGisMarker = async (params: {
  position?: { lng: number; lat: number; };
  icon: string;
  iconSize: [number, number];
  popVNode?: VNode;
  onClick?: (marker: L.Marker) => void;
}): Promise<L.Marker>=>{
  const { cubeMap } = getMapInstance()
  return cubeMap.addMarker({
    icon: params.icon,
    iconSize: params.iconSize,
    position: params.position ?? { lng: cubeMap.getMapInfo().center.lng, lat: cubeMap.getMapInfo().center.lat },
    onClick: (marker: L.Marker)=>{
      params.onClick?.(marker)
      if (params.popVNode){
        if (marker.getPopup()){
          marker.unbindPopup();
        }
        const rootDom = document.createElement('div')
        const popupAppInstance = createApp({
          setup () {
            return (): JSX.Element => h(params.popVNode, {
              onClose: (): void => {
                marker.closePopup()
                setTimeout(() => {
                  popupAppInstance.unmount()
                }, 1000);
              },
            })
          },
        })
        popupAppInstance.mount(rootDom).$nextTick(() => {
          marker.bindPopup(rootDom, {
            maxWidth: 10000,
            closeButton: false,
          })
          marker.openPopup()
        })
      }
    }
  })
}

/** 按照经纬度组 画区域 */
export const drawGisPolygon = async (positions: { lng: number; lat: number; }[], fitBounds = false): Promise<void>=>{
  const { cubeMap } = getMapInstance()
  const polygon = cubeMap.createPolygon(positions, '#8797dc', 5, 'rgba(48,90,206,0.80)')
  if (!fitBounds){
    return
  }
  return new Promise((resolve) => {
    const leafletInstance = cubeMap.getMapInstance();
    
    setTimeout(() => {
      leafletInstance.fitBounds(polygon.getBounds(), {
        // 添加水平方向的padding，确保内容在可视区域内居中显示
        paddingTopLeft: [400, 0], // 左侧面板宽度为400px
        paddingBottomRight: [400, 0], // 右侧面板宽度为400px
        maxZoom: 18 // 限制最大缩放级别，防止过度放大
      });
    }, 0);
    
    const timer = setTimeout(async () => {
    // 超时判断
      resolve()
    }, 300);
    Promise.all([
      asyncMapEventEnd('zoomend'),
      asyncMapEventEnd('moveend')
    ]).then(() => {
      timer && clearTimeout(timer)
      resolve()
    })
  })

}

/** 清除地图标记、线、圆等 */
export function clearMap (): void {
  const { cubeMap } = getMapInstance()
  cubeMap.clearMap()
  // clearClusteredMarkers()
}
/** 绘制 GeoJson 数据 */
export const drawLayerByGeoJson = async (data, fitBounds = false): Promise<void>=>{  
  const { cubeMap } = getMapInstance()
  
  // 检查mapType，如果是TD_MAP，需要转换GeoJSON中的坐标
  let processedData = data;
  if (cubeMap.getMapType() === 'TD_MAP' && data.features) {
    processedData = JSON.parse(JSON.stringify(data));
    processedData.features.forEach(feature => {
      if (feature.geometry.type === 'Polygon') {
        feature.geometry.coordinates.forEach(ring => {
          const positions = ring.map(coord => ({
            lng: Number(coord[0]),
            lat: Number(coord[1])
          }));
          const tempPolygon = cubeMap.createPolygon(positions);
          const transformedPositions = tempPolygon.getLatLngs()[0];
          
          if (Array.isArray(transformedPositions) && transformedPositions.length > 0) {
            if (!Array.isArray(transformedPositions[0])) {
              const latLngArray = transformedPositions as L.LatLng[];
              for (let index = 0; index < latLngArray.length; index++) {
                const pos = latLngArray[index];
                ring[index][0] = pos.lng;
                ring[index][1] = pos.lat;
              }
            }
          }
          tempPolygon.remove();
        });
      } else if (feature.geometry.type === 'MultiPolygon') {
        feature.geometry.coordinates.forEach(polygon => {
          polygon.forEach(ring => {
            const positions = ring.map(coord => ({
              lng: Number(coord[0]),
              lat: Number(coord[1])
            }));
            const tempPolygon = cubeMap.createPolygon(positions);
            const transformedPositions = tempPolygon.getLatLngs()[0];
            
            if (Array.isArray(transformedPositions) && transformedPositions.length > 0) {
              if (!Array.isArray(transformedPositions[0])) {
                const latLngArray = transformedPositions as L.LatLng[];
                for (let index = 0; index < latLngArray.length; index++) {
                  const pos = latLngArray[index];
                  ring[index][0] = pos.lng;
                  ring[index][1] = pos.lat;
                }
              }
            }
            tempPolygon.remove();
          });
        });
      }
    });
  }
  
  const layer = cubeMap.drawLayerByGeoJson(processedData, {
    style: {
      color: '#214394',
      weight: 2,
      fillColor: '#214394',
      fillOpacity: 0.2
    }
  })
  
  const leafletInstance = cubeMap.getMapInstance();
  if (!fitBounds){
    return
  }
  
  setTimeout(() => {
    leafletInstance.fitBounds(layer.getBounds(), {
      // padding: [50, 50],
      // maxZoom: 14
    });
  }, 0);
  
  await Promise.all([
    asyncMapEventEnd('zoomend'),
    asyncMapEventEnd('moveend')
  ])
}
/** 聚焦某个地图标记 */
export const focusMarker = (marker: L.Marker, zoom: number): void=>{
  const { cubeMap } = getMapInstance()
  const position = marker.getLatLng()
  cubeMap.setCenter(position.lng, position.lat)
  cubeMap.setZoom(zoom)
}

/** 记录当前地图状态 */
export const recordMapStatus = (): ReturnType<CubeMapLeaflet['recordMapStatus']>=>{
  const { cubeMap } = getMapInstance()
  return cubeMap.recordMapStatus()
}

/** 恢复地图状态 */
export const recoverMapStatus = (): void=>{
  const { cubeMap } = getMapInstance()
  cubeMap.recoverMapStatus()
}

/** 定位到指定位置 */
export const setCenter = async (position: { lng: number; lat: number; }, zoom?: number): Promise<void>=>{
  const { cubeMap } = getMapInstance()
  await cubeMap.setCenter(position.lng, position.lat)
  zoom && await cubeMap.setZoom(zoom)
}

/** 设置缩放 */
export const setZoom = async (zoom: number): Promise<void>=>{
  const { cubeMap } = getMapInstance()
  await cubeMap.setZoom(zoom)
}

/** 根据经纬度获取地址 */
export const getAddressByLngLat = async (lng: number, lat: number): Promise<string>=>{
  const { cubeMap } = getMapInstance()
  const { address } = await cubeMap.getAddressByLntLat(lng, lat)
  return address
}




/**
 * 初始化点聚合图层
 * @param options 聚合配置选项
 */
export const initMarkerCluster = (options?: {
  maxClusterRadius?: number; // 聚合半径，默认80
  disableClusteringAtZoom?: number; // 禁用聚合的缩放级别，小于该级别时聚合，大于该级别时不聚合
  spiderfyOnMaxZoom?: boolean; // 当点击聚合点时是否展开显示所有点
}): void => {
  const { cubeMap } = getMapInstance();
  cubeMap.initClusterLayer(options);
}

/**
 * 添加聚合标记点
 * @param params 标记点参数
 * @returns 创建的标记点
 */
export const addClusteredGisMarker = async (params: {
  position?: { lng: number; lat: number; };
  icon: string;
  iconSize: [number, number];
  popVNode?: VNode;
  onClick?: (marker: L.Marker) => void;
}): Promise<L.Marker> => {
  const { cubeMap } = getMapInstance();
  const position = params.position ?? { lng: cubeMap.getMapInfo().center.lng, lat: cubeMap.getMapInfo().center.lat }
  return cubeMap.addClusteredMarker({
    icon: params.icon,
    iconSize: params.iconSize,
    position: position,
    onClick: (marker: L.Marker) => {
      params.onClick?.(marker);
      if (params.popVNode) {
        if (marker.getPopup()) {
          marker.unbindPopup();
        }
        cubeMap.setRealCenter( position.lng,  position.lat)
        const rootDom = document.createElement('div');
        const popupAppInstance = createApp({
          setup() {
            return (): JSX.Element => h(params.popVNode, {
              onClose: (): void => {
                marker.closePopup();
                setTimeout(() => {
                  popupAppInstance.unmount();
                }, 1000);
              },
            });
          },
        });
        popupAppInstance.mount(rootDom).$nextTick(() => {
          marker.bindPopup(rootDom, {
            maxWidth: 10000,
            closeButton: false,
          });
          marker.openPopup();
        });
      }
    }
  });
}

/**
 * 清除所有聚合标记点
 */
// export const clearClusteredMarkers = (): void => {
//   const { cubeMap } = getMapInstance();
//   cubeMap.clearClusteredMarkers();
// }
