import { defineStore } from 'pinia'
import type { RegionVo, PointTypeVo, PointVo, PageVo } from '@ghcloud/electronic-guide-service'
import { layerService, pointService, regionService } from '@/apis/service'
import { useMapStore } from './map-store'
import { getAssetsFile } from '@/utils'
interface ClientStoreState {
  regionList: RegionVo[];
  secondaryList: RegionVo[];
  rootId: string;
  regionId: string;
  regionTreeList: RegionVo[];
  leafList: RegionVo[];
  leafId: string;
  secondaryId: string;
  mapPointList: PointVo[];
  pointTypeList: PointTypeVo[];
  pointPage: PageVo<PointVo>;
  pointSearchParams: Parameters<typeof pointService.getPointList>[0];
  checkPointId: string;
  systemInfo: {
    name: string;
    logo: string;
  };
}
export const useClientStore = defineStore('client-store', {
  state: (): ClientStoreState => {
    return {
      regionList: [],
      rootId: '',
      regionId: '', // 当前选中的区域id
      systemInfo: {
        name: '成都农产品批发市场只能导览',
        logo: getAssetsFile('logo.png')
      },
      secondaryList: [],
      mapPointList: [],
      secondaryId: '', // 当前选中的二级区域id
      leafList: [],
      regionTreeList: [],
      checkPointId: '',
      leafId: '', // 当前选中的三级区域id
      pointTypeList: [],
      pointPage: {
        records: [],
        pages: 0,
        total: 0
      },
      pointSearchParams: {
        pageNumber: 1,
        pageSize: 6,
        keyword: '',
        areaId: '',
        typeId: '',
        state: 'ALL'
      }
    }
  },
  actions: {
    // 设置区域列表
    setRegionList (regionList: RegionVo[]) {
      this.regionList = regionList
    },
    // 设置二级区域列表
    setSecondaryList (secondaryList: RegionVo[]) {
      this.secondaryList = secondaryList
    },
    // 设置三级区域叶子级列表
    setLeafList (leafList: RegionVo[]) {
      this.leafList = leafList
    },
    // 设置点位类型数据
    setPointTypeList (pointTypeList: PointTypeVo[]) {
      this.pointTypeList = pointTypeList
    },
    // 获取点位数据
    async getPointList () {
      const params = {
        ...this.pointSearchParams,
        sequence: true
      }
      if (this.rootId && (this.rootId === this.pointSearchParams.areaId)) {
        params.areaId = undefined
      }
      const result = await pointService.getPointList(params)
      this.pointPage = result
    },
    // 增加点位到地图上
    async addPointMarkerToMap  (): Promise<void> {
      const mapStore = useMapStore()
      mapStore.getMapInstance.clearMark()
      mapStore.getMapInstance.closeInfoWindow()
      mapStore.getMapInstance.clearWalkPlan()
      const result = await pointService.getPointList({
        ...this.pointSearchParams,
        pageNumber: 1,
        pageSize: 10000,
      })
      for (const record of result.records) {
        const lngLat = record.coordinate.split(',').reverse().map(item => +item) as [number, number]
        mapStore.getMapInstance.addPointMark(lngLat, record.typeFilePath, record)
      }

      // mapStore.getMapInstance.addClusterMark(result.records)
    },
    // 区域id改变的动作
    async areaIdChangeAction (): Promise<void> {
      const mapStore = useMapStore()
      this.checkPointId = ''
      this.pointSearchParams.pageNumber = 1
      this.pointSearchParams.keyword = ''
      mapStore.getMapInstance.closeInfoWindow()
      mapStore.getMapInstance.clearWalkPlan()
      await this.getRegionLayerInfo()
      await this.addPointMarkerToMap()
      await this.getPointList()
    },
    // 获取区域层级信息
    async getRegionLayerInfo  (): Promise<void> {
      const mapStore = useMapStore()
      const result = await layerService.getAreaLayerInfo({
        areaId: this.pointSearchParams.areaId as unknown as string
      })
      if (!result) {
        const areaInfo = await regionService.getRegionById(this.pointSearchParams.areaId as unknown as string)
        const centerLat = Number(areaInfo.coordinate.split(',')[0])
        const centerLng = Number(areaInfo.coordinate.split(',')[1])
        mapStore.getMapInstance.setCenter(centerLat, centerLng)
        mapStore.getMapInstance.setZoom(+areaInfo.zoom)
        return
      }
      const layerPayload = {
        southwest: result.southwest,
        northeast: result.northeast,
        center: result.area.coordinate,
        layerFile: result.layerFile,
      }
      if (mapStore.getMapInstance.currentLayerFile === layerPayload.layerFile) {
        const centerLat = Number(layerPayload.center.split(',')[0])
        const centerLng = Number(layerPayload.center.split(',')[1])
        mapStore.getMapInstance.setZoom(+result.area.zoom)
        mapStore.getMapInstance.setCenter(centerLat, centerLng)
        return
      }
      mapStore.getMapInstance.removeMapImageLayer()
      mapStore.getMapInstance.setZoom(+result.area.zoom)
      mapStore.getMapInstance.setMapImageLayer(layerPayload)
    }
  }
})
