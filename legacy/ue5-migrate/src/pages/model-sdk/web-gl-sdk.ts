import { type ArcRotateCamera, cubeWeb3DInstance } from '@ghcloud/cube-visual-sdk'
import { ModelSDK } from './model-sdk'
import type { TimeEnum, WeatherEnum } from '@ghcloud/cube-visual-sdk/src/web-3d/tools/environment-helper'
import type { CubeWeb3DEvents, ViewAngleParameter } from '@ghcloud/cube-visual-sdk/src/web-3d/web-3d'
import { ConfigLoader } from '../config-loader'

export class WebGlSDK extends ModelSDK {
  private modelPath = ''
  public constructor () {
    cubeWeb3DInstance.setTexturesPath('/apps-legacy/ue5/textures')
    super()
  }

  public async waitModalLoad (): Promise<void> {
    await cubeWeb3DInstance.loadModel(this.modelPath)
    // 切换为默认视角
    ConfigLoader.config.modelPerspective[0] && this.changeCameraView({ ...JSON.parse(ConfigLoader.config.modelPerspective[0].value) })
  }
  /** 标签点击事件 */
  public onIconLabelClick (callback: (eventProps: CubeWeb3DEvents['icon-label-click']) => void): void {
    cubeWeb3DInstance.onIconLabelClick(callback)
  }

  public async initModal (dom: HTMLCanvasElement, modelPath: string): Promise<void> {
    await cubeWeb3DInstance.initScene(dom)
    this.modelPath = modelPath
  }

  public setTimeOfDay (value: TimeEnum): void {
    cubeWeb3DInstance._modelTime = value
  }

  public changeModelWeather (value: WeatherEnum): void {
    cubeWeb3DInstance._modelWeather = value
  }

  public changRoam (value: boolean): void {
    cubeWeb3DInstance.toggleRotateAroundCameraTarget(value)
  }

  public resetModel (): void {
    cubeWeb3DInstance.resetModel()
  }

  public changeCameraView (value: ViewAngleParameter): void {
    cubeWeb3DInstance.flyTo(value)
  }

  public changeTouchInterface (): void {
    // TODO 打开退出驾驶模式
  }

  /** 根据名称获取构件信息 */
  public async getActorByName (name: string): Promise<{ id: string; }> {
    const res = cubeWeb3DInstance.getNodeByName(name)
    return {
      id: res.id
    }
  }

  /**
   * 批量添加文字标签
  */
  public addIconTextPoiBatch (data: {
    text: string;
    targetActorId: string;
    scale: number;
    location: string;
    props: Record<string, unknown>;
  }[]): void {
    const params = data.map(item => {
      return {
        text: item.text,
        nodeId: item.targetActorId,
        scale: item.scale,
        location: item.location,
        props: item.props,
      }
    })
    data.length && cubeWeb3DInstance.addBuildingLabels(params)
  }

  /** 批量添加设备标签 */
  public addIconDevicePoiBatch (data: {
    deviceId: string;
    deviceCode: string;
    prodCategoryName: string;
    onlineState: boolean;
  }[]): void {
    data.length && cubeWeb3DInstance.addDeviceLabels(data.map(item => {
      return {
        nodeName: item.deviceCode,
        props: item,
        type: item.onlineState ? "SUCCESS" : "ERROR"
      }
    }))
  }

  /**
   * 删除标签
  */
  public removePoiByType (type: 'all' | 'icon' | "iconText"): void {
    let myType: "ALL" | "DEVICE" | "BUILDING" = 'ALL';
    type === 'all' && (myType = 'ALL');
    type === 'icon' && (myType = 'DEVICE');
    type === 'iconText' && (myType = 'BUILDING');
    cubeWeb3DInstance.removeLabels(myType)
  }

  /** 定位视角 */
  public positioningPerspective (value): void {
    let camera = ConfigLoader.getPerspectiveByName(value.areaName)?.camera
    if (camera) {
      this.changeCameraView(JSON.parse(camera))
    } else {
      cubeWeb3DInstance.focusCameraOnNodeById(value.aliasName)
    }
  }

  public showBuildingFloor (params: {
    buildingName: string;
    floorName: string;
  }): void {
    cubeWeb3DInstance.showBuildingFloor(params.floorName)
  }

  public showBuilding (buildingName: string): void {
    cubeWeb3DInstance.showBuilding(buildingName)
  }

  public focusActor (nodeName: string): void {
    const node = cubeWeb3DInstance.getNodeByName(nodeName, true)
    cubeWeb3DInstance.focusCameraOnNodeById(node.id)
  }

  public showActor (nodeName: string): void {
    const node = cubeWeb3DInstance.getNodeByName(nodeName, true)
    node.setEnabled(true)
  }
  public hideActor (nodeName: string): void {
    const node = cubeWeb3DInstance.getNodeByName(nodeName, true)
    node.setEnabled(false)
  }
  public showShell (nodeName: string): void {
    const node = cubeWeb3DInstance.getNodeByName(nodeName, true)
    cubeWeb3DInstance.flashBoundingBoxById(node.id)
  }

  public async getCameraPosition (): Promise<Record<string, unknown>> {
    const camera = cubeWeb3DInstance._scene.activeCamera as ArcRotateCamera
    return {
      target: {
        x: camera.target.x,
        y: camera.target.y,
        z: camera.target.z,
      },
      alpha: camera.alpha,
      beta: camera.beta,
      radius: camera.radius,
    }
  }

  public stopSequenceAll (): void {
    // todo: 待完善
  }
  public removeAllEffect (): void {
    // todo: 待完善
  }
}
