import { ModelSDK } from './model-sdk'
import { UeClient } from '@ghcloud/cube-visual-sdk'
import { useStateStore } from '../state/use-state-store'
import type { CubeWeb3DEvents } from '@ghcloud/cube-visual-sdk/src/web-3d/web-3d'
import { ConfigLoader } from '../config-loader'
import { DeviceIconMap } from '@ghcloud/cube-visual-sdk/src/web-3d/tools/icon-label-helper'

export class UE5SDK extends ModelSDK {
  public ueClient: UeClient
  public constructor () {
    super()
    this.ueClient = UeClient.getInstance()
  }
  /**
   * 初始化模型
  */
  public async initModal (dom: HTMLElement, modelLine: string): Promise<void> {
    this.ueClient.loadUE5(dom, modelLine)
  }
  /**
   * 模型连接成功回调
  */
  public async waitModalLoad (): Promise<void> {
    return new Promise((resolve) => {
      this.ueClient.onConnected(async () => {
        // 关闭触控界面
        this.ueClient.send('changeTouchInterface', { active: false })
        // 设置画质
        this.ueClient.send('changePictureQuality', { level: navigator.userAgent.includes('UnrealEngine') ? 'high' : 'low' })
        // 重置分辨率
        window.addEventListener('resize', this.changeResolution)
        this.changeResolution()
        this.changRoam(false)
        // 重置模型
        this.resetModel()
        // 模型时间设置为自动
        this.setTimeOfDay('auto')
        resolve()
      })
    })
  }

  public changeResolution = (): void => {
    if (!navigator.userAgent.includes('UnrealEngine')) {
      this.ueClient.send('changeResolution', {
        width: document.body.clientWidth,
        height: document.body.clientHeight,
      })
    }
  }
  /**
   * 修改模型时间
  */
  public setTimeOfDay (value: string): void {
    if (value === 'auto') {
      this.ueClient.send('setSimulateRealWorld', {
        simulate: true,
      })
    } else {
      this.ueClient.send('setSimulateRealWorld', {
        simulate: false,
      })
      const params: string[] = value.split(':')
      this.ueClient.send('setTimeOfDay', {
        hours: params[0],
        minutes: params[1],
        seconds: params[2],
      })
    }
  }
  /**
   * 修改模型天气
  */
  public changeModelWeather (value: string): void {
    this.ueClient.send('setWeather', { weather: value })
  }
  /**
   * 切换模型视角
  */
  public changeCameraView (value: string): void {
    this.ueClient.send('changeCameraView', value)
  }
  /**
   * 显示停车场车辆
  */
  public updateParkingVehicles (value: string): void {
    this.ueClient.send('updateParkingVehicles', value)
  }
  /**
   * 分布热力图
  */
  public coordPointsHeatMap (value: string): void {
    this.ueClient.send('coordPointsHeatMap', value)
  }
  /**
   * 清空热力图
  */
  public clearAllCoordPointsHeatMap (): void {
    this.ueClient.send('clearAllCoordPointsHeatMap')
  }
  /**
   * 重置模型
  */
  public async resetModel (value: { tour?: boolean; flash?: boolean; select?: boolean; poi?: boolean; effect?: boolean; } = { tour: true, flash: true, select: true, poi: true, effect: true }): Promise<void> {
    this.ueClient.send('resetModel', value)
  }
  /**
   * 切换模型画质
  */
  public changeModelQuality (value: string): void {
    this.ueClient.send('changePictureQuality', { level: value })
  }
  /**
   * 开关环游
  */
  public changRoam (value: boolean): void {
    this.ueClient.send(value ? 'startAutoRevolve' : 'stopAutoRevolve')
  }
  /**
   * 切换驾驶模式
  */
  public changeTouchInterface (value: boolean): void {
    this.ueClient.send('changeTouchInterface', { active: value })
  }
  /**
   * 根据Name查询物体
  */
  public async getActorByName (name: string): Promise<{ id: string; }> {
    return new Promise<{ id: string; }>((resolve) => {
      this.ueClient.send('getActorByName', { name }, (data: { id: string; })=>{
        resolve(data)
      })
    })
  }

