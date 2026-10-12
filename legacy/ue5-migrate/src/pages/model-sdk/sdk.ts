import { useStateStore } from '../state/use-state-store'
import { UE5SDK } from './ue-sdk'
import { WebGlSDK } from './web-gl-sdk'
import type { ModelSDK } from './model-sdk'
import { ConfigLoader } from '../config-loader'
import { getPerspective } from '@/utils/common'
import type { CubeWeb3DEvents } from '@ghcloud/cube-visual-sdk/src/web-3d/web-3d'
import { WebGisSDK } from './web-gis'
import type { CubeMapLeaflet } from '@ghcloud/cube-map-plugins'

export class ModelCall {
  private readonly parent: ModelSDK
  public constructor () {
    const { renderType } = useStateStore()
    if (renderType === 'UE5') {
      this.parent = new UE5SDK()
    } else if (renderType === 'GIS'){
      this.parent = new WebGisSDK()
    } else {
      this.parent = new WebGlSDK()
    }
  }

  public modelClickEventRegister ({
    onIconLabelClick
  }: {
    onIconLabelClick: (eventProps: CubeWeb3DEvents['icon-label-click']) => void;
  }): void {
    this.parent.onIconLabelClick(onIconLabelClick)
  }

  /**
   * 初始化模型
   */
  public async initModal (dom: HTMLElement | HTMLCanvasElement): Promise<void> {
    const { renderType } = useStateStore()

    let modelPath = ConfigLoader.config.modelPath
    // let modelPath = 'wss://cube-ue.guhecloud.com:3000/97/2/'
    if (renderType === 'UE5' && navigator.userAgent.includes('UnrealEngine')) {
      modelPath = 'ws://localhost:8080'
    }
    await this.parent.initModal(dom, modelPath)
  }

  /**
   * 等待模型加载完成
   */
  public async waitModalLoad (): Promise<void> {
    await this.parent.waitModalLoad()
  }

  /**
   * 设置时间（例如一天中的时间）
   */
  public setTimeOfDay (value: string): void {
    this.parent.setTimeOfDay(value)
  }

  /**
   * 更改模型天气
   */
  public changeModelWeather (value: string): void {
    this.parent.changeModelWeather(value)
  }

  /**
   * 更改相机视图
   */
  public changeCameraView (value: Record<string, unknown>): void {
    this.parent.changeCameraView(value)
  }

  /**
   * 显示停车场车辆
   */
  public updateParkingVehicles (value: Record<string, unknown>): void {
    this.parent.updateParkingVehicles(value)
  }

  /**
   * 分布热力图
   */
  public coordPointsHeatMap (value: Record<string, unknown>): void {
    this.parent.coordPointsHeatMap(value)
  }

  /**
   * 清空热力图
   */
  public clearAllCoordPointsHeatMap (): void {
    this.parent.clearAllCoordPointsHeatMap()
  }

  /**
   * 切换漫游模式
   */
  public changRoam (value: boolean): void {
    this.parent.changRoam(value)
  }

  /**
   * 隐藏指定演员
   */
  public hideActor (value: Record<string, unknown>): void {
    this.parent.hideActor(value)
  }

  /**
   * 显示指定演员
   */
  public showActor (value: Record<string, unknown>): void {
    this.parent.showActor(value)
  }

  /**
   * 更改触摸界面
   */
  public changeTouchInterface (value: boolean): void {
    this.parent.changeTouchInterface(value)
  }

  /**
   * 模型聚焦（传入actorId）
   */
  public focusActor (value: string): void {
    this.parent.focusActor(value)
  }

  /**
   * 删除标签（楼栋标签｜设备标签）
   */
  public removePoiByType (value): void {
    this.parent.removePoiByType(value)
  }

  /**
   * 打区域文字标签
   */
  public async addAreaBuildTextIcon (areaListData): Promise<void> {
    const ueBuild = []
    for (let i = 0; i < areaListData.length; i++) {
      if (areaListData[i].aliasName && (areaListData[i].visualizationAreaType === 'BUILDING' || areaListData[i].visualizationAreaType === 'OTHER')){
        const data = {
          id: '',
          buildTagLocation: '',
          actorId: '',
          aliasName: '',
          name: '',
          modalNames: '',
          visualizationAreaType: ''
        }
        const buildValue = await this.parent.getActorByName(areaListData[i].aliasName)
        if (!buildValue.id){
          continue
        }
        const perspective = getPerspective(areaListData[i].modalNames ?? areaListData[i].name);
        data.buildTagLocation = null;
        data.actorId = buildValue.id;
        data.id = areaListData[i].id
        data.aliasName = areaListData[i].aliasName
        data.name = areaListData[i].name
        data.modalNames = areaListData[i].modalNames
        data.visualizationAreaType = areaListData[i].visualizationAreaType
        if (perspective && perspective.buildTagLocation) {
          data.buildTagLocation = perspective.buildTagLocation;
        }
        ueBuild.push(data)
      }
    }
    const textPoiData = ueBuild.map((item) => {
      if (item.actorId || item.id || item.buildTagLocation){
        return {
          text: item.name,
          targetActorId: item.buildTagLocation ? '' : item.actorId || item.id || '',
          scale: 1.5,
          location: item.buildTagLocation,
          props: {
            ...item,
            iconType: "area",
            aliasName: item.modalNames || item.aliasName,
          },
        }
      }
    }).filter(e=>e)
    this.parent.addIconTextPoiBatch(textPoiData)
  }

  /**
   * 打设备标签
   */
  public addDeviceIcon (deviceListData: {
    deviceId: string;
    deviceCode: string;
    prodCategoryName: string;
  }[]): void {
    this.parent.addIconDevicePoiBatch(deviceListData)
  }

  /**
   * 重置模型
   */
  public resetModel (): void {
    this.parent.resetModel()
  }

  /**
   * 过滤显示楼层（显示目标楼层并自动隐藏比目标楼层高的所有楼层）
   */
  public showBuildingFloor (value): void {
    this.parent.showBuildingFloor(value)
  }
  /**
   * 显示楼栋 恢复楼栋被隐藏的楼层
   */
  public showBuilding (buildingName: string): void {
    this.parent.showBuilding(buildingName)
  }

  public async getActorByName (value: Record<string, unknown>): Promise<{ id: string; actorId?: string; }> {
    return this.parent.getActorByName(value)
  }

  public positioningPerspective (value): void {
    this.parent.positioningPerspective(value)
  }

  public async getCameraPosition (): Promise<Record<string, unknown>> {
    return this.parent.getCameraPosition()
  }

  public stopSequenceAll (): void{
    this.parent.stopSequenceAll()
  }

  public removeAllEffect (): void {
    this.parent.removeAllEffect()
  }

  public getGisMapInstance (): {
    cubeMap: CubeMapLeaflet;
    leafletInstance: any;
  } {
    return (this.parent as WebGisSDK)?.getMapInstance()
  }

}
export const modelSDK = new ModelCall()