  /**
   * 批量添加楼栋文字标签
  */
  public addIconTextPoiBatch (data: {
    text: string;
    targetActorId: string;
    scale: number;
    location: string;
    props: Record<string, unknown>;
  }[]): void {
    data.length && this.ueClient.send('addIconTextPoiBatch', { data })
  }

  /**
   * 聚焦构建
  */
  public focusActor (actorId: string): void {
    this.ueClient.send('focusActor', { id: actorId })
  }
  /**
   * 显示模型外壳
  */
  public showShell (value): void {
    this.ueClient.send('showShell', value)
  }
  /**
   * 隐藏对象
  */
  public hideActor (value): void {
    this.ueClient.send('hideActor', value)
  }
  /**
   * 显示对象
  */
  public showActor (value): void {
    this.ueClient.send('showActor', value)
  }
  /**
   * 获取下级区域
  */
  public async getBimTree (currentBuild, id): Promise<void> {
    const { globalState } = useStateStore()

    return new Promise<void>((resolve) => {
      this.ueClient.send('getBimtree', { id }, (children) => {
        // 创建子节点映射表用于快速查找
        const childrenMap = new Map<string, string>();
        if (children?.length) {
          children.forEach(item => childrenMap.set(item.name, item.id));
        }

        // 统一处理楼层列表更新
        globalState.business.floor = currentBuild.children.map(floor => ({
          ...floor,
          selected: true,
          modalNames: `${currentBuild.name}-${floor.name}`,
          actorId: childrenMap.get(floor.aliasName) || floor.actorId
        }));

        resolve();
      });
    });
  }
  /**
   * 定位视角
  */
  public positioningPerspective (value): void {
    let camera = ConfigLoader.getPerspectiveByName(value.areaName)?.camera
    if (camera) {
      this.changeCameraView(JSON.parse(camera))
    } else {
      this.focusActor(value.actorId)
    }
  }
  /**
   * 删除标签(楼栋标签｜设备标签)
  */
  public removePoiByType (type: 'all' | 'icon' | "iconText"): void {
    this.ueClient.send('removePoiByType', { type })
  }
  /**
   * 过滤显示楼层（显示目标楼层并自动隐藏比目标楼层高的所有楼层）
  */
  public showBuildingFloor (params: {
    buildingName: string;
    floorName: string;
  }): void {
    this.ueClient.send('showBuildingFloor', params)
  }
  /**
   * 过滤显示楼层（显示目标楼层并自动隐藏比目标楼层高的所有楼层）
  */
  public changeArea (value): void {
    const { globalState } = useStateStore()
    this.removePoiByType('all')
    this.positioningPerspective({ ...value, aliasName: value.modalNames })
    globalState.business.currentAreaLeave = 4;
    globalState.business.currentAreaId = value.id;
  }
  /**
   * 显示楼栋 恢复楼栋被隐藏的楼层
   */
  public showBuilding (buildingName: string): void {
    this.ueClient.send('showBuilding', { buildingName })
  }

  public async getCameraPosition (): Promise<Record<string, unknown>> {
    return new Promise((resolve) => {
      this.ueClient.send('getCameraView', function (cameraView) {
        resolve(cameraView)
      });
    })
  }

  /** 标签点击事件 */
  public onIconLabelClick (callback: (eventProps: CubeWeb3DEvents['icon-label-click']) => void): void {
  }

  /** 批量添加设备标签 */
  public addIconDevicePoiBatch (data: {
    deviceId: string;
    deviceCode: string;
    prodCategoryName: string;
    onlineState: boolean;
  }[]): void {
    const res = data.map(item => {
      return {
        targetActorId: item.deviceCode,
        icon: DeviceIconMap[item.prodCategoryName],
        color: item.onlineState ? 0 : 2,
        scale: window.config.otherConfig.iconScale ? window.config.otherConfig.iconScale : 1,
        props: {
          iconType: 'device',
          actorId: item.deviceCode,
          id: item.deviceId,
          code: item.deviceCode,
          prodCategory: item.prodCategoryName,
          onlineState: item.onlineState,
          deviceData: item
        }
      }
    })
    res.length && this.ueClient.send("addIconPoiBatch", { pois: res })
  }
  public stopSequenceAll (): void {
    this.ueClient.send("stopSequenceAll");
  }

  public removeAllEffect (): void {
    this.ueClient.send("removeEffectAll")
  }
}
export const ueSdk = new UE5SDK()
